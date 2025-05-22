import { app, BrowserWindow } from 'electron'
import { optimizer } from '@electron-toolkit/utils'

import { createWindow } from '@main/core/window'

app.on('browser-window-created', (_, window) => {
	optimizer.watchWindowShortcuts(window)
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
