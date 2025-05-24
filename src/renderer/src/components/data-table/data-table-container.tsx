interface TableContainerProps {
	children: React.ReactNode
	totalTableWidth: number
	outerContainerRef: React.RefObject<HTMLDivElement>
}

export function TableContainer({
	children,
	totalTableWidth,
	outerContainerRef,
}: TableContainerProps) {
	return (
		<div className='flex flex-col border border-border rounded-sm overflow-hidden flex-1'>
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
