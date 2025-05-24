interface Workspace {
	id: string
	name: string
	createdAt: string
	updatedAt: string
	isActive?: boolean
}

interface CreateWorkspaceParams {
	name: string
	schema?: any[]
}

interface WorkspaceStats {
	id: string
	size: number
	tableCount: number
	recordCount: number
}
