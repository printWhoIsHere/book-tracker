import { ipcMain } from 'electron'
import { ZodType, ZodError } from 'zod'

import { createLogger } from '@main/core/logger'
import { AppError } from '@main/core/errors'

const logger = createLogger('IPC')

export interface IpcResponse<T = any> {
	data?: T
	error?: {
		type: 'validation' | 'app_error' | 'unknown'
		message: string
		code?: string
		details?: unknown
	}
}

export function handleIpc<T, R = any>(
	channel: string,
	schema: ZodType<T> | null,
	handler: (event: Electron.IpcMainInvokeEvent, data: T) => Promise<R> | R,
) {
	ipcMain.handle(channel, async (event, data): Promise<IpcResponse<R>> => {
		logger.debug(`${channel} received`, { data })

		try {
			const validData = schema ? schema.parse(data) : data
			const result = await handler(event, validData)

			logger.debug(`${channel} success`, { result })
			return { data: result }
		} catch (error) {
			return handleIpcError(channel, error)
		}
	})
}

function handleIpcError(channel: string, error: unknown): IpcResponse {
	if (error instanceof ZodError) {
		logger.warn(`${channel} validation failed`, { errors: error.errors })
		return {
			error: {
				type: 'validation',
				message: 'Validation failed',
				details: error.errors,
			},
		}
	}

	if (error instanceof AppError) {
		logger.warn(`${channel} app error`, {
			code: error.code,
			message: error.message,
			details: error.details,
		})
		return {
			error: {
				type: 'app_error',
				message: error.message,
				code: error.code,
				details: error.details,
			},
		}
	}

	logger.error(`${channel} unknown error`, error)
	return {
		error: {
			type: 'unknown',
			message: error instanceof Error ? error.message : 'Unknown error',
		},
	}
}
