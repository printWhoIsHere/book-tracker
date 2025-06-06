import { Column } from '@tanstack/react-table'
import { Check, PlusCircle } from 'lucide-react'

import { cn } from '@renderer/lib/cn'

import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@renderer/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@renderer/components/ui/popover'
import { Separator } from '@renderer/components/ui/separator'

interface FilterOption {
	label: string
	value: string
}

interface ColumnFilterProps<TData, TValue> {
	column?: Column<TData, TValue>
	title: string
	options: FilterOption[]
}

export function ColumnFilter<TData, TValue>({
	column,
	title,
	options,
}: ColumnFilterProps<TData, TValue>) {
	const selectedValues = new Set(column?.getFilterValue() as string[])

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='outline' size='sm' className='h-8 border-dashed'>
					<PlusCircle className='mr-2 size-4' />
					{title}
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation='vertical' className='mx-2 h-4' />
							<Badge
								variant='secondary'
								className='rounded-sm px-1 font-normal lg:hidden'
							>
								{selectedValues.size}
							</Badge>
							<div className='hidden space-x-1 lg:flex'>
								{selectedValues.size > 2 ? (
									<Badge
										variant='secondary'
										className='rounded-sm px-1 font-normal'
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.has(option.value))
										.map((option) => (
											<Badge
												variant='secondary'
												key={option.value}
												className='rounded-sm px-1 font-normal'
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[12.5rem] p-0' align='start'>
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value)

								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(option.value)
											} else {
												selectedValues.add(option.value)
											}
											const filterValues = Array.from(selectedValues)
											column?.setFilterValue(
												filterValues.length ? filterValues : undefined,
											)
										}}
									>
										<div
											className={cn(
												'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible',
											)}
										>
											<Check className='size-4' aria-hidden='true' />
										</div>
										<span>{option.label}</span>
									</CommandItem>
								)
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className='justify-center text-center'
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
