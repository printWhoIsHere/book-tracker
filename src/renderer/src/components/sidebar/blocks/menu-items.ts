import {
	Plus,
	Upload,
	Download,
	Trash,
	Sliders,
	Table,
	RotateCcw,
	BookOpenCheck,
	Tags,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import type { buttonVariants } from '@renderer/components/ui/button'
import * as Modal from '@renderer/components/modals'

/** Описание одного пункта меню */
export interface SidebarMenuItem {
	title: string
	icon: LucideIcon
	variant?: VariantProps<typeof buttonVariants>['variant']
	kind: 'modal' | 'action'
	modal?: React.ComponentType<any>
	modalTitle?: string
	modalDescription?: string
	modalProps?: Record<string, unknown>
	actionKey?: string
}

/** Группа пунктов меню */
export interface SidebarGroup {
	label: string
	items: SidebarMenuItem[]
}

/** Данные для Sidebar */
export const sidebarGroups: SidebarGroup[] = [
	{
		label: 'Actions',
		items: [
			{
				title: 'Добавить книгу',
				icon: Plus,
				variant: 'secondary',
				kind: 'modal',
				modal: Modal.BookFormModal,
				modalTitle: 'Добавить книгу',
				modalDescription: 'Введите информацию о новой книге',
			},
			{
				title: 'Экспорт данных',
				icon: Upload,
				kind: 'action',
				actionKey: 'exportBooks',
			},
			{
				title: 'Импорт данных',
				icon: Download,
				kind: 'modal',
				modal: Modal.BookFormModal,
				modalTitle: 'Импорт данных',
				modalDescription: 'Загрузите данные из Excel файла',
			},
			{
				title: 'Удалить выбранные книги',
				icon: Trash,
				variant: 'destructive',
				kind: 'action',
				actionKey: 'deleteSelected',
			},
		],
	},
	{
		label: 'Settings',
		items: [
			{
				title: 'Общие настройки',
				icon: Sliders,
				kind: 'modal',
				modal: Modal.GeneralSettingsModal,
				modalTitle: 'Общие настройки',
				modalDescription: 'Настройка темы, вида и интерфейса приложения',
			},
			{
				title: 'Настройки таблицы',
				icon: Table,
				kind: 'modal',
				modal: Modal.TableSettingsModal,
				modalTitle: 'Настройки таблицы',
				modalDescription: 'Конфигурация отображения таблицы и колонок',
			},
			{
				title: 'Резервные копии',
				icon: RotateCcw,
				kind: 'modal',
				modal: Modal.BackupSettingsModal,
				modalTitle: 'Резервные копии',
				modalDescription: 'Настройка автоматического резервного копирования',
			},
			{
				title: 'Настройка жанров',
				icon: BookOpenCheck,
				kind: 'modal',
				modal: Modal.GenresSettingsModal,
				modalTitle: 'Настройка жанров',
				modalDescription: 'Добавьте, измените или удалите жанры книг',
			},
			{
				title: 'Настройка тегов',
				icon: Tags,
				kind: 'modal',
				modal: Modal.TagsSettingsModal,
				modalTitle: 'Настройка тегов',
				modalDescription: 'Управление пользовательскими тегами и цветами',
			},
		],
	},
]
