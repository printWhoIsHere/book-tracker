import { z } from 'zod'

export const BackupRecordSchema = z.object({
	id: z.string(),
	workspaceId: z.string().uuid(),
	workspaceName: z.string(),
	createdAt: z.string(),
	fileName: z.string(),
	size: z.number(),
})
export type BackupRecord = z.infer<typeof BackupRecordSchema>

export const BackupSettingsSchema = z.object({
	auto: z.boolean(),
	interval: z.number().min(1).max(365), // days
	max: z.number().min(1).max(50),
	lastBackup: z.string().nullable(),
	nextBackup: z.string().nullable(),
})
export type BackupSettings = z.infer<typeof BackupSettingsSchema>

export const CreateBackupSchema = z.object({
	workspaceId: z.string().uuid(),
	name: z.string().optional(),
})

export const RestoreBackupSchema = z.object({
	backupId: z.string(),
	workspaceId: z.string().uuid(),
})
