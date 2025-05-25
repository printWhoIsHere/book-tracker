import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { createLogger } from '@main/core/logger'
import { WorkspaceService } from './workspace.service'
import {
	CreateWorkspaceSchema,
	UpdateWorkspaceSchema,
	WorkspaceSettingsSchema,
} from './workspace.schema'

const logger = createLogger('WorkspaceController')
const svc = new WorkspaceService()

handleIpc('workspace:create', CreateWorkspaceSchema, async (_, data) => {
	logger.info('Creating workspace via IPC')
	return await svc.create(data)
})

handleIpc('workspace:list', null, async () => {
	logger.debug('Getting workspaces list via IPC')
	return svc.list()
})

handleIpc('workspace:get-active', null, async () => {
	logger.debug('Getting active workspace via IPC')
	return await svc.getActive()
})

handleIpc(
	'workspace:set-active',
	z.object({
		id: z.string().uuid().nullable(),
	}),
	async (_, data) => {
		logger.info(`Setting active workspace via IPC: ${data.id}`)
		await svc.setActive(data.id)
		return { success: true }
	},
)

handleIpc(
	'workspace:update',
	z.object({
		id: z.string().uuid(),
		updates: UpdateWorkspaceSchema,
	}),
	async (_, data) => {
		logger.info(`Updating workspace via IPC: ${data.id}`)
		return await svc.update(data.id, data.updates)
	},
)

handleIpc(
	'workspace:remove',
	z.object({
		id: z.string().uuid(),
	}),
	async (_, data) => {
		logger.info(`Removing workspace via IPC: ${data.id}`)
		await svc.delete(data.id)
		return { success: true }
	},
)

handleIpc(
	'workspace:get-settings',
	z.object({
		id: z.string().uuid(),
	}),
	async (_, data) => {
		logger.debug(`Getting workspace settings via IPC: ${data.id}`)
		return await svc.getSettings(data.id)
	},
)

handleIpc(
	'workspace:set-settings',
	z.object({
		id: z.string().uuid(),
		settings: WorkspaceSettingsSchema.partial(),
	}),
	async (_, data) => {
		logger.info(`Updating workspace settings via IPC: ${data.id}`)
		return await svc.setSettings(data.id, data.settings)
	},
)

handleIpc(
	'workspace:get-stats',
	z.object({
		id: z.string().uuid(),
	}),
	async (_, data) => {
		logger.debug(`Getting workspace stats via IPC: ${data.id}`)
		return await svc.getStats(data.id)
	},
)
