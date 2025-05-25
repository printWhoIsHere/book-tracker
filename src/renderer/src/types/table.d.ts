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
	value: keyof TData
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
