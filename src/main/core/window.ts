import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import icon from '../../../resources/icon.png?asset'

import { config } from '@main/core/config'

export function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: config.window.width,
		height: config.window.height,
		minWidth: config.window.minWidth,
		minHeight: config.window.minHeight,
		show: false,
		autoHideMenuBar: true,
		titleBarStyle: 'default' as const,
		icon: process.platform === 'linux' ? icon : undefined,
		webPreferences: {
			preload: join(__dirname, '../preload/index.mjs'),
			sandbox: false,
			nodeIntegration: false,
			contextIsolation: true,
		},
	})

	mainWindow.once('ready-to-show', () => {
		mainWindow?.show()
	})

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url)
		return { action: 'deny' }
	})

	loadRenderer(mainWindow)
}

function loadRenderer(win: BrowserWindow): void {
	const rendererUrl = process.env['ELECTRON_RENDERER_URL']

	if (is.dev && rendererUrl) {
		win.loadURL(rendererUrl)
	} else {
		win.loadFile(join(__dirname, '../../renderer/index.html'))
	}
}
