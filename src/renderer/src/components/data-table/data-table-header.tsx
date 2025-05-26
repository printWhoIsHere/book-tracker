import { Table as ReactTable } from '@tanstack/react-table'
import * as Table from '@renderer/components/ui/table'
import { HeaderDefault } from '@renderer/components/data-table/headers'

interface DataTableHeaderProps<TData> {
	table: ReactTable<TData>
	totalTableWidth: number
}

export function DataTableHeader<TData>({
	table,
	totalTableWidth,
}: DataTableHeaderProps<TData>) {
	const tableProps = {
		style: {
			minWidth: `${totalTableWidth}px`,
			width: '100%',
			tableLayout: 'fixed' as const,
		},
	}

	return (
		<Table.Table {...tableProps}>
			<Table.TableHeader className='px-0 overflow-hidden'>
				{table.getHeaderGroups().map((headerGroup) => (
					<Table.TableRow key={headerGroup.id} className='flex w-full'>
						{headerGroup.headers.map((header) => (
							<HeaderDefault key={header.column.id} header={header} />
						))}
					</Table.TableRow>
				))}
			</Table.TableHeader>
		</Table.Table>
	)
}
