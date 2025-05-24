import { ipcRenderer } from 'electron'

import type { BookRecord } from '@main/modules/book/book.schema'

const api = {
	workspace: {
		create: (name: string) => ipcRenderer.invoke('workspace:create', { name }),
		list: () => ipcRenderer.invoke('workspace:list'),
		getActive: () => ipcRenderer.invoke('workspace:get-active'),
		setActive: (id: string) =>
			ipcRenderer.invoke('workspace:set-active', { id }),
		update: (id: string, updates: any) =>
			ipcRenderer.invoke('workspace:update', { id, updates }),
		remove: (id: string) => ipcRenderer.invoke('workspace:remove', { id }),
		getSettings: (id: string) =>
			ipcRenderer.invoke('workspace:get-settings', { id }),
		setSettings: (id: string, settings: any) =>
			ipcRenderer.invoke('workspace:set-settings', { id, settings }),
	},

	book: {
		get: (workspaceId: string, id: number) =>
			ipcRenderer.invoke('book:get', { workspaceId, id }),
		getAll: (workspaceId: string) =>
			ipcRenderer.invoke('book:getAll', { workspaceId }),
		create: (
			workspaceId: string,
			book: Partial<Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>>,
		) => ipcRenderer.invoke('book:create', { workspaceId, book }),
		update: (
			workspaceId: string,
			id: number,
			update: Partial<Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>>,
		) => ipcRenderer.invoke('book:update', { workspaceId, id, update }),
		delete: (workspaceId: string, id: number) =>
			ipcRenderer.invoke('book:delete', { workspaceId, id }),
		deleteMany: (workspaceId: string, ids: number[]) =>
			ipcRenderer.invoke('book:deleteMany', { workspaceId, ids }),
	},
}

export default api
