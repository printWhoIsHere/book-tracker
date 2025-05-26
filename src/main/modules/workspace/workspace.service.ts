import { v4 as uuid } from 'uuid'
import { createLogger } from '@main/core/logger'
import { ValidationError, ConflictError } from '@main/core/errors'
import { DatabaseManager } from '@main/database/database.manager'

import { WorkspaceRepository } from './workspace.repository'
import type {
	WorkspaceRecord,
	WorkspaceSettings,
	CreateWorkspace,
	UpdateWorkspace,
	WorkspacePaths,
	DeepPartial,
} from './workspace.schema'
import {
	CreateWorkspaceSchema,
	UpdateWorkspaceSchema,
	defaultSettings,
} from './workspace.schema'

const logger = createLogger('WorkspaceService')

export class WorkspaceService {
	private dbManager: DatabaseManager
	private repo: WorkspaceRepository

	constructor() {
		this.dbManager = DatabaseManager.getInstance()
		this.repo = WorkspaceRepository.getInstance()
	}

	async create(data: CreateWorkspace): Promise<WorkspaceRecord> {
		logger.info(`Creating workspace: ${data.name}`)

		const validated = CreateWorkspaceSchema.parse(data)

		const existing = this.repo.getAll()
		if (
			existing.some(
				(w) => w.name.toLowerCase() === validated.name.toLowerCase(),
			)
		) {
			throw new ConflictError(
				`Workspace with name "${validated.name}" already exists`,
			)
		}

		const workspace: WorkspaceRecord = {
			id: uuid(),
			name: validated.name,
			createdAt: new Date().toISOString(),
		}

		try {
			await this.repo.createWorkspaceDir(workspace.id)

			await this.repo.saveSettings(workspace.id, { ...defaultSettings })

			const dbPath = this.getPaths(workspace.id).relDatabasePath
			await this.dbManager.create(dbPath, 'books')

			this.repo.save(workspace)

			if (existing.length === 0) {
				this.repo.setActiveId(workspace.id)
				logger.info(`Set first workspace as active: ${workspace.id}`)
			}

			logger.info(`Workspace created successfully: ${workspace.id}`)
			return workspace
		} catch (error) {
			// Rollback при ошибке
			logger.error(`Failed to create workspace: ${workspace.id}`, error)
			await this.rollbackWorkspaceCreation(workspace.id)
			throw error
		}
	}

	list(): WorkspaceRecord[] {
		return this.repo.getAll()
	}

	async getActive(): Promise<WorkspaceRecord | null> {
		const activeId = this.repo.getActiveId()
		if (!activeId) {
			return null
		}

		try {
			await this.repo.validateWorkspaceExists(activeId)
			return this.repo.getById(activeId)
		} catch (error) {
			logger.warn(`Active workspace ${activeId} is invalid, clearing`, error)
			this.repo.setActiveId(null)
			return null
		}
	}

	async setActive(id: string | null): Promise<void> {
		if (id === null) {
			this.repo.setActiveId(null)
			logger.info('Active workspace cleared')
			return
		}

		await this.repo.validateWorkspaceExists(id)

		this.repo.setActiveId(id)
		logger.info(`Active workspace set: ${id}`)
	}

	async getById(id: string): Promise<WorkspaceRecord> {
		await this.repo.validateWorkspaceExists(id)
		return this.repo.getById(id)!
	}

	async update(id: string, updates: UpdateWorkspace): Promise<WorkspaceRecord> {
		logger.info(`Updating workspace: ${id}`)

		const validated = UpdateWorkspaceSchema.parse(updates)

		const workspace = await this.getById(id)

		const newName = validated.name
		if (newName && newName !== workspace.name) {
			const existing = this.repo.getAll()
			if (
				existing.some(
					(w) => w.id !== id && w.name.toLowerCase() === newName.toLowerCase(),
				)
			) {
				throw new ConflictError(
					`Workspace with name "${newName}" already exists`,
				)
			}
		}

		const updated: WorkspaceRecord = {
			...workspace,
			...validated,
			updatedAt: new Date().toISOString(),
		}

		this.repo.save(updated)
		logger.info(`Workspace updated: ${id}`)

		return updated
	}

