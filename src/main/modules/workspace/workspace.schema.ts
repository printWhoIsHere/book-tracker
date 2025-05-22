import { z } from 'zod'

/** Возможные типы полей в UI */
export const UIColumnTypeSchema = z.enum([
	'InputText',
	'InputTextarea',
	'InputNumber',
	'Select',
	'MultiSelect',
	'Date',
])
export type UIColumnType = z.infer<typeof UIColumnTypeSchema>

/** Схема одной колонки из UI */
export const UIColumnSchema = z.object({
	key: z
		.string()
		.min(1)
		.regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Key must be valid identifier'),
	label: z.string().min(1),
	type: UIColumnTypeSchema,
	required: z.boolean(),
})
export type UIColumn = z.infer<typeof UIColumnSchema>

/** Запись с метаданными рабочего пространства */
export const WorkspaceRecordSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
})
export type WorkspaceRecord = z.infer<typeof WorkspaceRecordSchema>

/** Настройки таблицы внутри рабочего пространства */
export const TableSettingsSchema = z.object({
	pageSize: z.number().min(1).max(100).default(20),
	rowHeight: z.enum(['compact', 'default', 'comfortable']).default('default'),
	schemaVersion: z.number().int().min(1).default(1),
	/** Схема колонок, которую юзер видит и редактирует */
	schema: z.array(UIColumnSchema).default([]),
})
export type TableSettings = z.infer<typeof TableSettingsSchema>

/** Схема тега */
const TagSchema = z.object({
	name: z.string().min(1, 'Tag name cannot be empty'),
	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color hex'),
})
export type Tag = z.infer<typeof TagSchema>

/** Полная схема настроек рабочего пространства */
export const WorkspaceSettingsSchema = z.object({
	theme: z.enum(['light', 'dark', 'system']).default('system'),
	accentColor: z.string().default('zinc'),
	table: TableSettingsSchema,
	genres: z.array(z.string()).default([]),
	tags: z.array(TagSchema).default([]),
})
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>

/** Значения по умолчанию для новых пространств */
export const defaultSettings: WorkspaceSettings = {
	theme: 'system',
	accentColor: 'zinc',
	table: {
		pageSize: 20,
		rowHeight: 'default',
		schemaVersion: 1,
		schema: [],
	},
	genres: ['Жанр 1', 'Жанр 2', 'Жанр 3'],
	tags: [
		{ name: 'Избранное', color: '#FFD700' },
		{ name: 'В наличии', color: '#50C878' },
		{ name: 'Планируется', color: '#6495ED' },
		{ name: 'Прочитано', color: '#49c143' },
		{ name: 'Отложено', color: '#000aff' },
		{ name: 'Нет в наличии', color: '#ff3600' },
		{ name: 'Порвано', color: '#8a0089' },
	],
}

export const defaultSchema: UIColumn[] = [
	{ key: 'title', label: 'Название', type: 'InputText', required: false },
	{ key: 'totalColumns', label: 'Томов', type: 'InputNumber', required: false },
	{
		key: 'currentVolume',
		label: '№ тома',
		type: 'InputNumber',
		required: false,
	},
	{ key: 'author', label: 'Автор', type: 'InputText', required: false },
	{
		key: 'content',
		label: 'Содержание',
		type: 'InputTextarea',
		required: false,
	},
	{
		key: 'annotation',
		label: 'Аннотация',
		type: 'InputTextarea',
		required: false,
	},
	{ key: 'genre', label: 'Жанр', type: 'Select', required: false },
	{ key: 'year', label: 'Год', type: 'InputNumber', required: false },
	{ key: 'tags', label: 'Ярлыки', type: 'MultiSelect', required: false },
]
