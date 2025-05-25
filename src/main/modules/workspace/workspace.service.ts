import { v4 as uuid } from 'uuid'
import { createLogger } from '@main/core/logger'
import { ValidationError, ConflictError } from '@main/core/errors'
import { DatabaseManager } from '@main/database/database.manager'

import { WorkspaceRepository } from './workspace.repository'
import type {
	WorkspaceRecord,
	WorkspaceSettings,
	CreateWorkspace,
	UpdateWorkspace,
	WorkspacePaths,
	DeepPartial,
} from './workspace.schema'
import {
	CreateWorkspaceSchema,
	UpdateWorkspaceSchema,
	defaultSettings,
} from './workspace.schema'

const logger = createLogger('WorkspaceService')

export class WorkspaceService {
	private dbManager: DatabaseManager
	private repo: WorkspaceRepository

	constructor() {
		this.dbManager = DatabaseManager.getInstance()
		this.repo = WorkspaceRepository.getInstance()
	}

	/**
	 * Создает новый workspace с валидацией и инициализацией
	 */
	async create(data: CreateWorkspace): Promise<WorkspaceRecord> {
		logger.info(`Creating workspace: ${data.name}`)

		// Валидация входных данных
		const validated = CreateWorkspaceSchema.parse(data)

		// Проверка на дублирование имени
		const existing = this.repo.getAll()
		if (
			existing.some(
				(w) => w.name.toLowerCase() === validated.name.toLowerCase(),
			)
		) {
			throw new ConflictError(
				`Workspace with name "${validated.name}" already exists`,
			)
		}

		const workspace: WorkspaceRecord = {
			id: uuid(),
			name: validated.name,
			createdAt: new Date().toISOString(),
		}

		try {
			// Создание директории
			await this.repo.createWorkspaceDir(workspace.id)

			// Инициализация настроек
			await this.repo.saveSettings(workspace.id, { ...defaultSettings })

			// Создание базы данных
			const dbPath = this.getPaths(workspace.id).relDatabasePath
			await this.dbManager.create(dbPath, 'books')

			// Сохранение в store
			this.repo.save(workspace)

			// Установка как активного, если это первый workspace
			if (existing.length === 0) {
				this.repo.setActiveId(workspace.id)
				logger.info(`Set first workspace as active: ${workspace.id}`)
			}

			logger.info(`Workspace created successfully: ${workspace.id}`)
			return workspace
		} catch (error) {
			// Rollback при ошибке
			logger.error(`Failed to create workspace: ${workspace.id}`, error)
			await this.rollbackWorkspaceCreation(workspace.id)
			throw error
		}
	}

	/**
	 * Возвращает список всех workspaces
	 */
	list(): WorkspaceRecord[] {
		return this.repo.getAll()
	}

	/**
	 * Возвращает активный workspace
	 */
	async getActive(): Promise<WorkspaceRecord | null> {
		const activeId = this.repo.getActiveId()
		if (!activeId) {
			return null
		}

		try {
			await this.repo.validateWorkspaceExists(activeId)
			return this.repo.getById(activeId)
		} catch (error) {
			logger.warn(`Active workspace ${activeId} is invalid, clearing`, error)
			this.repo.setActiveId(null)
			return null
		}
	}

	/**
	 * Устанавливает активный workspace
	 */
	async setActive(id: string | null): Promise<void> {
		if (id === null) {
			this.repo.setActiveId(null)
			logger.info('Active workspace cleared')
			return
		}

		// Валидация существования workspace
		await this.repo.validateWorkspaceExists(id)

		this.repo.setActiveId(id)
		logger.info(`Active workspace set: ${id}`)
	}

	/**
	 * Возвращает workspace по ID
	 */
	async getById(id: string): Promise<WorkspaceRecord> {
		await this.repo.validateWorkspaceExists(id)
		return this.repo.getById(id)!
	}

	/**
	 * Обновляет workspace
	 */
	async update(id: string, updates: UpdateWorkspace): Promise<WorkspaceRecord> {
		logger.info(`Updating workspace: ${id}`)

		// Валидация входных данных
		const validated = UpdateWorkspaceSchema.parse(updates)

		// Проверка существования
		const workspace = await this.getById(id)

		// Проверка на дублирование имени (если имя меняется)
		const newName = validated.name
		if (newName && newName !== workspace.name) {
			const existing = this.repo.getAll()
			if (
				existing.some(
					(w) => w.id !== id && w.name.toLowerCase() === newName.toLowerCase(),
				)
			) {
				throw new ConflictError(
					`Workspace with name "${newName}" already exists`,
				)
			}
		}

		const updated: WorkspaceRecord = {
			...workspace,
			...validated,
			updatedAt: new Date().toISOString(),
		}

		this.repo.save(updated)
		logger.info(`Workspace updated: ${id}`)

		return updated
	}

