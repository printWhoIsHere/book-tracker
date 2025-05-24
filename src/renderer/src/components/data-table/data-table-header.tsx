import { Table as ReactTable } from '@tanstack/react-table'
import { Table, TableHead, TableRow } from '@renderer/components/ui/table'
import { HeaderDefault } from '@renderer/components/data-table/headers'

interface TableHeaderProps<TData> {
	table: ReactTable<TData>
	totalTableWidth: number
}

export function TableHeader<TData>({
	table,
	totalTableWidth,
}: TableHeaderProps<TData>) {
	const tableProps = {
		style: {
			minWidth: `${totalTableWidth}px`,
			width: '100%',
			tableLayout: 'fixed' as const,
		},
	}

	return (
		<Table {...tableProps}>
			<TableHead className='px-0 overflow-hidden'>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id} className='flex w-full'>
						{headerGroup.headers.map((header) => (
							<HeaderDefault key={header.column.id} header={header} />
						))}
					</TableRow>
				))}
			</TableHead>
		</Table>
	)
}
