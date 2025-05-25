import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				'@main': resolve(__dirname, 'src/main'),
				'@preload': resolve(__dirname, 'src/preload'),
			},
		},
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				'@main': resolve(__dirname, 'src/main'),
				'@preload': resolve(__dirname, 'src/preload'),
			},
		},
	},
	renderer: {
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src'),
			},
		},
		plugins: [react()],
	},
})
