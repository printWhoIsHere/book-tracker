import { ipcRenderer } from 'electron'

const api = {
	workspace: {
		create: (name: string) => ipcRenderer.invoke('workspace:create', { name }),
		list: () => ipcRenderer.invoke('workspace:list'),
		getActive: () => ipcRenderer.invoke('workspace:get-active'),
		setActive: (id: string) =>
			ipcRenderer.invoke('workspace:set-active', { id }),
		getById: (id: string) => ipcRenderer.invoke('workspace:get-by-id', { id }),
		update: (id: string, updates: any) =>
			ipcRenderer.invoke('workspace:update', { id, updates }),
		delete: (id: string) => ipcRenderer.invoke('workspace:delete', { id }),
		getSettings: (id: string) =>
			ipcRenderer.invoke('workspace:get-settings', { id }),
		updateSettings: (id: string, settings: any) =>
			ipcRenderer.invoke('workspace:update-settings', { id, settings }),
		export: (id: string) => ipcRenderer.invoke('workspace:export', { id }),
		getSize: (id: string) => ipcRenderer.invoke('workspace:get-size', { id }),
		getStats: (id: string) => ipcRenderer.invoke('workspace:get-stats', { id }),
		vacuumDb: (id: string) => ipcRenderer.invoke('workspace:vacuum-db', { id }),
	},
}

export default api
