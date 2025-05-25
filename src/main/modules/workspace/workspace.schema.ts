import { z } from 'zod'

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export const WorkspaceRecordSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100).trim(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime().optional(),
})
export type WorkspaceRecord = z.infer<typeof WorkspaceRecordSchema>

export const WorkspaceSettingsSchema = z.object({
	theme: z.enum(['light', 'dark', 'system']).default('system'),
	accentColor: z.string().default('zinc'),
	language: z.enum(['en', 'ru']).default('ru'),

	table: z.object({
		pageSize: z.number().int().min(0).max(100).default(20),
		rowHeight: z.enum(['compact', 'default', 'comfortable']).default('default'),
		schema: z.null().default(null),
	}),

	genres: z.array(z.string()),
	tags: z.array(
		z.object({
			label: z.string(),
			color: z.string(),
		}),
	),

	export: z.object({
		format: z.enum(['json', 'csv', 'xlsx']).default('json'),
		includeSettings: z.boolean().default(false),
	}),
})
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>

// Схемы для создания и обновления
export const CreateWorkspaceSchema = z.object({
	name: z.string().min(1).max(100).trim(),
})
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>

export const UpdateWorkspaceSchema = z.object({
	name: z.string().min(1).max(100).trim().optional(),
})
export type UpdateWorkspace = z.infer<typeof UpdateWorkspaceSchema>

export const WorkspacePathsSchema = z.object({
	workspace: z.string(),
	database: z.string(),
	settings: z.string(),

	relWorkspacePath: z.string(),
	relDatabasePath: z.string(),
})
export type WorkspacePaths = z.infer<typeof WorkspacePathsSchema>

export const defaultSettings: WorkspaceSettings = {
	theme: 'system',
	accentColor: 'zinc',
	language: 'ru',
	table: {
		pageSize: 20,
		rowHeight: 'default',
		schema: null,
	},
	genres: [
		'Фантастика',
		'Фэнтези',
		'Детектив',
		'Роман',
		'Биография',
		'История',
		'Техническая литература',
		'Поэзия',
	],
	tags: [
		{ label: 'Избранное', color: '#FFD700' },
		{ label: 'В наличии', color: '#50C878' },
		{ label: 'Планируется', color: '#6495ED' },
		{ label: 'Прочитано', color: '#49c143' },
		{ label: 'Отложено', color: '#FFA500' },
		{ label: 'Нет в наличии', color: '#ff3600' },
		{ label: 'Повреждено', color: '#8B0000' },
	],
	export: {
		format: 'json',
		includeSettings: false,
	},
}
