import { ipcMain } from 'electron'
import { ZodType, ZodError } from 'zod'
import { createLogger } from '@main/core/logger'

const logger = createLogger('IPC')

/**
 * Регистрирует обработчик на канал channel.
 * Если указан schema — валидирует data перед вызовом handler.
 */
export function handleIpc<T, R = any>(
	channel: string,
	schema: ZodType<T> | null,
	handler: (event: Electron.IpcMainInvokeEvent, data: T) => Promise<R> | R,
) {
	ipcMain.handle(channel, async (event, data) => {
		logger.debug(`${channel} ←`, data)

		try {
			const valid = schema ? schema.parse(data) : data
			const result = await handler(event, valid)
			logger.debug(`${channel} → success`, result)
			return { data: result }
		} catch (e: any) {
			if (e instanceof ZodError) {
				logger.warn(`${channel} validation failed`, e.errors)
				return { error: { type: 'validation', details: e.errors } }
			}
			logger.error(`${channel} handler error`, e)
			return { error: { type: 'exception', message: e.message } }
		}
	})
}
