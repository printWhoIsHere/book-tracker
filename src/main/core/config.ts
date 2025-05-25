import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { z } from 'zod'

export const isDev = is.dev || process.env.NODE_ENV === 'development'

const ConfigSchema = z.object({
	isDev: z.boolean(),
	rootDir: z.string(),
	window: z.object({
		width: z.number().default(1280),
		height: z.number().default(720),
		minWidth: z.number().default(1100),
		minHeight: z.number().default(420),
	}),
	database: z.object({
		journalMode: z.string().default('WAL'),
		synchronous: z.string().default('NORMAL'),
		cache_size: z.string().default('10000'),
		temp_store: z.string().default('MEMORY'),
	}),
	logging: z.object({
		console: z.object({
			level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
			format: z.string().default('{h}:{i}:{s} | {text}'),
		}),
		file: z.object({
			level: z
				.enum(['debug', 'info', 'warn', 'error', 'false'])
				.default('info'),
			maxSize: z.number().default(10 * 1024 * 1024), // 10MB
		}),
	}),
})
export type Config = z.infer<typeof ConfigSchema>

class ConfigService {
	private static instance: ConfigService
	private config: Config

	private constructor() {
		const isDev = is.dev || process.env.NODE_ENV === 'development'

		const rootDir = isDev
			? path.resolve(__dirname, '../../data')
			: path.join(app.getPath('userData'), 'data')

		this.ensureDirectory(rootDir)

		this.ensureDirectory(path.join(rootDir, 'workspaces'))
		this.ensureDirectory(path.join(rootDir, 'backups'))
		this.ensureDirectory(path.join(rootDir, 'logs'))

		this.config = ConfigSchema.parse({
			isDev,
			rootDir,
			window: {
				width: 1280,
				height: 720,
				minWidth: 760,
				minHeight: 420,
			},
			database: {
				journalMode: 'WAL',
				synchronous: 'NORMAL',
				cache_size: '10000',
				temp_store: 'MEMORY',
			},
			logging: {
				console: {
					level: isDev ? 'debug' : 'info',
					format: '{h}:{i}:{s} | {text}',
				},
				file: {
					level: isDev ? 'false' : 'info',
					maxSize: 10 * 1024 * 1024,
				},
			},
		})
	}

	private ensureDirectory(dirPath: string): void {
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true })
		}
	}

	static getInstance(): ConfigService {
		if (!ConfigService.instance) {
			ConfigService.instance = new ConfigService()
		}
		return ConfigService.instance
	}

	get(): Config {
		return this.config
	}
}

export const configService = ConfigService.getInstance()
export const config = configService.get()