	async delete(id: string): Promise<void> {
		logger.info(`Deleting workspace: ${id}`)

		await this.repo.validateWorkspaceExists(id)

		const workspaces = this.repo.getAll()
		if (workspaces.length === 1) {
			throw new ValidationError('Cannot delete the last workspace')
		}

		try {
			const dbPath = this.getPaths(id).relDatabasePath
			this.dbManager.close(dbPath)

			await this.repo.removeWorkspaceDir(id)

			this.repo.remove(id)
			this.repo.clearSettingsCache(id)

			const activeId = this.repo.getActiveId()
			if (activeId === id) {
				const remaining = this.repo.getAll()
				const newActiveId = remaining.length > 0 ? remaining[0].id : null
				this.repo.setActiveId(newActiveId)
				logger.info(`New active workspace set: ${newActiveId}`)
			}

			logger.info(`Workspace deleted: ${id}`)
		} catch (error) {
			logger.error(`Failed to delete workspace: ${id}`, error)
			throw error
		}
	}

	async getSettings(id: string): Promise<WorkspaceSettings> {
		await this.repo.validateWorkspaceExists(id)
		return await this.repo.getSettings(id)
	}

	async setSettings(
		id: string,
		patch: DeepPartial<WorkspaceSettings>,
	): Promise<WorkspaceSettings> {
		logger.info(`Updating settings for workspace: ${id}`)

		await this.repo.validateWorkspaceExists(id)

		const currentSettings = await this.repo.getSettings(id)

		const updatedSettings = this.deepMerge(currentSettings, patch)

		await this.repo.saveSettings(id, updatedSettings)

		logger.info(`Settings updated for workspace: ${id}`)
		return updatedSettings
	}

	getPaths(id: string): WorkspacePaths {
		return this.repo.getPaths(id)
	}

	async getStats(id: string): Promise<{
		workspace: WorkspaceRecord
		files: {
			size: number
			filesCount: number
			hasDatabase: boolean
			hasSettings: boolean
		}
		database?: {
			size: number
			records: number
		}
	}> {
		await this.repo.validateWorkspaceExists(id)

		const workspace = this.repo.getById(id)!
		const files = await this.repo.getWorkspaceStats(id)

		const result: any = { workspace, files }

		if (files.hasDatabase) {
			try {
				const dbPath = this.getPaths(id).relDatabasePath
				result.database = await this.dbManager.getStats(dbPath)
			} catch (error) {
				logger.warn(`Failed to get database stats for ${id}`, error)
			}
		}

		return result
	}

	async export(id: string): Promise<{
		workspace: WorkspaceRecord
		settings: WorkspaceSettings
		data?: any
	}> {
		await this.repo.validateWorkspaceExists(id)

		const workspace = this.repo.getById(id)!
		const settings = await this.repo.getSettings(id)

		const result: any = { workspace, settings }

		try {
			const dbPath = this.getPaths(id).relDatabasePath
			result.data = await this.dbManager.exportData(dbPath)
		} catch (error) {
			logger.warn(`Failed to export database for ${id}`, error)
		}

		return result
	}

	// Private methods

	private async rollbackWorkspaceCreation(id: string): Promise<void> {
		try {
			this.repo.remove(id)
			await this.repo.removeWorkspaceDir(id)

			try {
				const dbPath = this.getPaths(id).relDatabasePath
				this.dbManager.close(dbPath)
			} catch {}

			logger.info(`Workspace creation rolled back: ${id}`)
		} catch (error) {
			logger.error(`Failed to rollback workspace creation: ${id}`, error)
		}
	}

	private deepMerge(target: any, source: any): any {
		const result = { ...target }

		for (const key in source) {
			if (
				source[key] !== null &&
				typeof source[key] === 'object' &&
				!Array.isArray(source[key])
			) {
				result[key] = this.deepMerge(target[key] || {}, source[key])
			} else {
				result[key] = source[key]
			}
		}

		return result
	}
}
