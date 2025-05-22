import fs from 'fs'
import path from 'path'

import { rootDir } from '@main/core/config'
import { createLogger } from '@main/core/logger'

const logger = createLogger('FileManager')

export class FileManager {
	private basePath: string = rootDir

	/*
	 * @param subDir Поддиректория внутри userData (по умолчанию — корень).
	 */
	constructor(subDir: string = '') {
		this.basePath = path.join(rootDir, subDir)
		logger.info(`FileManager: basePath=${this.basePath}`)
		this.ensureDir('')
	}

	/* Преобразует относительный путь в абсолютный. */
	resolve(rel: string): string {
		const full = path.join(this.basePath, rel)
		logger.debug(`resolve: ${rel} -> ${full}`)
		return full
	}

	/* Создает директорию, если ее нет. */
	ensureDir(rel: string): void {
		const full = this.resolve(rel)
		if (!fs.existsSync(full)) {
			fs.mkdirSync(full, { recursive: true })
			logger.info(`ensureDir: создана директория ${full}`)
		} else {
			logger.debug(`ensureDir: директория уже существует ${full}`)
		}
	}

	/* Проверяет существование пути. */
	exists(rel: string): boolean {
		const full = this.resolve(rel)
		const res = fs.existsSync(full)
		logger.debug(`exists: ${full} -> ${res}`)
		return res
	}

	/* Копирует файл или директорию. */
	copy(srcRel: string, destRel: string): void {
		const src = this.resolve(srcRel)
		const dest = this.resolve(destRel)
		const stat = fs.statSync(src)
		if (stat.isDirectory()) {
			fs.cpSync(src, dest, { recursive: true })
			logger.info(`copy: директория ${src} -> ${dest}`)
		} else {
			fs.copyFileSync(src, dest)
			logger.info(`copy: файл ${src} -> ${dest}`)
		}
	}

	/* Удаляет файл или директорию. */
	delete(rel: string): void {
		const full = this.resolve(rel)
		if (!fs.existsSync(full)) {
			logger.warn(`delete: путь не найден ${full}`)
			return
		}
		const stat = fs.statSync(full)
		if (stat.isDirectory()) {
			fs.rmSync(full, { recursive: true, force: true })
			logger.info(`delete: удалена директория ${full}`)
		} else {
			fs.unlinkSync(full)
			logger.info(`delete: удалён файл ${full}`)
		}
	}

	/* Переименовывает файл или директорию. */
	rename(oldRel: string, newRel: string): void {
		const oldFull = this.resolve(oldRel)
		const newFull = this.resolve(newRel)
		fs.renameSync(oldFull, newFull)
		logger.info(`rename: ${oldFull} -> ${newFull}`)
	}

	/* Список содержимого директории. */
	list(rel: string): string[] {
		const full = this.resolve(rel)
		if (!fs.existsSync(full)) {
			logger.warn(`list: директория не найдена ${full}`)
			return []
		}
		const items = fs.readdirSync(full)
		logger.debug(`list: содержимое ${full}: [${items.join(', ')}]`)
		return items
	}
}
