import { ElectronAPI } from '@electron-toolkit/preload'

import type api from '@preload/api'

declare global {
	interface Window {
		electron: ElectronAPI
		api: typeof api
	}
}
