interface WorkspaceRecord {
	id: string
	name: string
	createdAt: string
	updatedAt?: string
}

interface WorkspaceSettings {
	theme: 'light' | 'dark' | 'system'
	accentColor: string
	language: 'en' | 'ru'
	table: {
		pageSize: number
		rowHeight: 'compact' | 'default' | 'comfortable'
		schema: null
	}
	genres: string[]
	tags: Array<{
		label: string
		color: string
	}>
	export: {
		format: 'json' | 'csv' | 'xlsx'
		includeSettings: boolean
	}
}

interface CreateWorkspace {
	name: string
}

interface UpdateWorkspace {
	name?: string
}

interface WorkspacePaths {
	workspace: string
	database: string
	settings: string
}

interface WorkspaceStats {
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
}

interface Workspace {
	workspace: WorkspaceRecord
	settings: WorkspaceSettings
	data?: any
}
