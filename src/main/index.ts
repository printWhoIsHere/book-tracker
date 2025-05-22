import { app } from 'electron'
import { electronApp } from '@electron-toolkit/utils'

import { createWindow } from '@main/core/window'

import '@main/core/app'
import '@main/core/config'

import '@main/modules/workspace/workspace.controller'
import { WorkspaceService } from './modules/workspace/workspace.service'

app.whenReady().then(() => {
	electronApp.setAppUserModelId('book-tracking.app')

	// const svc = new WorkspaceService()
	// svc.create('Default')
	// svc.create('Default2')

	createWindow()
})
