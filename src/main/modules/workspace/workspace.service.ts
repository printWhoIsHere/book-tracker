import { v4 as uuidv4 } from 'uuid'

import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from '@main/core/errors'
import { store } from '@main/core/store'
import { createLogger } from '@main/core/logger'
import { FileManager } from '@main/utils/file.manager'
import { DatabaseManager } from '@main/database/database.manager'
import { ColumnType, type ColumnSpec } from '@main/database/database.schema'

import {
	WorkspaceRecord,
	WorkspaceSettings,
	type UIColumnType,
	UIColumn,
	defaultSchema,
} from './workspace.schema'
import { WorkspaceRepository } from './workspace.repository'

const logger = createLogger('WorkspaceService')

export class WorkspaceService {
	private readonly fileManager: FileManager
	private readonly dbManager: DatabaseManager
	private readonly repo: WorkspaceRepository

	constructor() {
		this.fileManager = new FileManager()
		this.dbManager = DatabaseManager.getInstance()
		this.repo = new WorkspaceRepository()
	}

	async create(name: string, uiSchema?: UIColumn[]): Promise<string> {
		// Проверка уникальности имени
		if (this.repo.listWorkspaces().some((w) => w.name === name)) {
			throw new ConflictError(`Workspace "${name}" already exists`)
		}

		const id = uuidv4()
		const now = new Date().toISOString()

		try {
			// Создаём запись workspace
			const record: WorkspaceRecord = { id, name, createdAt: now }
			this.repo.addWorkspace(record)
			this.repo.setActiveId(id)

			logger.info(`Create workspace: ${id}`)

			// Настройка схемы
			const schema = uiSchema?.length ? uiSchema : defaultSchema
			await this.updateTableSchema(id, schema)

			// Создаём DB
			const dbSchema = this.convertUISchemaToDbSchema(schema)
			const dbPath = `workspaces/${id}/database.db`
			await this.dbManager.create(dbPath, 'books', dbSchema)

			logger.info(`Database created for workspace: ${id}`)
			return id
		} catch (error) {
			// Rollback при ошибке
			try {
				this.repo.removeWorkspace(id)
				this.fileManager.delete(`workspaces/${id}`)
			} catch (error) {
				logger.error(`Failed to rollback workspace creation: ${id}`)
			}
			throw error
		}
	}

	getActive(): WorkspaceRecord | null {
		const activeId = this.repo.getActiveId()
		if (!activeId) return null

		const workspace = this.repo.listWorkspaces().find((w) => w.id === activeId)
		return workspace || null
	}

	setActive(id: string): void {
		this.validateWorkspaceExists(id)
		this.repo.setActiveId(id)
		logger.info(`Active workspace set to: ${id}`)
	}

	list(): WorkspaceRecord[] {
		return this.repo.listWorkspaces()
	}

	async delete(id: string): Promise<void> {
		const workspace = this.repo.listWorkspaces().find((w) => w.id === id)
		if (!workspace) {
			throw new NotFoundError('Workspace', id)
		}

		try {
			this.dbManager.close(`workspaces/${id}/database.db`)
			this.fileManager.delete(`workspaces/${id}`)
			this.repo.removeWorkspace(id)

			logger.info(`Deleted workspace: ${id}`)
		} catch (error) {
			logger.error(`Failed to delete workspace: ${id}`, error)
			throw error
		}
	}

	rename(id: string, newName: string): void {
		if (!newName.trim()) {
			throw new ValidationError(`Workspace name can not be empty`)
		}

		const workspaces = this.repo.listWorkspaces()

		this.validateWorkspaceExists(id)

		if (workspaces.some((w) => w.id !== id && w.name === newName)) {
			throw new ConflictError(`Workspace "${newName}" already exists`)
		}

		this.repo.updateWorkspace(id, {
			name: newName,
			updatedAt: new Date().toISOString(),
		})

		logger.info(`Workspace renamed: ${id} -> ${newName}`)

		// const all = store
		// 	.get('workspaces')
		// 	.map((w) =>
		// 		w.id === id
		// 			? { ...w, name: newName, updatedAt: new Date().toISOString() }
		// 			: w,
		// 	)
		// store.set('workspaces', all)
	}

	getSettings(id: string): WorkspaceSettings {
		this.validateWorkspaceExists(id)
		return this.repo.getSettings(id)
	}

	async updateSettings(
		id: string,
		patch: Partial<WorkspaceSettings>,
	): Promise<void> {
		this.validateWorkspaceExists(id)
		this.repo.updateSettings(id, patch)
		logger.info(`Settings updated for workspace: ${id}`)
	}

	getColumns(id: string, table: string): any[] {
		this.validateWorkspaceExists(id)
		return this.dbManager.getColumns(`workspaces/${id}/database.db`, table)
	}

	private async updateTableSchema(
		id: string,
		schema: UIColumn[],
	): Promise<void> {
		this.repo.updateSettings(id, {
			table: {
				...this.repo.getSettings(id).table,
				schema,
			},
		})
	}

	private validateWorkspaceExists(id: string): void {
		const exists = this.repo.listWorkspaces().some((w) => w.id === id)
		if (!exists) {
			throw new NotFoundError('Workspace', id)
		}
	}

	private mapUITypeToSql(uiType: UIColumnType): ColumnType {
		const mapping: Record<UIColumnType, ColumnType> = {
			InputNumber: 'INTEGER',
			Date: 'TEXT',
			MultiSelect: 'TEXT',
			Select: 'TEXT',
			InputText: 'TEXT',
			InputTextarea: 'TEXT',
		}
		return mapping[uiType]
	}

	private convertUISchemaToDbSchema(uiSchema: UIColumn[]): ColumnSpec[] {
		return uiSchema.map((col) => ({
			key: col.key,
			label: col.key,
			type: this.mapUITypeToSql(col.type),
			required: col.required,
		}))
	}
}
