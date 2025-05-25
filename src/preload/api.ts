import { ipcRenderer } from 'electron'

import type {
	DeepPartial,
	WorkspaceSettings,
} from '@main/modules/workspace/workspace.schema'
import type {
	BookRecord,
	BookId,
	BookAdd,
	BookUpdate,
	BookIds,
} from '@main/modules/book/book.schema'

const api = {
	workspace: {
		create: (data: { name: string }) =>
			ipcRenderer.invoke('workspace:create', data),
		list: () => ipcRenderer.invoke('workspace:list'),
		getActive: () => ipcRenderer.invoke('workspace:get-active'),
		setActive: (data: { id: string | null }) =>
			ipcRenderer.invoke('workspace:set-active', data),
		getById: (data: { id: string }) =>
			ipcRenderer.invoke('workspace:get-by-id', data),
		update: (data: { id: string; updates: { name?: string } }) =>
			ipcRenderer.invoke('workspace:update', data),
		remove: (data: { id: string }) =>
			ipcRenderer.invoke('workspace:remove', data),
		getSettings: (data: { id: string }) =>
			ipcRenderer.invoke('workspace:get-settings', data),
		setSettings: (data: {
			id: string
			settings: DeepPartial<WorkspaceSettings>
		}) => ipcRenderer.invoke('workspace:set-settings', data),
		getPaths: (data: { id: string }) =>
			ipcRenderer.invoke('workspace:get-paths', data),
		getStats: (data: { id: string }) =>
			ipcRenderer.invoke('workspace:get-stats', data),
		export: (data: { id: string }) =>
			ipcRenderer.invoke('workspace:export', data),
	},

	book: {
		get: (id: BookId): Promise<BookRecord> =>
			ipcRenderer.invoke('book:get', { id }),
		getAll: (): Promise<BookRecord[]> => ipcRenderer.invoke('book:get-all'),
		create: (data: BookAdd): Promise<BookRecord> =>
			ipcRenderer.invoke('book:create', data),
		update: (data: { id: BookId; data: BookUpdate }): Promise<BookRecord> =>
			ipcRenderer.invoke('book:update', data),
		delete: (data: { id: BookId }): Promise<void> =>
			ipcRenderer.invoke('book:delete', data),
		deleteMany: (data: { ids: BookIds }): Promise<{ deletedCount: number }> =>
			ipcRenderer.invoke('book:delete-many', data),
	},
}

export default api
