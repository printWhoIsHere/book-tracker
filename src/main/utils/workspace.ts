import path from 'path'
import { config } from '@main/core/config'
import { NotFoundError } from '@main/core/errors'
import { WorkspaceRecord } from '@main/modules/workspace/workspace.schema'

/**
 * Генерирует пути для workspace
 */
export function getWorkspacePaths(workspaceId: string) {
	const workspaceDir = path.join(config.rootDir, 'workspaces', workspaceId)

	return {
		workspace: workspaceDir,
		database: path.join(workspaceDir, 'database.db'),
		settings: path.join(workspaceDir, 'settings.json'),
		// Относительные пути для менеджеров
		relativeDatabasePath: `workspaces/${workspaceId}/database.db`,
		relativeWorkspacePath: `workspaces/${workspaceId}`,
	}
}

/**
 * Валидирует существование workspace
 */
export function validateWorkspaceExists(
	workspaces: WorkspaceRecord[],
	id: string,
): void {
	const exists = workspaces.some((w) => w.id === id)
	if (!exists) {
		throw new NotFoundError('Workspace', id)
	}
}

/**
 * Проверяет уникальность имени workspace
 */
export function validateUniqueWorkspaceName(
	workspaces: WorkspaceRecord[],
	name: string,
	excludeId?: string,
): void {
	const existing = workspaces.find((w) => w.name === name && w.id !== excludeId)
	if (existing) {
		throw new Error(`Workspace with name "${name}" already exists`)
	}
}

/**
 * Проверяет лимит количества workspaces
 */
export function validateWorkspaceLimit(
	workspaces: WorkspaceRecord[],
	limit: number = 10,
): void {
	if (workspaces.length >= limit) {
		throw new Error(`Cannot create more than ${limit} workspaces`)
	}
}
