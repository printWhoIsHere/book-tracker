import path from 'path'
import { config } from '@main/core/config'

export function getWorkspacesDir(): string {
	return path.join(config.rootDir, 'workspaces')
}

export function getBackupsDir(): string {
	return path.join(config.rootDir, 'backups')
}

export function getLogsDir(): string {
	return path.join(config.rootDir, 'logs')
}
