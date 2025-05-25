import { useState } from 'react'
import { Column } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'

import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'

interface ColumnSearchProps<TData, TValue> {
	column?: Column<TData, TValue>
	placeholder?: string
}

export function ColumnSearch<TData, TValue>({
	column,
	placeholder = 'Search...',
}: ColumnSearchProps<TData, TValue>) {
	const [value, setValue] = useState((column?.getFilterValue() as string) ?? '')

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setValue(value)
		column?.setFilterValue(value || undefined)
	}

	const handleClear = () => {
		setValue('')
		column?.setFilterValue(undefined)
	}

	return (
		<div className='relative'>
			<Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
			<Input
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				className='group px-8 h-8'
			/>
			{!value && (
				<kbd
					className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground opacity-80 group-focus-within:opacity-0 transition-opacity'
					aria-hidden='true'
				>
					⌘F
				</kbd>
			)}
			{value && (
				<Button
					variant='ghost'
					size='sm'
					className='absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent'
					onClick={handleClear}
				>
					<X className='h-4 w-4' />
				</Button>
			)}
		</div>
	)
}
