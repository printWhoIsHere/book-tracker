import { v4 as uuidv4 } from 'uuid'

import { NotFoundError } from '@main/core/errors'
import { config } from '@main/core/config'
import { createLogger } from '@main/core/logger'
import { FileManager } from '@main/utils/file.manager'
import { DatabaseManager } from '@main/database/database.manager'

import {
	getWorkspacePaths,
	validateWorkspaceExists,
	validateUniqueWorkspaceName,
	validateWorkspaceLimit,
} from '@main/utils/workspace'
import { WorkspaceRecord, WorkspaceSettings } from './workspace.schema'
import { WorkspaceRepository } from './workspace.repository'

const logger = createLogger('WorkspaceService')

export class WorkspaceService {
	private readonly fileManager: FileManager
	private readonly dbManager: DatabaseManager
	private readonly repo: WorkspaceRepository

	constructor() {
		this.fileManager = new FileManager('', config.rootDir)
		this.dbManager = DatabaseManager.getInstance()
		this.repo = new WorkspaceRepository()
	}

	async create(name: string): Promise<string> {
		const workspaces = this.repo.listWorkspaces()

		validateWorkspaceLimit(workspaces)
		validateUniqueWorkspaceName(workspaces, name)

		const id = uuidv4()
		const now = new Date().toISOString()
		const record: WorkspaceRecord = { id, name, createdAt: now }

		try {
			const paths = getWorkspacePaths(id)
			await this.dbManager.create(paths.relativeDatabasePath, 'books')

			this.repo.addWorkspace(record)
			this.repo.setActiveId(id)

			logger.info(`Workspace created successfully: ${id} (${name})`)
			return id
		} catch (error) {
			// Rollback при ошибке
			logger.error(`Failed to create workspace: ${id}`, error)

			try {
				const existingWorkspaces = this.repo.listWorkspaces()
				if (existingWorkspaces.some((w) => w.id === id)) {
					this.repo.removeWorkspace(id)
				}

				const paths = getWorkspacePaths(id)
				try {
					this.dbManager.close(paths.relativeDatabasePath)
				} catch (dbError) {
					// Игнорируем ошибки закрытия несуществующей БД
				}

				if (await this.fileManager.exists(paths.relativeWorkspacePath)) {
					await this.fileManager.delete(paths.relativeWorkspacePath)
				}
			} catch (rollbackError) {
				logger.error(
					`Failed to rollback workspace creation: ${id}`,
					rollbackError,
				)
			}

			throw error
		}
	}

	list(): WorkspaceRecord[] {
		return this.repo.listWorkspaces()
	}

	getActive(): WorkspaceRecord | null {
		const activeId = this.repo.getActiveId()
		if (!activeId) return null

		const workspace = this.repo.listWorkspaces().find((w) => w.id === activeId)
		return workspace || null
	}

	setActive(id: string): void {
		const workspaces = this.repo.listWorkspaces()
		validateWorkspaceExists(workspaces, id)
		this.repo.setActiveId(id)
	}

	getById(id: string): WorkspaceRecord {
		const workspace = this.repo.findWorkspaceById(id)
		if (!workspace) {
			throw new NotFoundError('Workspace', id)
		}
		return workspace
	}

	async update(
		id: string,
		updates: Partial<WorkspaceRecord>,
	): Promise<WorkspaceRecord> {
		const workspaces = this.repo.listWorkspaces()
		validateWorkspaceExists(workspaces, id)

		if (updates.name) {
			validateUniqueWorkspaceName(workspaces, updates.name, id)
		}

		const updateData = {
			...updates,
			updatedAt: new Date().toISOString(),
		}

		this.repo.updateWorkspace(id, updateData)
		logger.info(`Workspace updated: ${id}`)

		return this.getById(id)
	}

	async delete(id: string): Promise<void> {
		const workspace = this.getById(id)

		try {
			const paths = getWorkspacePaths(id)
			this.dbManager.close(paths.relativeDatabasePath)

			if (await this.fileManager.exists(paths.relativeWorkspacePath)) {
				await this.fileManager.delete(paths.relativeWorkspacePath)
			}

			this.repo.removeWorkspace(id)

			logger.info(`Deleted workspace: ${id} (${workspace.name})`)
		} catch (error) {
			logger.error(`Failed to delete workspace: ${id}`, error)
			throw error
		}
	}

	getSettings(id: string): WorkspaceSettings {
		const workspaces = this.repo.listWorkspaces()
		validateWorkspaceExists(workspaces, id)
		return this.repo.getSettings(id)
	}

	async updateSettings(
		id: string,
		patch: Partial<WorkspaceSettings>,
	): Promise<void> {
		const workspaces = this.repo.listWorkspaces()
		validateWorkspaceExists(workspaces, id)
		this.repo.updateSettings(id, patch)
	}

	// Утилитарные методы для работы с файлами workspace
	async exportWorkspace(id: string): Promise<any> {
		const workspace = this.getById(id)
		const settings = this.getSettings(id)

		// TODO: Можно добавить экспорт данных из базы данных
		// const data = await this.dbManager.exportData(`workspaces/${id}/database.db`)

		return {
			workspace,
			settings,
			// data,
			exportedAt: new Date().toISOString(),
		}
	}

	async getWorkspaceSize(id: string): Promise<number> {
		this.getById(id)

		const paths = getWorkspacePaths(id)
		if (await this.fileManager.exists(paths.relativeWorkspacePath)) {
			return await this.fileManager.getDirectorySize(
				paths.relativeWorkspacePath,
			)
		}

		return 0
	}

	async getDatabaseStats(
		id: string,
	): Promise<{ totalBooks: number; databaseSize: number }> {
		this.getById(id)

		try {
			const paths = getWorkspacePaths(id)
			const stats = await this.dbManager.getStats(paths.relativeDatabasePath)

			return {
				totalBooks: stats.records,
				databaseSize: stats.size,
			}
		} catch (error) {
			logger.error(`Failed to get database stats for workspace: ${id}`, error)
			return { totalBooks: 0, databaseSize: 0 }
		}
	}

	async vacuumDatabase(id: string): Promise<void> {
		this.getById(id)

		const paths = getWorkspacePaths(id)
		await this.dbManager.vacuum(paths.relativeDatabasePath)
		logger.info(`Database vacuumed for workspace: ${id}`)
	}

	async getWorkspaceStats(id: string): Promise<any> {
		this.getById(id)

		const [dbStats, workspace] = await Promise.all([
			this.getDatabaseStats(id),
			Promise.resolve(this.getById(id)),
		])

		return {
			totalBooks: dbStats.totalBooks,
			databaseSize: dbStats.databaseSize,
			lastModified: workspace.updatedAt || workspace.createdAt,
		}
	}
}
