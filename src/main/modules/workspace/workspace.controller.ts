import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { createLogger } from '@main/core/logger'
import { WorkspaceService } from './workspace.service'
import {
	CreateWorkspaceSchema,
	UpdateWorkspaceSchema,
	WorkspaceIdSchema,
	UpdateSettingsSchema,
} from './workspace.schema'

const logger = createLogger('WorkspaceController')
const workspaceService = new WorkspaceService()

// Core workspace operations
handleIpc('workspace:create', CreateWorkspaceSchema, async (_, data) => {
	try {
		const id = await workspaceService.create(data.name)
		logger.info('Workspace created', { id, name: data.name })
		return { id, success: true }
	} catch (error) {
		logger.error('Failed to create workspace', { name: data.name, error })
		throw error
	}
})

handleIpc('workspace:list', null, () => {
	return workspaceService.list()
})

handleIpc('workspace:get-active', null, () => {
	return workspaceService.getActive()
})

handleIpc('workspace:set-active', WorkspaceIdSchema, (_, data) => {
	try {
		workspaceService.setActive(data.id)
		logger.info('Active workspace changed', { id: data.id })
		return { success: true }
	} catch (error) {
		logger.error('Failed to set active workspace', { id: data.id, error })
		throw error
	}
})

handleIpc('workspace:get-by-id', WorkspaceIdSchema, (_, data) => {
	return workspaceService.getById(data.id)
})

handleIpc(
	'workspace:update',
	z.object({
		id: z.string().uuid(),
		updates: UpdateWorkspaceSchema,
	}),
	async (_, data) => {
		try {
			const workspace = await workspaceService.update(data.id, data.updates)
			logger.info('Workspace updated', { id: data.id })
			return workspace
		} catch (error) {
			logger.error('Failed to update workspace', { id: data.id, error })
			throw error
		}
	},
)

handleIpc('workspace:delete', WorkspaceIdSchema, async (_, data) => {
	try {
		await workspaceService.delete(data.id)
		logger.info('Workspace deleted', { id: data.id })
		return { success: true }
	} catch (error) {
		logger.error('Failed to delete workspace', { id: data.id, error })
		throw error
	}
})

// Settings operations
handleIpc('workspace:get-settings', WorkspaceIdSchema, (_, data) => {
	return workspaceService.getSettings(data.id)
})

handleIpc(
	'workspace:update-settings',
	UpdateSettingsSchema,
	async (_, data) => {
		try {
			await workspaceService.updateSettings(data.id, data.settings)
			logger.info('Workspace settings updated', { id: data.id })
			return { success: true }
		} catch (error) {
			logger.error('Failed to update workspace settings', {
				id: data.id,
				error,
			})
			throw error
		}
	},
)

// Utility operations
handleIpc('workspace:export', WorkspaceIdSchema, async (_, data) => {
	return await workspaceService.exportWorkspace(data.id)
})

handleIpc('workspace:get-size', WorkspaceIdSchema, async (_, data) => {
	return await workspaceService.getWorkspaceSize(data.id)
})

handleIpc('workspace:get-stats', WorkspaceIdSchema, async (_, data) => {
	try {
		const [size, dbStats] = await Promise.all([
			workspaceService.getWorkspaceSize(data.id),
			workspaceService.getDatabaseStats(data.id),
		])

		return {
			size,
			...dbStats,
			id: data.id,
		}
	} catch (error) {
		logger.error('Failed to get workspace stats', { id: data.id, error })
		throw error
	}
})

// Database operations
handleIpc('workspace:vacuum-db', WorkspaceIdSchema, async (_, data) => {
	try {
		await workspaceService.vacuumDatabase(data.id)
		logger.info('Database vacuumed', { id: data.id })
		return { success: true }
	} catch (error) {
		logger.error('Failed to vacuum database', { id: data.id, error })
		throw error
	}
})
