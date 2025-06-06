interface DataTableContainerProps {
	children: React.ReactNode
	totalTableWidth: number
	outerContainerRef: React.RefObject<HTMLDivElement>
}

export function DataTableContainer({
	children,
	totalTableWidth,
	outerContainerRef,
}: DataTableContainerProps) {
	return (
		<div className='flex flex-col border border-border rounded-xl overflow-hidden flex-1'>
			<div ref={outerContainerRef} className='overflow-x-hidden flex-1'>
				<div
					style={{ minWidth: totalTableWidth, width: '100%', height: '100%' }}
				>
					{children}
				</div>
			</div>
		</div>
	)
}
