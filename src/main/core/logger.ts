import path from 'path'
import { app } from 'electron'
import log from 'electron-log'

import { config } from '@main/core/config'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
	debug(message: string, ...args: unknown[]): void
	info(message: string, ...args: unknown[]): void
	warn(message: string, ...args: unknown[]): void
	error(message: string, ...args: unknown[]): void
}

class LoggerService {
	private static instance: LoggerService
	private initialized = false

	private constructor() {}

	static getInstance(): LoggerService {
		if (!LoggerService.instance) {
			LoggerService.instance = new LoggerService()
		}
		return LoggerService.instance
	}

	init(): void {
		if (this.initialized) return

		// Установка пути для лог-файла
		log.transports.file.resolvePathFn = () =>
			path.join(app.getPath('userData'), 'logs', 'main.log')

		// Настройка уровней логирования
		log.transports.console.level = config.logging.console.level as any
		log.transports.file.level = config.logging.file.level as any
		log.transports.console.format = config.logging.console.format

		// Настройка ротации файлов
		log.transports.file.maxSize = config.logging.file.maxSize

		log.initialize()
		this.initialized = true
	}

	create(scope: string): Logger {
		this.init()

		return {
			debug: (message: string, ...args: unknown[]) =>
				log.debug(`[${scope}] ${message}`, ...args),
			info: (message: string, ...args: unknown[]) =>
				log.info(`[${scope}] ${message}`, ...args),
			warn: (message: string, ...args: unknown[]) =>
				log.warn(`[${scope}] ${message}`, ...args),
			error: (message: string, ...args: unknown[]) =>
				log.error(`[${scope}] ${message}`, ...args),
		}
	}
}

export const loggerService = LoggerService.getInstance()
export const createLogger = (scope: string): Logger =>
	loggerService.create(scope)
