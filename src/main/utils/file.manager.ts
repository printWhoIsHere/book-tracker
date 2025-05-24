import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

import { createLogger } from '@main/core/logger'

const logger = createLogger('FileManager')

export interface FileStats {
	size: number
	isDirectory: boolean
	isFile: boolean
	createdAt: Date
	modifiedAt: Date
}

export class FileManager {
	private readonly basePath: string

	constructor(subDir: string = '', basePath?: string) {
		this.basePath = basePath
			? path.join(basePath, subDir)
			: path.join(process.cwd(), subDir)
		logger.info(`FileManager: basePath=${this.basePath}`)
		this.ensureDirSync('')
	}

	/**
	 * Преобразует относительный путь в абсолютный
	 */
	resolve(relativePath: string): string {
		const fullPath = path.join(this.basePath, relativePath)
		logger.debug(`Resolved: ${relativePath} -> ${fullPath}`)
		return fullPath
	}

	/**
	 * Создает директорию синхронно (для инициализации)
	 */
	ensureDirSync(relativePath: string): void {
		const fullPath = this.resolve(relativePath)
		if (!fsSync.existsSync(fullPath)) {
			fsSync.mkdirSync(fullPath, { recursive: true })
			logger.info(`Directory created: ${fullPath}`)
		}
	}

	/**
	 * Создает директорию асинхронно
	 */
	async ensureDir(relativePath: string): Promise<void> {
		const fullPath = this.resolve(relativePath)
		try {
			await fs.access(fullPath)
		} catch {
			await fs.mkdir(fullPath, { recursive: true })
			logger.info(`Directory created: ${fullPath}`)
		}
	}

	/**
	 * Проверяет существование файла/папки
	 */
	async exists(relativePath: string): Promise<boolean> {
		const fullPath = this.resolve(relativePath)
		try {
			await fs.access(fullPath)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Синхронная проверка существования
	 */
	existsSync(relativePath: string): boolean {
		const fullPath = this.resolve(relativePath)
		return fsSync.existsSync(fullPath)
	}

	/**
	 * Получает информацию о файле
	 */
	async getStats(relativePath: string): Promise<FileStats> {
		const fullPath = this.resolve(relativePath)
		const stats = await fs.stat(fullPath)

		return {
			size: stats.size,
			isDirectory: stats.isDirectory(),
			isFile: stats.isFile(),
			createdAt: stats.birthtime,
			modifiedAt: stats.mtime,
		}
	}

	/**
	 * Читает содержимое файла
	 */
	async readFile(
		relativePath: string,
		encoding: BufferEncoding = 'utf8',
	): Promise<string> {
		const fullPath = this.resolve(relativePath)
		const content = await fs.readFile(fullPath, encoding)
		logger.debug(`File read: ${fullPath}`)
		return content
	}

	/**
	 * Записывает содержимое в файл
	 */
	async writeFile(
		relativePath: string,
		content: string,
		options?: { encoding?: BufferEncoding; flag?: string },
	): Promise<void> {
		const fullPath = this.resolve(relativePath)
		await this.ensureDir(path.dirname(relativePath))
		await fs.writeFile(fullPath, content, options)
		logger.info(`File written: ${fullPath}`)
	}

	/**
	 * Копирует файл или директорию
	 */
	async copy(srcRelative: string, destRelative: string): Promise<void> {
		const src = this.resolve(srcRelative)
		const dest = this.resolve(destRelative)

		await this.ensureDir(path.dirname(destRelative))
		await fs.cp(src, dest, { recursive: true })
		logger.info(`Copied: ${src} -> ${dest}`)
	}

	/**
	 * Перемещает файл или директорию
	 */
	async move(srcRelative: string, destRelative: string): Promise<void> {
		const src = this.resolve(srcRelative)
		const dest = this.resolve(destRelative)

		await this.ensureDir(path.dirname(destRelative))
		await fs.rename(src, dest)
		logger.info(`Moved: ${src} -> ${dest}`)
	}

	/**
	 * Удаляет файл или директорию
	 */
	async delete(relativePath: string): Promise<void> {
		const fullPath = this.resolve(relativePath)

		if (!(await this.exists(relativePath))) {
			logger.warn(`Path not found: ${fullPath}`)
			return
		}

		const stats = await this.getStats(relativePath)

		if (stats.isDirectory) {
			await fs.rm(fullPath, { recursive: true, force: true })
			logger.info(`Directory deleted: ${fullPath}`)
		} else {
			await fs.unlink(fullPath)
			logger.info(`File deleted: ${fullPath}`)
		}
	}

	/**
	 * Получает список содержимого директории
	 */
	async list(relativePath: string): Promise<string[]> {
		const fullPath = this.resolve(relativePath)

		if (!(await this.exists(relativePath))) {
			logger.warn(`Directory not found: ${fullPath}`)
			return []
		}

		const items = await fs.readdir(fullPath)
		logger.debug(`Directory content: ${fullPath} [${items.join(', ')}]`)
		return items
	}

	/**
	 * Получает подробный список с метаданными
	 */
	async listDetailed(
		relativePath: string,
	): Promise<Array<{ name: string; stats: FileStats }>> {
		const items = await this.list(relativePath)
		const detailed = await Promise.all(
			items.map(async (name) => ({
				name,
				stats: await this.getStats(path.join(relativePath, name)),
			})),
		)

		return detailed
	}

	/**
	 * Ищет файлы по паттерну
	 */
	async find(relativePath: string, pattern: RegExp): Promise<string[]> {
		const items = await this.list(relativePath)
		return items.filter((item) => pattern.test(item))
	}

	/**
	 * Получает размер директории
	 */
	async getDirectorySize(relativePath: string): Promise<number> {
		const items = await this.listDetailed(relativePath)
		let totalSize = 0

		for (const item of items) {
			if (item.stats.isDirectory) {
				totalSize += await this.getDirectorySize(
					path.join(relativePath, item.name),
				)
			} else {
				totalSize += item.stats.size
			}
		}

		return totalSize
	}

	/**
	 * Создает резервную копию файла
	 */
	async backup(
		relativePath: string,
		suffix: string = 'backup',
	): Promise<string> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
		const backupPath = `${relativePath}.${suffix}-${timestamp}`

		await this.copy(relativePath, backupPath)
		logger.info(`Backup created: ${relativePath} -> ${backupPath}`)

		return backupPath
	}
}
