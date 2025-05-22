import path from 'path'
import { app } from 'electron'
import log from 'electron-log'
import { is } from '@electron-toolkit/utils'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LoggerMethods = Record<LogLevel, (...args: unknown[]) => void>

// Установка пути для лог-файла
log.transports.file.resolvePathFn = () =>
	path.join(app.getPath('userData'), 'logs', 'main.log')

// Настройка уровней логирования
log.transports.console.level = is.dev ? 'debug' : 'info'
log.transports.file.level = is.dev ? false : 'info'

// Форматирование сообщений для консоли
log.transports.console.format = '{h}:{i}:{s} | {text}'

// Установка уровней логирования
log.transports.console.level = 'debug'
log.transports.file.level = 'info'

// Инициализация логгера для процессов рендеринга
log.initialize()

// Функция для создания логгера с определённым скопом
function createLogger(scope: string): LoggerMethods {
	return {
		debug: (message, ...args) => log.debug(`[${scope}] ${message}`, ...args),
		info: (message, ...args) => log.info(`[${scope}] ${message}`, ...args),
		warn: (message, ...args) => log.warn(`[${scope}] ${message}`, ...args),
		error: (message, ...args) => log.error(`[${scope}] ${message}`, ...args),
	}
}

export { createLogger }
