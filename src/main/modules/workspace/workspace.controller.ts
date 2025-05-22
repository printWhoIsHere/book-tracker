import { z } from 'zod'
import { handleIpc } from '@main/utils/ipc'
import { WorkspaceService } from './workspace.service'
import { UIColumnSchema } from './workspace.schema'

const svc = new WorkspaceService()

const IdSchema = z.object({ id: z.string().uuid() })
const CreateSchema = z.object({
	name: z.string().min(1),
	schema: z.array(UIColumnSchema).optional(),
})
const RenameSchema = z.object({
	id: z.string().uuid(),
	newName: z.string().min(1),
})

handleIpc('workspace:create', CreateSchema, (_, { name, schema }) => {
	return svc.create(name, schema)
})

handleIpc('workspace:list', null, () => {
	return svc.list()
})

handleIpc('workspace:getActive', null, () => {
	return svc.getActive()
})

handleIpc('workspace:setActive', IdSchema, (_, { id }) => {
	return svc.setActive(id)
})

handleIpc('workspace:delete', IdSchema, (_, { id }) => {
	svc.delete(id)
})

handleIpc('workspace:rename', RenameSchema, (_, { id, newName }) => {
	svc.rename(id, newName)
})

handleIpc('workspace:getSettings', IdSchema, (_, { id }) => {
	return svc.getSettings(id)
})

handleIpc(
	'workspace:updateSettings',
	z.object({ id: z.string().uuid(), patch: z.any() }),
	(_, { id, patch }) => {
		svc.updateSettings(id, patch)
	},
)

handleIpc(
	'workspace:getColumns',
	z.object({ id: z.string().uuid(), table: z.string().min(1) }),
	(_, { id, table }) => {
		return svc.getColumns(id, table)
	},
)
