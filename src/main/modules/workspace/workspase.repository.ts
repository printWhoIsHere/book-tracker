import path from 'path'
import Store from 'electron-store'
import { store as globalStore, GlobalSchema } from '@main/core/store'
import { rootDir } from '@main/core/config'
import {
	defaultSettings,
	WorkspaceRecord,
	WorkspaceSettings,
	WorkspaceSettingsSchema,
} from './workspace.schema'

export class WorkspaceRepository {
	private global: Store<GlobalSchema> = globalStore
	private settingsMap = new Map<string, Store<WorkspaceSettings>>()

	listWorkspaces(): WorkspaceRecord[] {
		return this.global.get('workspaces')
	}

	addWorkspace(rec: WorkspaceRecord) {
		const all = this.listWorkspaces()
		this.global.set('workspaces', [...all, rec])
	}

	removeWorkspace(id: string) {
		const all = this.listWorkspaces().filter((w) => w.id !== id)
		this.global.set('workspaces', all)
		if (this.getActiveId() === id) this.setActiveId(null)
	}

	getActiveId(): string | null {
		return this.global.get('activeWorkspaceId')
	}

	setActiveId(id: string | null) {
		this.global.set('activeWorkspaceId', id)
	}

	private getStore(id: string): Store<WorkspaceSettings> {
		if (!this.settingsMap.has(id)) {
			const cwd = path.join(rootDir, 'workspaces', id)
			const store = new Store<WorkspaceSettings>({
				name: 'settings',
				cwd,
				defaults: defaultSettings,
			})
			this.settingsMap.set(id, store)
		}
		return this.settingsMap.get(id)!
	}

	getSettings(id: string): WorkspaceSettings {
		const s = this.getStore(id)
		return WorkspaceSettingsSchema.parse(s.store)
	}

	updateSettings(id: string, patch: Partial<WorkspaceSettings>) {
		const s = this.getStore(id)
		const merged = { ...s.store, ...patch }
		s.store = WorkspaceSettingsSchema.parse(merged)
	}
}
