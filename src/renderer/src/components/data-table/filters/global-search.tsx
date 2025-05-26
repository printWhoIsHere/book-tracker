import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'

interface GlobalSearchProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	isLoading?: boolean
	resultCount?: number
	disabled?: boolean
}

export function GlobalSearch({
	value,
	onChange,
	placeholder = 'Search...',
	isLoading = false,
	resultCount,
	disabled = false,
}: GlobalSearchProps) {
	const [localValue, setLocalValue] = useState(value)
	const [isFocused, setIsFocused] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setLocalValue(value)
	}, [value])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setLocalValue(newValue)
		onChange(newValue)
	}

	const handleClear = () => {
		setLocalValue('')
		onChange('')
		inputRef.current?.focus()
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (localValue) {
				handleClear()
			} else {
				inputRef.current?.blur()
			}
		}
	}

	const showResultCount = typeof resultCount === 'number' && localValue.trim()
	const hasValue = localValue.trim().length > 0

	useEffect(() => {
		const handleKeyboardShortcut = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
				e.preventDefault()
				inputRef.current?.focus()
			}
		}

		document.addEventListener('keydown', handleKeyboardShortcut)
		return () => {
			document.removeEventListener('keydown', handleKeyboardShortcut)
		}
	}, [])

	return (
		<div className='relative flex items-center mx-2'>
			<div className='relative flex-1'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />

				<Input
					ref={inputRef}
					type='text'
					placeholder={placeholder}
					value={localValue}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					disabled={disabled}
					className='pl-10 pr-16 h-9'
				/>

				<div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
					{isLoading && (
						<Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
					)}

					{!isLoading && hasValue && (
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='h-6 w-6 p-0 hover:bg-muted'
							onClick={handleClear}
							tabIndex={-1}
						>
							<X className='h-3 w-3' />
							<span className='sr-only'>Очистить поиск</span>
						</Button>
					)}

					{!hasValue && !isFocused && (
						<kbd className='pointer-events-none select-none rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground'>
							⌘F
						</kbd>
					)}
				</div>
			</div>

			{showResultCount && (
				<Badge variant='secondary' className='ml-2 text-xs font-normal'>
					{resultCount} {getResultLabel(resultCount)}
				</Badge>
			)}
		</div>
	)
}

function getResultLabel(count: number): string {
	if (count === 1) return 'результат'
	if (count >= 2 && count <= 4) return 'результата'
	return 'результатов'
}
