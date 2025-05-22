import { ipcRenderer } from 'electron'
import { type ColumnSpec } from '@main/database/database.schema'

const api = {
	workspace: {
		create: (name: string, schema?: ColumnSpec[]) =>
			ipcRenderer.invoke('workspace:create', { name, schema }),
		list: () => ipcRenderer.invoke('workspace:list'),
		getActive: () => ipcRenderer.invoke('workspace:getActive'),
		setActive: (id: string) =>
			ipcRenderer.invoke('workspace:setActive', { id }),
		delete: (id: string) => ipcRenderer.invoke('workspace:delete', { id }),
		rename: (id: string, newName: string) =>
			ipcRenderer.invoke('workspace:rename', { id, newName }),
		getSettings: (id: string) =>
			ipcRenderer.invoke('workspace:getSettings', { id }),
		updateSettings: (id: string, patch: any) =>
			ipcRenderer.invoke('workspace:updateSettings', { id, patch }),
		getColumns: (id: string, table: string) =>
			ipcRenderer.invoke('workspace:getColumns', { id, table }),
	},
}

export default api
