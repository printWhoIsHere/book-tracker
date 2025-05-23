import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import {
	CellActions,
	CellSelect,
	CellText,
	CellNumber,
	CellDate,
	CellSelect as CellSelectInput,
	CellMultiSelect,
} from './cells'
import { SortableHeader } from './headers'
import { MenuHeader } from './headers/header-menu'
import { formatFullName } from '@renderer/utils'

const columnHelper = createColumnHelper<Book>()

// Маппинг типов UI колонок в соответствующие cell компоненты
const getCellComponent = (type: UIColumnType, key: string) => {
	switch (type) {
		case 'InputNumber':
			return ({ row }: any) => <CellNumber row={row} field={key} />
		case 'Date':
			return ({ row }: any) => <CellDate row={row} field={key} />
		case 'Select':
			return ({ row }: any) => <CellSelectInput row={row} field={key} />
		case 'MultiSelect':
			return ({ row }: any) => <CellMultiSelect row={row} field={key} />
		case 'InputText':
		case 'InputTextarea':
		default:
			return ({ row }: any) => <CellText row={row} field={key} />
	}
}

// Определяем какие колонки должны быть сортируемыми
const getSortableColumns = (): string[] => {
	return ['title', 'author', 'genre', 'year']
}

// Специальная обработка для автора (объединение полей)
const getAuthorAccessor = () => {
	return (row: Book) =>
		formatFullName(row.lastName, row.firstName, row.middleName)
}

export const generateColumns = (schema: UIColumn[]): ColumnDef<Book, any>[] => {
	const sortableColumns = getSortableColumns()

	const columns: ColumnDef<Book, any>[] = [
		// Колонка выбора (всегда первая)
		columnHelper.display({
			id: 'select',
			cell: ({ row }) => <CellSelect row={row} field={''} />,
			enableSorting: false,
			enableHiding: false,
			minSize: 60,
			maxSize: 60,
			size: 60,
		}),
	]

	// Генерируем колонки на основе схемы
	schema.forEach((columnConfig) => {
		const { key, label, type } = columnConfig
		const isSortable = sortableColumns.includes(key)

		// Специальная обработка для автора
		if (key === 'author') {
			columns.push(
				columnHelper.accessor(getAuthorAccessor(), {
					id: 'author',
					header: (info) =>
						isSortable ? (
							<SortableHeader info={info} name={label} />
						) : (
							<MenuHeader info={info} name={label} />
						),
					cell: (info) => info.getValue(),
					minSize: getColumnMinSize(key, type),
					maxSize: getColumnMaxSize(key, type),
					size: getColumnSize(key, type),
				}),
			)
			return
		}

		// Специальная обработка для тегов
		if (key === 'tags') {
			columns.push(
				columnHelper.accessor(key as keyof Book, {
					header: (info) => <MenuHeader info={info} name={label} />,
					cell: ({ row }) => <CellTags row={row} />,
					minSize: getColumnMinSize(key, type),
				}),
			)
			return
		}

		// Обычные колонки
		columns.push(
			columnHelper.accessor(key as keyof Book, {
				header: (info) =>
					isSortable ? (
						<SortableHeader info={info} name={label} />
					) : (
						<MenuHeader info={info} name={label} />
					),
				cell:
					type === 'InputText' || type === 'InputTextarea'
						? (info) => info.getValue()
						: getCellComponent(type, key),
				minSize: getColumnMinSize(key, type),
				maxSize: getColumnMaxSize(key, type),
				size: getColumnSize(key, type),
			}),
		)
	})

	// Колонка действий (всегда последняя)
	columns.push(
		columnHelper.display({
			id: 'actions',
			cell: ({ row }) => <CellActions row={row} />,
			enableSorting: false,
			enableHiding: false,
			minSize: 64,
			maxSize: 64,
			size: 64,
		}),
	)

	return columns
}

// Функции для определения размеров колонок
const getColumnMinSize = (key: string, type: UIColumnType): number => {
	// Компактные колонки
	if (['totalVolumes', 'currentVolume', 'year'].includes(key)) {
		return 60
	}

	// Числовые поля
	if (type === 'InputNumber') {
		return 80
	}

	// Текстовые поля
	return 160
}

const getColumnMaxSize = (
	key: string,
	type: UIColumnType,
): number | undefined => {
	// Компактные колонки с фиксированным размером
	if (['totalVolumes', 'currentVolume', 'year'].includes(key)) {
		return 60
	}

	return undefined
}

const getColumnSize = (key: string, type: UIColumnType): number | undefined => {
	// Колонки с фиксированным размером
	if (['totalVolumes', 'currentVolume', 'year'].includes(key)) {
		return 60
	}

	return undefined
}
