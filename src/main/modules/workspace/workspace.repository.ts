import Store from 'electron-store'
import { createLogger } from '@main/core/logger'
import { DatabaseError, NotFoundError } from '@main/core/errors'
import { globalStoreManager } from '@main/core/store'
import {
	getWorkspacePaths,
	validateWorkspaceExists,
	validateUniqueWorkspaceName,
	validateWorkspaceLimit,
} from '@main/utils/workspace'
import {
	WorkspaceRecord,
	WorkspaceSettings,
	WorkspaceSettingsSchema,
	defaultSettings,
} from './workspace.schema'

const logger = createLogger('WorkspaceRepository')

export interface IWorkspaceRepository {
	// Workspace CRUD
	listWorkspaces(): WorkspaceRecord[]
	findWorkspaceById(id: string): WorkspaceRecord | null
	addWorkspace(record: WorkspaceRecord): void
	updateWorkspace(id: string, updates: Partial<WorkspaceRecord>): void
	removeWorkspace(id: string): void

	// Active workspace management
	getActiveId(): string | null
	setActiveId(id: string | null): void

	// Settings management
	getSettings(id: string): WorkspaceSettings
	updateSettings(id: string, patch: Partial<WorkspaceSettings>): void

	// Cache management
	clearSettingsCache(): void
	clearSettingsCacheForWorkspace(id: string): void
}

export class WorkspaceRepository implements IWorkspaceRepository {
	private readonly settingsCache = new Map<string, Store<WorkspaceSettings>>()

	constructor() {}

	listWorkspaces(): WorkspaceRecord[] {
		try {
			// TODO: Если globalStoreManager хранит устаревший JSON (мануальное редактирование файла),
			//       надо валидировать схему и, при ошибке, пересоздавать defaults.

			return globalStoreManager.getWorkspaces()
		} catch (error) {
			logger.error(`Failed to list workspaces`, error)
			throw new DatabaseError(`Failed to retrieve workspace list`, error)
		}
	}

	findWorkspaceById(id: string): WorkspaceRecord | null {
		try {
			const workspaces = this.listWorkspaces()
			return workspaces.find((w) => w.id === id) || null
		} catch (error) {
			logger.error(`Failed to find workspace: ${id}`, error)
			return null
		}
	}

	addWorkspace(record: WorkspaceRecord): void {
		try {
			const workspaces = this.listWorkspaces()
			// TODO: Помимо проверки имени, стоит проверять на существование конфликта ID.
			validateWorkspaceLimit(workspaces)
			validateUniqueWorkspaceName(workspaces, record.name)

			// Проверка на дубликаты по имени
			if (workspaces.some((w) => w.name === record.name)) {
				throw new Error(`Workspace with name "${record.name}" already exists`)
			}

			globalStoreManager.addWorkspace(record)
			logger.info(`Workspace added: ${record.id} (${record.name})`)
		} catch (error) {
			logger.error('Failed to add workspace', error)
			throw new DatabaseError('Failed to add workspace', error)
		}
	}

	updateWorkspace(id: string, updates: Partial<WorkspaceRecord>): void {
		try {
			const workspaces = this.listWorkspaces()
			validateWorkspaceExists(workspaces, id)

			if (updates.name) {
				validateUniqueWorkspaceName(workspaces, updates.name, id)
			}

			const success = globalStoreManager.updateWorkspace(id, updates)
			if (!success) {
				throw new NotFoundError('Workspace', id)
			}

			logger.info(`Workspace updated: ${id}`)
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(`Failed to update workspace: ${id}`, error)
			throw new DatabaseError('Failed to update workspace', error)
		}
	}

	removeWorkspace(id: string): void {
		try {
			const workspaces = this.listWorkspaces()
			validateWorkspaceExists(workspaces, id)
			// TODO: Перед удалением из store проверить, что файл настроек settings.json
			//       и БД действительно удалены, иначе может утечь папка с данными.

			const success = globalStoreManager.removeWorkspace(id)
			if (!success) {
				throw new NotFoundError('Workspace', id)
			}

			const currentActive = this.getActiveId()
			if (currentActive === id) {
				const remainingWorkspaces = this.listWorkspaces()
				if (remainingWorkspaces.length > 0) {
					this.setActiveId(remainingWorkspaces[0].id)
					logger.info(`Set new active workspace: ${remainingWorkspaces[0].id}`)
				} else {
					this.setActiveId(null)
					logger.info('No workspaces remaining, cleared active workspace')
				}
			}

			this.clearSettingsCacheForWorkspace(id)

			const workspace = workspaces.find((w) => w.id === id)!
			logger.info(`Workspace removed: ${id} (${workspace.name})`)
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(`Failed to remove workspace: ${id}`, error)
			throw new DatabaseError('Failed to remove workspace', error)
		}
	}

	getActiveId(): string | null {
		try {
			return globalStoreManager.getActiveWorkspaceId()
		} catch (error) {
			logger.error('Failed to get active workspace id', error)
			return null
		}
	}

	setActiveId(id: string | null): void {
		try {
			if (id !== null) {
				const workspaces = this.listWorkspaces()
				validateWorkspaceExists(workspaces, id)
			}

			globalStoreManager.setActiveWorkspaceId(id)
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(`Failed to set active workspace: ${id}`, error)
			throw new DatabaseError('Failed to set active workspace', error)
		}
	}

	getSettings(id: string): WorkspaceSettings {
		try {
			const workspaces = this.listWorkspaces()
			validateWorkspaceExists(workspaces, id)

			const store = this.getSettingsStore(id)
			const settings = store.store

			const validatedSettings = WorkspaceSettingsSchema.parse(settings)

			if (JSON.stringify(settings) !== JSON.stringify(validatedSettings)) {
				store.store = validatedSettings
				logger.info(`Settings auto-corrected for workspace: ${id}`)
			}

			return validatedSettings
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(`Failed to get settings for workspace: ${id}`, error)
			throw new DatabaseError('Failed to retrieve workspace settings', error)
		}
	}

	updateSettings(id: string, patch: Partial<WorkspaceSettings>): void {
		try {
			const workspaces = this.listWorkspaces()
			validateWorkspaceExists(workspaces, id)

			const store = this.getSettingsStore(id)
			const currentSettings = store.store

			const updatedSettings = {
				...currentSettings,
				...patch,
				table: {
					...currentSettings.table,
					...(patch.table || {}),
				},
				export: {
					...currentSettings.export,
					...(patch.export || {}),
				},
			}

			const validSettings = WorkspaceSettingsSchema.parse(updatedSettings)
			store.store = validSettings
			logger.info(`Settings updated for workspace: ${id}`)
		} catch (error) {
			if (error instanceof NotFoundError) throw error
			logger.error(`Failed to update settings for workspace: ${id}`, error)
			throw new DatabaseError('Failed to update workspace settings', error)
		}
	}

	clearSettingsCache(): void {
		this.settingsCache.clear()
		logger.debug('Settings cache cleared for all workspaces')
	}

	clearSettingsCacheForWorkspace(id: string): void {
		this.settingsCache.delete(id)
		logger.debug(`Settings cache cleared for workspace: ${id}`)
	}

	private getSettingsStore(id: string): Store<WorkspaceSettings> {
		if (!this.settingsCache.has(id)) {
			const paths = getWorkspacePaths(id)

			const store = new Store<WorkspaceSettings>({
				name: 'settings',
				cwd: paths.workspace,
				defaults: defaultSettings,
				schema: WorkspaceSettingsSchema as any,
			})

			this.settingsCache.set(id, store)
		}

		return this.settingsCache.get(id)!
	}
}
