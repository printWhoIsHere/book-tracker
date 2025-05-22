import path from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { FileManager } from '@main/utils/file.manager'

export const isDev = is.dev || process.env.NODE_ENV === 'development'

export const rootDir = isDev
	? path.resolve(__dirname, '../../data')
	: path.join(app.getPath('userData'), 'data')

app.whenReady().then(() => {
	const fm = new FileManager()
	fm.ensureDir('backups')
	fm.ensureDir('workspaces')
})
