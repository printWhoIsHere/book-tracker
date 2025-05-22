import React from 'react'
import ReactDOM from 'react-dom/client'

import '@renderer/assets/styles/global.css'

import App from '@renderer/app/App'
import RootLayout from '@renderer/app/Layout'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RootLayout>
			<App />
		</RootLayout>
	</React.StrictMode>,
)
