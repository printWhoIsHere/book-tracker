import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

import { createWindow } from '@main/core/window'
import { createLogger } from '@main/core/logger'
import { DatabaseManager } from '@main/database/database.manager'
import { FileManager } from '@main/utils/file.manager'

const logger = createLogger('APP')

export class App {
	private static instance: App
	private isReady = false

	private constructor() {}

	static getInstance(): App {
		if (!App.instance) {
			App.instance = new App()
		}
		return App.instance
	}

	async init(): Promise<void> {
		if (this.isReady) return

		logger.info('Initializing application...')

		// Настройка Electron
		electronApp.setAppUserModelId('book-tracker.app')

		// Создание директорий
		const fileManager = new FileManager()
		fileManager.ensureDir('backups')
		fileManager.ensureDir('workspaces')

		// Настройка обработчиков событий
		this.setupEventHandlers()

		// Импорт контроллеров IPC
		await import('@main/modules/workspace/workspace.controller')
		// await import('@main/modules/backup/backup.controller')
		// await import('@main/modules/book/book.controller')

		this.isReady = true
		logger.info('Application initialized successfully')
	}

	private setupEventHandlers(): void {
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

		app.on('before-quit', () => {
			this.shutdown()
		})
	}

	private shutdown(): void {
		logger.info('Application shutting down...')

		// Закрывает все DB
		DatabaseManager.getInstance().closeAll()

		if (process.platform !== 'darwin') {
			app.quit()
		}
	}
}
