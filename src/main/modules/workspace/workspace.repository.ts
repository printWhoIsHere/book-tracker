import path from 'path'
import Store from 'electron-store'
import { config } from '@main/core/config'
import { createLogger } from '@main/core/logger'
import { DatabaseError, NotFoundError } from '@main/core/errors'
import { store as globalStore, GlobalSchema } from '@main/core/store'
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
}

export class WorkspaceRepository implements IWorkspaceRepository {
	private readonly globalStore: Store<GlobalSchema>
	private readonly settingsCache = new Map<string, Store<WorkspaceSettings>>()

	constructor(store?: Store<GlobalSchema>) {
		this.globalStore = store || globalStore
	}

	listWorkspaces(): WorkspaceRecord[] {
		try {
			return this.globalStore.get('workspaces', [])
		} catch (error) {
			logger.error(`Failed to list workspaces`, error)
			throw new DatabaseError(`Failed to retrieve workspace list`, error)
		}
	}

	findWorkspaceById(id: string): WorkspaceRecord | null {
		const workspaces = this.listWorkspaces()
		return workspaces.find((w) => w.id === id) || null
	}

	addWorkspace(record: WorkspaceRecord): void {
		try {
			const workspaces = this.listWorkspaces()

			// Проверка на дубликаты
			if (workspaces.some((w) => w.id === record.id)) {
				throw new Error(`Workspace with id ${record.id} already exists`)
			}

			this.globalStore.set('workspaces', [...workspaces, record])
			logger.info(`Workspace added: ${record.id}`)
		} catch (error) {
			logger.error(`Failed to add workspace: ${record.id}`, error)
			throw new DatabaseError('Failed to add workspace', error)
		}
	}

	updateWorkspace(id: string, updates: Partial<WorkspaceRecord>): void {
		try {
			const workspaces = this.listWorkspaces()
			const index = workspaces.findIndex((w) => w.id === id)

			// TODO: Почему -1?
			if (index === -1) {
				throw new NotFoundError('Workspace', id)
			}

			workspaces[index] = { ...workspaces[index], ...updates }
			this.globalStore.set('workspaces', workspaces)

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
			const filtered = workspaces.filter((w) => w.id !== id)

			if (filtered.length === workspaces.length) {
				throw new NotFoundError(`Workspace`, id)
			}

			this.globalStore.set('workspaces', filtered)

			// Сбрасываем активный workspace если он удаляется
			// TODO: Может сделать первый из списка активным?
			if (this.getActiveId() === id) {
				this.setActiveId(null)
			}

			// Очищаем кеш настроек
			this.settingsCache.delete(id)

			logger.info(`Workspace removed: ${id}`)
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(`Failed to remove workspace: ${id}`, error)
			throw new DatabaseError('Failed to remove workspace', error)
		}
	}

	getActiveId(): string | null {
		try {
			return this.globalStore.get('activeWorkspaceId', null)
		} catch (error) {
			logger.error('Failed to get active workspace id', error)
			return null
		}
	}

	setActiveId(id: string | null): void {
		try {
			this.globalStore.set('activeWorkspaceId', id)
			logger.debug(`Active workspace set to: ${id || 'none'}`)
		} catch (error) {
			logger.error(`Failed to set active workspace: ${id}`, error)
			throw new DatabaseError('Failed to set active workspace', error)
		}
	}

	private getSettingsStore(id: string): Store<WorkspaceSettings> {
		if (!this.settingsCache.has(id)) {
			const workspacePath = path.join(config.rootDir, 'workspaces', id)

			const store = new Store<WorkspaceSettings>({
				name: 'settings',
				cwd: workspacePath,
				defaults: defaultSettings,
				// Добавляем схему для валидации
				schema: WorkspaceSettingsSchema as any,
			})

			this.settingsCache.set(id, store)
		}

		return this.settingsCache.get(id)!
	}

	getSettings(id: string): WorkspaceSettings {
		try {
			if (!this.findWorkspaceById(id)) {
				throw new NotFoundError('Workspace', id)
			}

			const store = this.getSettingsStore(id)
			const settings = store.store

			// Валидируем настройки
			return WorkspaceSettingsSchema.parse(settings)
		} catch (error) {
			if (error instanceof NotFoundError) throw error

			logger.error(`Failed to get settings for workspace: ${id}`, error)
			throw new DatabaseError('Failed to retrieve workspace settings', error)
		}
	}

	updateSettings(id: string, patch: Partial<WorkspaceSettings>): void {
		try {
			if (!this.findWorkspaceById(id)) {
				throw new NotFoundError('Workspace', id)
			}

			const store = this.getSettingsStore(id)
			const currentSettings = store.store
			const updatedSettings = { ...currentSettings, ...patch }

			// Валидируем обновленные настройки
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
	}
}
