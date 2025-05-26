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
		id: z.string().uuid().optional(),
		updates: UpdateWorkspaceSchema,
	}),
	async (_, data) => {
		const workspaceId = data.id || (await svc.getActive())?.id
		if (!workspaceId) {
			throw new Error('No workspace ID provided and no active workspace')
		}

		logger.info(`Updating workspace via IPC: ${workspaceId}`)
		return await svc.update(workspaceId, data.updates)
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
	z
		.object({
			id: z.string().uuid().optional(),
		})
		.optional(),
	async (_, data) => {
		const workspaceId = data?.id || (await svc.getActive())?.id
		if (!workspaceId) {
			throw new Error('No workspace ID provided and no active workspace')
		}

		logger.debug(`Getting workspace settings via IPC: ${workspaceId}`)
		return await svc.getSettings(workspaceId)
	},
)

handleIpc(
	'workspace:set-settings',
	z.object({
		id: z.string().uuid().optional(),
		settings: WorkspaceSettingsSchema.partial(),
	}),
	async (_, data) => {
		const workspaceId = data.id || (await svc.getActive())?.id
		if (!workspaceId) {
			throw new Error('No workspace ID provided and no active workspace')
		}

		logger.info(`Updating workspace settings via IPC: ${workspaceId}`)
		return await svc.setSettings(workspaceId, data.settings)
	},
)

handleIpc(
	'workspace:get-stats',
	z
		.object({
			id: z.string().uuid().optional(),
		})
		.optional(),
	async (_, data) => {
		const workspaceId = data?.id || (await svc.getActive())?.id
		if (!workspaceId) {
			throw new Error('No workspace ID provided and no active workspace')
		}

		logger.debug(`Getting workspace stats via IPC: ${workspaceId}`)
		return await svc.getStats(workspaceId)
	},
)

handleIpc(
	'workspace:get-paths',
	z
		.object({
			id: z.string().uuid().optional(),
		})
		.optional(),
	async (_, data) => {
		const workspaceId = data?.id || (await svc.getActive())?.id
		if (!workspaceId) {
			throw new Error('No workspace ID provided and no active workspace')
		}

		logger.debug(`Getting workspace paths via IPC: ${workspaceId}`)
		return svc.getPaths(workspaceId)
	},
)

handleIpc(
	'workspace:export',
	z
		.object({
			id: z.string().uuid().optional(),
		})
		.optional(),
	async (_, data) => {
		const workspaceId = data?.id || (await svc.getActive())?.id
		if (!workspaceId) {
			throw new Error('No workspace ID provided and no active workspace')
		}

		logger.info(`Exporting workspace via IPC: ${workspaceId}`)
		return await svc.export(workspaceId)
	},
)