	/**
	 * Удаляет workspace
	 */
	async delete(id: string): Promise<void> {
		logger.info(`Deleting workspace: ${id}`)

		// Проверка существования
		await this.repo.validateWorkspaceExists(id)

		// Проверка что это не последний workspace
		const workspaces = this.repo.getAll()
		if (workspaces.length === 1) {
			throw new ValidationError('Cannot delete the last workspace')
		}

		try {
			// Закрытие базы данных
			const dbPath = this.getPaths(id).relDatabasePath
			this.dbManager.close(dbPath)

			// Удаление файлов
			await this.repo.removeWorkspaceDir(id)

			// Удаление из store
			this.repo.remove(id)

			// Очистка кеша
			this.repo.clearSettingsCache(id)

			// Если удаляемый workspace был активным, выбрать новый
			const activeId = this.repo.getActiveId()
			if (activeId === id) {
				const remaining = this.repo.getAll()
				const newActiveId = remaining.length > 0 ? remaining[0].id : null
				this.repo.setActiveId(newActiveId)
				logger.info(`New active workspace set: ${newActiveId}`)
			}

			logger.info(`Workspace deleted: ${id}`)
		} catch (error) {
			logger.error(`Failed to delete workspace: ${id}`, error)
			throw error
		}
	}

	/**
	 * Возвращает настройки workspace
	 */
	async getSettings(id: string): Promise<WorkspaceSettings> {
		await this.repo.validateWorkspaceExists(id)
		return await this.repo.getSettings(id)
	}

	/**
	 * Обновляет настройки workspace
	 */
	async setSettings(
		id: string,
		patch: DeepPartial<WorkspaceSettings>,
	): Promise<WorkspaceSettings> {
		logger.info(`Updating settings for workspace: ${id}`)

		await this.repo.validateWorkspaceExists(id)

		// Получаем текущие настройки
		const currentSettings = await this.repo.getSettings(id)

		// Глубокое слияние настроек
		const updatedSettings = this.deepMerge(currentSettings, patch)

		// Сохраняем
		await this.repo.saveSettings(id, updatedSettings)

		logger.info(`Settings updated for workspace: ${id}`)
		return updatedSettings
	}

	/**
	 * Возвращает пути к файлам workspace
	 */
	getPaths(id: string): WorkspacePaths {
		return this.repo.getPaths(id)
	}

	/**
	 * Возвращает статистику workspace
	 */
	async getStats(id: string): Promise<{
		workspace: WorkspaceRecord
		files: {
			size: number
			filesCount: number
			hasDatabase: boolean
			hasSettings: boolean
		}
		database?: {
			size: number
			records: number
		}
	}> {
		await this.repo.validateWorkspaceExists(id)

		const workspace = this.repo.getById(id)!
		const files = await this.repo.getWorkspaceStats(id)

		const result: any = { workspace, files }

		// Получаем статистику БД если она существует
		if (files.hasDatabase) {
			try {
				const dbPath = this.getPaths(id).relDatabasePath
				result.database = await this.dbManager.getStats(dbPath)
			} catch (error) {
				logger.warn(`Failed to get database stats for ${id}`, error)
			}
		}

		return result
	}

	/**
	 * Экспортирует данные workspace
	 */
	async export(id: string): Promise<{
		workspace: WorkspaceRecord
		settings: WorkspaceSettings
		data?: any
	}> {
		await this.repo.validateWorkspaceExists(id)

		const workspace = this.repo.getById(id)!
		const settings = await this.repo.getSettings(id)

		const result: any = { workspace, settings }

		// Экспортируем данные БД если она существует
		try {
			const dbPath = this.getPaths(id).relDatabasePath
			result.data = await this.dbManager.exportData(dbPath)
		} catch (error) {
			logger.warn(`Failed to export database for ${id}`, error)
		}

		return result
	}

	// Private methods

	private async rollbackWorkspaceCreation(id: string): Promise<void> {
		try {
			// Удаляем из store
			this.repo.remove(id)

			// Удаляем директорию
			await this.repo.removeWorkspaceDir(id)

			// Закрываем БД если была открyta
			try {
				const dbPath = this.getPaths(id).relDatabasePath
				this.dbManager.close(dbPath)
			} catch {}

			logger.info(`Workspace creation rolled back: ${id}`)
		} catch (error) {
			logger.error(`Failed to rollback workspace creation: ${id}`, error)
		}
	}

	private deepMerge(target: any, source: any): any {
		const result = { ...target }

		for (const key in source) {
			if (
				source[key] !== null &&
				typeof source[key] === 'object' &&
				!Array.isArray(source[key])
			) {
				result[key] = this.deepMerge(target[key] || {}, source[key])
			} else {
				result[key] = source[key]
			}
		}

		return result
	}
}
