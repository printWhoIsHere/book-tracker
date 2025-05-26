import {
	Plus,
	Upload,
	Download,
	Sliders,
	Table,
	RotateCcw,
	BookOpenCheck,
	Tags,
} from 'lucide-react'
import * as Modal from '@renderer/components/modals'

export const sidebarConfig: SidebarGroup[] = [
	{
		id: 'actions',
		label: 'Действия',
		items: [
			{
				id: 'add-book',
				title: 'Добавить книгу',
				icon: Plus,
				variant: 'secondary',
				type: 'modal',
				modal: {
					component: Modal.BookFormModal,
					title: 'Добавить книгу',
					description: 'Введите информацию о новой книге',
				},
			},
			{
				id: 'export-data',
				title: 'Экспорт данных',
				icon: Upload,
				type: 'action',
				action: {
					key: 'exportBooks',
				},
			},
			{
				id: 'import-data',
				title: 'Импорт данных',
				icon: Download,
				type: 'modal',
				modal: {
					component: Modal.ImportModal,
					title: 'Импорт данных',
					description: 'Загрузите данные из Excel файла',
				},
			},
		],
	},
	{
		id: 'settings',
		label: 'Настройки',
		collapsible: true,
		items: [
			{
				id: 'general-settings',
				title: 'Общие настройки',
				icon: Sliders,
				type: 'modal',
				modal: {
					component: Modal.GeneralSettingsModal,
					title: 'Общие настройки',
					description: 'Настройка темы, вида и интерфейса приложения',
				},
			},
			{
				id: 'table-settings',
				title: 'Настройки таблицы',
				icon: Table,
				type: 'modal',
				modal: {
					component: Modal.TableSettingsModal,
					title: 'Настройки таблицы',
					description: 'Конфигурация отображения таблицы и колонок',
				},
			},
			{
				id: 'backup-settings',
				title: 'Резервные копии',
				icon: RotateCcw,
				type: 'modal',
				modal: {
					component: Modal.BackupSettingsModal,
					title: 'Резервные копии',
					description: 'Настройка автоматического резервного копирования',
				},
			},
			{
				id: 'genres-settings',
				title: 'Настройка жанров',
				icon: BookOpenCheck,
				type: 'modal',
				modal: {
					component: Modal.GenresSettingsModal,
					title: 'Настройка жанров',
					description: 'Добавьте, измените или удалите жанры книг',
				},
			},
			{
				id: 'tags-settings',
				title: 'Настройка тегов',
				icon: Tags,
				type: 'modal',
				modal: {
					component: Modal.TagsSettingsModal,
					title: 'Настройка тегов',
					description: 'Управление пользовательскими тегами и цветами',
				},
			},
		],
	},
]
