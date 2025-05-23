import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { createLogger } from '@main/core/logger'
import { WorkspaceService } from './workspace.service'
import { UIColumnSchema, WorkspaceSettingsSchema } from './workspace.schema'

const logger = createLogger('WorkspaceController')
const workspaceService = new WorkspaceService()

const WorkspaceIdSchema = z.object({
	id: z.string().uuid('Invalid workspace ID'),
})

const CreateWorkspaceSchema = z.object({
	name: z.string().min(1, 'Workspace name required').trim(),
	description: z.string().max(500).optional(),
	schema: z.array(UIColumnSchema).optional(),
})

const UpdateWorkspaceSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).trim().optional(),
	description: z.string().max(500).optional(),
	tags: z.array(z.string()).optional(),
})

const UpdateSettingsSchema = z.object({
	id: z.string().uuid(),
	settings: WorkspaceSettingsSchema.partial(),
})

const GetColumnsSchema = z.object({
	id: z.string().uuid(),
	table: z.string().min(1, 'Table name required'),
})

handleIpc('workspace:create', CreateWorkspaceSchema, async (_, data) => {
	logger.info('Creating workspace', { name: data.name })
	return await workspaceService.create(data.name, data.description, data.schema)
})

handleIpc('workspace:list', null, (_, __) => {
	logger.debug('Listing workspaces')
	return workspaceService.list()
})

handleIpc('workspace:get', WorkspaceIdSchema, (_, { id }) => {
	logger.debug('Getting workspace', { id })
	return workspaceService.getById(id)
})

handleIpc('workspace:update', UpdateWorkspaceSchema, async (_, data) => {
	logger.info('Updating workspace', { id: data.id })
	return await workspaceService.update(data.id, data)
})

handleIpc('workspace:delete', WorkspaceIdSchema, async (_, { id }) => {
	logger.info('Deleting workspace', { id })
	await workspaceService.delete(id)
	return { success: true }
})

// Active workspace management
handleIpc('workspace:getActive', null, (_, __) => {
	logger.debug('Getting active workspace')
	return workspaceService.getActive()
})

handleIpc('workspace:setActive', WorkspaceIdSchema, (_, { id }) => {
	logger.info('Setting active workspace', { id })
	workspaceService.setActive(id)
	return { success: true }
})

// Settings management
handleIpc('workspace:getSettings', WorkspaceIdSchema, (_, { id }) => {
	logger.debug('Getting workspace settings', { id })
	return workspaceService.getSettings(id)
})

handleIpc(
	'workspace:updateSettings',
	UpdateSettingsSchema,
	async (_, { id, settings }) => {
		logger.info('Updating workspace settings', { id })
		await workspaceService.updateSettings(id, settings)
		return { success: true }
	},
)

// Database operations
handleIpc('workspace:getColumns', GetColumnsSchema, (_, { id, table }) => {
	logger.debug('Getting table columns', { id, table })
	return workspaceService.getColumns(id, table)
})

// TODO: Utility operations
// handleIpc('workspace:export', WorkspaceIdSchema, async (_, { id }) => {
// 	logger.info('Exporting workspace', { id })
// 	return await workspaceService.exportWorkspace(id)
// })

// handleIpc(
// 	'workspace:import',
// 	z.object({
// 		data: z.any(),
// 		overwrite: z.boolean().default(false),
// 	}),
// 	async (_, { data, overwrite }) => {
// 		logger.info('Importing workspace', { overwrite })
// 		return await workspaceService.importWorkspace(data, overwrite)
// 	},
// )

logger.info('Workspace IPC handlers registered')
