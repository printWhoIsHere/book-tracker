import path from 'path'
import { globalStoreManager } from '@main/core/store'
import { FileManager } from '@main/utils/file.manager'
import { config } from '@main/core/config'
import { createLogger } from '@main/core/logger'
import { ValidationError, NotFoundError } from '@main/core/errors'

import type {
	WorkspaceRecord,
	WorkspaceSettings,
	WorkspacePaths,
} from './workspace.schema'
import { WorkspaceSettingsSchema, defaultSettings } from './workspace.schema'

const logger = createLogger('WorkspaceRepository')

export class WorkspaceRepository {
	private static instance: WorkspaceRepository
	private settingsCache = new Map<string, WorkspaceSettings>()
	private fileManager: FileManager

	private constructor() {
		this.fileManager = new FileManager('workspaces', config.rootDir)
	}

	static getInstance(): WorkspaceRepository {
		if (!WorkspaceRepository.instance) {
			WorkspaceRepository.instance = new WorkspaceRepository()
		}
		return WorkspaceRepository.instance
	}

	// Store operations
	getAll(): WorkspaceRecord[] {
		return globalStoreManager.getWorkspaces()
	}

	getById(id: string): WorkspaceRecord | null {
		const workspaces = this.getAll()
		return workspaces.find((w) => w.id === id) || null
	}

	save(workspace: WorkspaceRecord): void {
		const workspaces = this.getAll()
		const index = workspaces.findIndex((w) => w.id === workspace.id)

		if (index !== -1) {
			workspaces[index] = workspace
		} else {
			workspaces.push(workspace)
		}

		globalStoreManager.set('workspaces', workspaces)
		logger.debug(`Workspace saved: ${workspace.id}`)
	}

	remove(id: string): boolean {
		const success = globalStoreManager.removeWorkspace(id)
		if (success) {
			this.settingsCache.delete(id)
			logger.debug(`Workspace removed from store: ${id}`)
		}
		return success
	}

	getActiveId(): string | null {
		return globalStoreManager.getActiveWorkspaceId()
	}

	setActiveId(id: string | null): void {
		globalStoreManager.setActiveWorkspaceId(id)
		logger.debug(`Active workspace set: ${id}`)
	}

	// Settings operations
	async getSettings(id: string): Promise<WorkspaceSettings> {
		// Check cache first
		if (this.settingsCache.has(id)) {
			return this.settingsCache.get(id)!
		}

		const settingsPath = `${id}/settings.json`

		try {
			if (await this.fileManager.exists(settingsPath)) {
				const content = await this.fileManager.readFile(settingsPath)
				const parsed = JSON.parse(content)
				const settings = WorkspaceSettingsSchema.parse(parsed)

				// Cache the settings
				this.settingsCache.set(id, settings)
				logger.debug(`Settings loaded for workspace: ${id}`)
				return settings
			}
		} catch (error) {
			logger.warn(`Failed to load settings for workspace ${id}`, error)
		}

		// Return default settings if file doesn't exist or is invalid
		const settings = { ...defaultSettings }
		this.settingsCache.set(id, settings)
		return settings
	}

	async saveSettings(id: string, settings: WorkspaceSettings): Promise<void> {
		try {
			// Validate settings
			const validated = WorkspaceSettingsSchema.parse(settings)

			const settingsPath = `${id}/settings.json`
			const content = JSON.stringify(validated, null, 2)

			await this.fileManager.writeFile(settingsPath, content)

			// Update cache
			this.settingsCache.set(id, validated)
			logger.debug(`Settings saved for workspace: ${id}`)
		} catch (error) {
			logger.error(`Failed to save settings for workspace ${id}`, error)
			throw new ValidationError('Invalid settings format')
		}
	}

	// File system operations
	async createWorkspaceDir(id: string): Promise<void> {
		await this.fileManager.ensureDir(id)
		logger.info(`Workspace directory created: ${id}`)
	}

	async removeWorkspaceDir(id: string): Promise<void> {
		if (await this.fileManager.exists(id)) {
			await this.fileManager.delete(id)
			logger.info(`Workspace directory removed: ${id}`)
		}
	}

	async workspaceDirExists(id: string): Promise<boolean> {
		return await this.fileManager.exists(id)
	}

	getPaths(id: string): WorkspacePaths {
		const workspaceDir = path.join(config.rootDir, 'workspaces', id)
		return {
			workspace: workspaceDir,
			database: path.join(workspaceDir, 'database.db'),
			settings: path.join(workspaceDir, 'settings.json'),

			relWorkspacePath: path.join('workspaces', id),
			relDatabasePath: path.join('workspaces', id, 'database.db'),
		}
	}

	// Cache management
	clearSettingsCache(id?: string): void {
		if (id) {
			this.settingsCache.delete(id)
			logger.debug(`Settings cache cleared for workspace: ${id}`)
		} else {
			this.settingsCache.clear()
			logger.debug('All settings cache cleared')
		}
	}

	// Validation helpers
	async validateWorkspaceExists(id: string): Promise<void> {
		const workspace = this.getById(id)
		if (!workspace) {
			throw new NotFoundError('Workspace', id)
		}

		const dirExists = await this.workspaceDirExists(id)
		if (!dirExists) {
			throw new NotFoundError(`Workspace directory for ${id}`)
		}
	}

	// Utility methods
	async getWorkspaceStats(id: string): Promise<{
		size: number
		filesCount: number
		hasDatabase: boolean
		hasSettings: boolean
	}> {
		const size = await this.fileManager.getDirectorySize(id)
		const files = await this.fileManager.list(id)

		return {
			size,
			filesCount: files.length,
			hasDatabase: files.includes('database.db'),
			hasSettings: files.includes('settings.json'),
		}
	}
}
