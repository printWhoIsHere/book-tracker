import { createContext, useContext, useState } from 'react'

const initialState: ThemeProviderState = {
	theme: { mode: 'dark', color: 'zinc' },
	setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
	children,
	defaultTheme = initialState.theme,
	storageKey = 'distort-ui-theme',
	...props
}: ThemeProviderProps) {
	const [storedTheme, setStoredTheme] = useState<Theme>(defaultTheme)

	const value = {
		theme: storedTheme,
		setTheme: (theme: Theme) => {
			setStoredTheme(theme)
		},
	}

	if (storedTheme.mode === 'system') {
		const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'

		return (
			<ThemeProviderContext.Provider {...props} value={value}>
				<div data-theme={`${storedTheme.color}-${systemMode}`}>{children}</div>
			</ThemeProviderContext.Provider>
		)
	}

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			<div
				className={`${storedTheme.mode}`}
				data-theme={`${storedTheme.color}-${storedTheme.mode}`}
			>
				{children}
			</div>
		</ThemeProviderContext.Provider>
	)
}

/**
 * Hook to get and set new theme throughout application
 */
export const useTheme = () => {
	const context = useContext(ThemeProviderContext)

	if (context === undefined)
		throw new Error('useTheme must be used within a ThemeProvider')

	return context
}
