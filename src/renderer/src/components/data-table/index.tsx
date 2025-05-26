import { useRef } from 'react'
import { useDataTable } from '@renderer/providers/data-table-provider'
import { DataTablePagination } from '@renderer/components/data-table/data-table-pagination'
import { DataTableContainer } from '@renderer/components/data-table/data-table-container'
import { DataTableBody } from '@renderer/components/data-table/data-table-body'
import { DataTableHeader } from '@renderer/components/data-table/data-table-header'

export function DataTable() {
	const { table, totalTableWidth } = useDataTable()

	const tableContainerRef = useRef<HTMLDivElement>(null)
	const outerContainerRef = useRef<HTMLDivElement>(null)

	return (
		<div className='flex flex-col flex-1 overflow-hidden'>
			<DataTableContainer
				totalTableWidth={totalTableWidth}
				outerContainerRef={outerContainerRef}
			>
				<DataTableHeader table={table} totalTableWidth={totalTableWidth} />

				<DataTableBody
					table={table}
					totalTableWidth={totalTableWidth}
					rowHeight={64}
					tableContainerRef={tableContainerRef}
					outerContainerRef={outerContainerRef}
				/>
			</DataTableContainer>

			<div className='w-full flex items-center justify-end mt-4'>
				<DataTablePagination table={table} />
			</div>
		</div>
	)
}
