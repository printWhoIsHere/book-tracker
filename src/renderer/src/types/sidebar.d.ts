interface SidebarMenuItem {
	id: string
	title: string
	icon: React.ComponentType<{ className?: string }>
	variant?: 'default' | 'secondary' | 'destructive' | 'ghost'
	type: 'modal' | 'action' | 'link'

	// Для модальных окон
	modal?: {
		component: React.ComponentType<any>
		title: string
		description?: string
		props?: Record<string, unknown>
	}

	// Для действий
	action?: {
		key: string
		handler?: () => void | Promise<void>
		requiresSelection?: boolean
	}

	// Для ссылок
	href?: string

	// Условия видимости
	visible?: () => boolean
	disabled?: () => boolean
}

interface SidebarGroup {
	id: string
	label: string
	items: SidebarMenuItem[]
	collapsible?: boolean
	defaultCollapsed?: boolean
}
