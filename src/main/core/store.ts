import Store from 'electron-store'
import { z } from 'zod'

import { rootDir } from '@main/core/config'
import { WorkspaceRecordSchema } from '@main/modules/workspace/workspace.schema'

export const GlobalSchema = z.object({
	activeWorkspaceId: z.string().uuid().nullable(),
	workspaces: WorkspaceRecordSchema.array(),
	backups: z.object({
		auto: z.boolean(),
		interval: z.number(),
		max: z.number(),
		last: z.string(),
		backupTime: z.string().optional(),
	}),
})
export type GlobalSchema = z.infer<typeof GlobalSchema>

const defaults: GlobalSchema = {
	activeWorkspaceId: null,
	workspaces: [],
	backups: {
		auto: false,
		interval: 1,
		max: 5,
		last: new Date().toISOString(),
	},
}

export const store = new Store<GlobalSchema>({
	defaults,
	name: 'global',
	cwd: rootDir,
})
