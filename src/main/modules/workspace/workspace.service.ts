import { v4 as uuidv4 } from 'uuid'
import { store } from '@main/core/store'
import { FileManager } from '@main/utils/file.manager'
import { DatabaseManager } from '@main/database/database.manager'
import { createLogger } from '@main/core/logger'
import { ColumnType, type ColumnSpec } from '@main/database/database.schema'
import {
	WorkspaceRecordSchema,
	WorkspaceRecord,
	WorkspaceSettings,
	UIColumnType,
	UIColumn,
	defaultSchema,
} from './workspace.schema'
import { WorkspaceRepository } from './workspase.repository'

const logger = createLogger('WorkspaceService')

export class WorkspaceService {
	private fm = new FileManager()
	private dbManager = DatabaseManager.getInstance()
	private repo: WorkspaceRepository = new WorkspaceRepository()

	constructor() {}

	/* Создание нового workspace */
	create(name: string, uiSchema?: UIColumn[]): string {
		if (this.repo.listWorkspaces().some((w) => w.name === name)) {
			throw new Error(`Workspace "${name}" exists`)
		}

		const id = uuidv4(),
			now = new Date().toISOString(),
			rec: WorkspaceRecord = { id, name, createdAt: now }
		WorkspaceRecordSchema.parse(rec)
		this.repo.addWorkspace(rec)
		this.repo.setActiveId(id)
		logger.info(`registered: ${id}`)

		const schema = uiSchema && uiSchema.length ? uiSchema : defaultSchema
		this.repo.updateSettings(id, {
			table: {
				...this.repo.getSettings(id).table,
				schema,
			},
		})
		logger.info(`settings saved: ${id}`)

		const dbSchema = this.toDbSchema(schema)
		const rel = `workspaces/${id}/database.db`
		this.dbManager.create(rel, 'books', dbSchema)
		logger.info(`DB+table created: ${rel}`)

		return id
	}

	/* Получить текущий активный workspace из global.json */
	getActive(): WorkspaceRecord | null {
		const activeId = this.repo.getActiveId()
		return this.list().find((w) => w.id === activeId) ?? null
	}

	/* Установка активного workspace */
	setActive(id: string) {
		const exists = this.repo.listWorkspaces().some((w) => w.id === id)
		if (!exists) throw new Error(`Workspace ${id} не найден`)
		this.repo.setActiveId(id)
		logger.info(`Active workspace switched -> ${id}`)
	}

	/* Получить список всех workspaces */
	list(): WorkspaceRecord[] {
		return this.repo.listWorkspaces()
	}

	/* Удаление workspace */
	delete(id: string) {
		this.dbManager.close(`workspaces/${id}/database.db`)
		this.fm.delete(`workspaces/${id}`)
		this.repo.removeWorkspace(id)
		logger.info(`deleted -> ${id}`)
	}

	/* Переименование workspace */
	rename(id: string, newName: string): void {
		const all = store
			.get('workspaces')
			.map((w) =>
				w.id === id
					? { ...w, name: newName, updatedAt: new Date().toISOString() }
					: w,
			)
		store.set('workspaces', all)
		logger.info(`Workspace renamed: id=${id}, newName=${newName}`)
	}

	getSettings(id: string): WorkspaceSettings {
		return this.repo.getSettings(id)
	}

	updateSettings(id: string, patch: Partial<WorkspaceSettings>) {
		this.repo.updateSettings(id, patch)
		logger.info(`Settings updated for workspace ${id}`)
	}

	getColumns(id: string, table: string) {
		return this.dbManager.getColumns(`workspaces/${id}/database.db`, table)
	}

	/** Маппит UI-тип в SQL-ColumnType */
	private mapUITypeToSql(uiType: UIColumnType): ColumnType {
		switch (uiType) {
			case 'InputNumber':
				return 'INTEGER'
			case 'Date':
				return 'TEXT' // ISO-строка или timestamp
			case 'MultiSelect':
			case 'Select':
			case 'InputText':
			case 'InputTextarea':
			default:
				return 'TEXT'
		}
	}

	/** Преобразует UI-схему в ColumnSpec[] для БД */
	private toDbSchema(uiSchema: UIColumn[]): ColumnSpec[] {
		return uiSchema.map((col) => ({
			key: col.key,
			label: col.key, // SQL-имя = key
			type: this.mapUITypeToSql(col.type),
			required: col.required,
		}))
	}
}
