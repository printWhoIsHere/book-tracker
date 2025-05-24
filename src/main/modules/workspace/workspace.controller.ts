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
const svc = new WorkspaceService()

// Core workspace operations
handleIpc('workspace:create', CreateWorkspaceSchema, async (_, data) => {
	try {
		const id = await svc.create(data.name)
		logger.info('Workspace created', { id, name: data.name })
		return { id, success: true }
	} catch (error) {
		logger.error('Failed to create workspace', { name: data.name, error })
		throw error
	}
})

handleIpc('workspace:list', null, () => {
	return svc.list()
})

handleIpc('workspace:get-active', null, () => {
	return svc.getActive()
})

handleIpc('workspace:set-active', WorkspaceIdSchema, (_, data) => {
	try {
		svc.setActive(data.id)
		logger.info('Active workspace changed', { id: data.id })
		return { success: true }
	} catch (error) {
		logger.error('Failed to set active workspace', { id: data.id, error })
		throw error
	}
})

handleIpc(
	'workspace:update',
	z.object({
		id: z.string().uuid(),
		updates: UpdateWorkspaceSchema,
	}),
	async (_, data) => {
		try {
			const workspace = await svc.update(data.id, data.updates)
			logger.info('Workspace updated', { id: data.id })
			return workspace
		} catch (error) {
			logger.error('Failed to update workspace', { id: data.id, error })
			throw error
		}
	},
)

handleIpc('workspace:remove', WorkspaceIdSchema, async (_, data) => {
	try {
		await svc.delete(data.id)
		logger.info('Workspace deleted', { id: data.id })
		return { success: true }
	} catch (error) {
		logger.error('Failed to delete workspace', { id: data.id, error })
		throw error
	}
})

// Settings operations
handleIpc('workspace:get-settings', WorkspaceIdSchema, (_, data) => {
	return svc.getSettings(data.id)
})

handleIpc('workspace:set-settings', UpdateSettingsSchema, async (_, data) => {
	try {
		await svc.updateSettings(data.id, data.settings)
		logger.info('Workspace settings updated', { id: data.id })
		return { success: true }
	} catch (error) {
		logger.error('Failed to update workspace settings', {
			id: data.id,
			error,
		})
		throw error
	}
})
