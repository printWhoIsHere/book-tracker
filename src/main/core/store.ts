import Store from 'electron-store'
import { z } from 'zod'

import { config } from '@main/core/config'
import { WorkspaceRecordSchema } from '@main/modules/workspace/workspace.schema'
import { BackupSettingsSchema } from '@main/modules/backup/backup.schema'

export const GlobalSchema = z.object({
	activeWorkspaceId: z.string().uuid().nullable(),
	workspaces: WorkspaceRecordSchema.array(),
	backups: BackupSettingsSchema,
})
export type GlobalSchema = z.infer<typeof GlobalSchema>

const defaults: GlobalSchema = {
	activeWorkspaceId: null,
	workspaces: [],
	backups: {
		auto: false,
		interval: 1,
		max: 5,
		lastBackup: null,
		nextBackup: null,
	},
}

export const store = new Store<GlobalSchema>({
	defaults,
	name: 'global',
	cwd: config.rootDir,
})
