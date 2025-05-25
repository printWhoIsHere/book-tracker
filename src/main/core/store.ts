import Store from 'electron-store'
import { z } from 'zod'

import { config } from '@main/core/config'
import { createLogger } from '@main/core/logger'
import { WorkspaceRecordSchema } from '@main/modules/workspace/workspace.schema'
import { BackupSettingsSchema } from '@main/modules/backup/backup.schema'

const logger = createLogger('STORE')

export const GlobalSchema = z.object({
	activeWorkspaceId: z.string().uuid().nullable(),
	workspaces: WorkspaceRecordSchema.array(),
	backups: BackupSettingsSchema,
})
export type GlobalSchema = z.infer<typeof GlobalSchema>

const defaults: GlobalSchema = {
	activeWorkspaceId: null,
	workspaces: [],
	backups: {
		auto: false,
		interval: 1,
		max: 5,
		lastBackup: null,
		nextBackup: null,
	},
}

export class GlobalStoreManager {
	private static instance: GlobalStoreManager
	private store: Store<GlobalSchema>
	private isInit = false

	private constructor() {
		this.store = new Store<GlobalSchema>({
			name: 'global',
			cwd: config.rootDir,
			defaults,
			// TODO: schema
		})
	}

	static getInstance(): GlobalStoreManager {
		if (!GlobalStoreManager.instance) {
			GlobalStoreManager.instance = new GlobalStoreManager()
		}
		return GlobalStoreManager.instance
	}

	init(): void {
		if (this.isInit) return

		logger.info('Initializing store manager...')
		this.validateStore()
		this.isInit = true
		logger.info('Store manager initialized successfully')
	}

	private validateStore(): void {
		try {
			const data = this.store.store
			GlobalSchema.parse(data)
			logger.debug('Store validation passed')
		} catch (error) {
			logger.warn('Store validation failed, resetting to defaults', error)
			this.store.clear()
		}
	}

	// Generic methods
	get<K extends keyof GlobalSchema>(key: K): GlobalSchema[K] {
		return this.store.get(key)
	}

	set<K extends keyof GlobalSchema>(key: K, value: GlobalSchema[K]): void {
		this.store.set(key, value)
		logger.debug(`Store updated: ${String(key)}`)
	}

	has<K extends keyof GlobalSchema>(key: K): boolean {
		return this.store.has(key)
	}

	delete<K extends keyof GlobalSchema>(key: K): void {
		this.store.delete(key)
		logger.debug(`Store key deleted: ${String(key)}`)
	}

	clear(): void {
		this.store.clear()
		logger.info('Store cleared')
	}

	getAll(): GlobalSchema {
		return this.store.store
	}

	// Workspace-specific methods
	getActiveWorkspaceId(): string | null {
		return this.get('activeWorkspaceId')
	}

	setActiveWorkspaceId(id: string | null): void {
		this.set('activeWorkspaceId', id)
	}

	getWorkspaces(): GlobalSchema['workspaces'] {
		return this.get('workspaces')
	}

	addWorkspace(workspace: GlobalSchema['workspaces'][0]): void {
		const workspaces = this.getWorkspaces()
		workspaces.push(workspace)
		this.set('workspaces', workspaces)
	}

	updateWorkspace(
		id: string,
		updates: Partial<GlobalSchema['workspaces'][0]>,
	): boolean {
		const workspaces = this.getWorkspaces()
		const index = workspaces.findIndex((w) => w.id === id)

		if (index === -1) return false

		workspaces[index] = { ...workspaces[index], ...updates }
		this.set('workspaces', workspaces)
		return true
	}

	removeWorkspace(id: string): boolean {
		const workspaces = this.getWorkspaces()
		const filteredWorkspaces = workspaces.filter((w) => w.id !== id)

		if (filteredWorkspaces.length === workspaces.length) return false

		this.set('workspaces', filteredWorkspaces)

		// Clear active workspace if it was removed
		if (this.getActiveWorkspaceId() === id) {
			this.setActiveWorkspaceId(null)
		}

		return true
	}

	// Backup-specific methods
	getBackupSettings(): GlobalSchema['backups'] {
		return this.get('backups')
	}

	updateBackupSettings(updates: Partial<GlobalSchema['backups']>): void {
		const current = this.getBackupSettings()
		this.set('backups', { ...current, ...updates })
	}

	getPath(): string {
		return this.store.path
	}
}

export const globalStoreManager = GlobalStoreManager.getInstance()
export const store = globalStoreManager
