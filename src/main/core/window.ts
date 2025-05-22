import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

export function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 760,
		minHeight: 420,
		show: false,
		autoHideMenuBar: true,
		icon: process.platform === 'linux' ? icon : undefined,
		webPreferences: {
			preload: join(__dirname, '../preload/index.mjs'),
			sandbox: false,
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
