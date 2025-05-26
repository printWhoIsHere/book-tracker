type RowHeight = 'compact' | 'default' | 'comfortable'

interface SearchParams {
	[key: string]: string | string[] | undefined
}

interface Option {
	label: string
	value: string
	icon?: React.ComponentType<{ className?: string }>
	withCount?: boolean
}

interface DataTableFilterField<TData> {
	label: string
	value: keyof TData | 'search'
	placeholder?: string
	options?: Option[]
}

interface DataTableFilterOption<TData> {
	id: string
	label: string
	value: keyof TData
	options: Option[]
	filterValues?: string[]
	filterOperator?: string
	isMulti?: boolean
}

interface YearRange {
	label: string
	from: number
	to: number
}
