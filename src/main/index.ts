import { app as appElectron } from 'electron'
import { App } from '@main/core/app'
import { createWindow } from '@main/core/window'
import { createLogger } from '@main/core/logger'

const logger = createLogger('Main')

async function main() {
	try {
		await appElectron.whenReady()

		const app = App.getInstance()
		await app.init()

		createWindow()
		logger.info('Application started successfully')
	} catch (error) {
		logger.error('Failed to start application', error)
		appElectron.quit()
	}
}

main()
