import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@renderer/components/ui/select'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Separator } from '@renderer/components/ui/separator'

import { cn } from '@renderer/lib/utils'
import { useWorkspace } from '@renderer/hooks/useWorkspace'

const UIColumnTypes: UIColumnType[] = [
	'InputText',
	'InputTextarea',
	'InputNumber',
	'Select',
	'MultiSelect',
	'Date',
]

const UIColumnTypeLabels: Record<UIColumnType, string> = {
	InputText: 'Text Input',
	InputTextarea: 'Textarea',
	InputNumber: 'Number',
	Select: 'Select',
	MultiSelect: 'Multi Select',
	Date: 'Date',
}

const workspaceFormSchema = z.object({
	workspaceName: z.string().min(1, { message: 'Введите название' }),
	columns: z
		.array(
			z.object({
				key: z
					.string()
					.min(1, 'Key is required')
					.regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Key must be valid identifier'),
				label: z.string().min(1, 'Label is required'),
				type: z.enum([
					'InputText',
					'InputTextarea',
					'InputNumber',
					'Select',
					'MultiSelect',
					'Date',
				]),
				required: z.boolean(),
			}),
		)
		.optional(),
})

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>

function CreateWorkspaceForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const { create: createWorkspace, isCreating } = useWorkspace()

	const form = useForm<WorkspaceFormValues>({
		resolver: zodResolver(workspaceFormSchema),
		defaultValues: {
			workspaceName: '',
			columns: [],
		},
	})

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors },
	} = form
	const watchedColumns = watch('columns') || []

	const addColumn = () => {
		const currentColumns = getValues('columns') || []
		setValue('columns', [
			...currentColumns,
			{
				key: '',
				label: '',
				type: 'InputText' as UIColumnType,
				required: false,
			},
		])
	}

	const removeColumn = (index: number) => {
		const currentColumns = getValues('columns') || []
		setValue(
			'columns',
			currentColumns.filter((_, i) => i !== index),
		)
	}

	const updateColumn = (index: number, field: keyof UIColumn, value: any) => {
		const currentColumns = getValues('columns') || []
		const updated = [...currentColumns]
		updated[index] = { ...updated[index], [field]: value }
		setValue('columns', updated)
	}

	const onSubmit = async (values: WorkspaceFormValues) => {
		try {
			const newId = await createWorkspace({
				name: values.workspaceName,
				schema: values.columns,
			})
			console.log('Created workspace with ID:', newId)
			form.reset({ workspaceName: '', columns: [] })
		} catch (error) {
			console.error('Create workspace error', error)
		}
	}

	const onDefaultClick = async () => {
		const workspaceName = getValues('workspaceName')
		if (!workspaceName.trim()) {
			form.setError('workspaceName', { message: 'Введите название workspace' })
			return
		}

		try {
			const newId = await createWorkspace({
				name: workspaceName,
			})
			console.log('Created with default schema:', newId)
			form.reset({ workspaceName: '', columns: [] })
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<div
			className={cn('flex flex-col gap-6 max-h-[90vh]', className)}
			{...props}
		>
			<Card className='overflow-hidden shadow-sm dark:border-muted dark:shadow-none'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					{/* Левая часть: Форма */}
					<form onSubmit={handleSubmit(onSubmit)} className='p-6 md:p-8'>
						<div className='flex flex-col gap-6'>
							<div className='flex flex-col items-center text-center'>
								<h1 className='text-2xl font-bold'>Create Workspace</h1>
								<p className='text-balance text-muted-foreground'>
									Create custom table or choose default
								</p>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='workspaceName'>Name</Label>
								<Input
									id='workspaceName'
									type='text'
									placeholder='My Workspace'
									{...register('workspaceName')}
								/>
								{errors.workspaceName && (
									<p className='text-sm text-red-500'>
										{errors.workspaceName.message}
									</p>
								)}
							</div>

							{/* Кнопки управления */}
							<div className='flex justify-between items-center'>
								<Label className='text-base font-medium'>Table Schema</Label>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={addColumn}
									className='flex items-center gap-2'
								>
									<Plus className='h-4 w-4' />
									Add Column
								</Button>
							</div>

							{/* Список колонок */}
							<ScrollArea className='max-h-[300px]'>
								<div className='space-y-4'>
									{watchedColumns.map((column, index) => (
										<Card key={index} className='p-4'>
											<div className='grid gap-3'>
												<div className='flex items-center justify-between'>
													<h4 className='text-sm font-medium'>
														Column {index + 1}
													</h4>
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() => removeColumn(index)}
														className='h-8 w-8 p-0 text-red-500 hover:text-red-700'
													>
														<Trash2 className='h-4 w-4' />
													</Button>
												</div>

												<div className='grid grid-cols-2 gap-3'>
													<div>
														<Label
															htmlFor={`column-${index}-key`}
															className='text-xs text-muted-foreground'
														>
															Key (ID)
														</Label>
														<Input
															id={`column-${index}-key`}
															placeholder='field_name'
															value={column.key}
															onChange={(e) =>
																updateColumn(index, 'key', e.target.value)
															}
														/>
													</div>
													<div>
														<Label
															htmlFor={`column-${index}-label`}
															className='text-xs text-muted-foreground'
														>
															Label
														</Label>
														<Input
															id={`column-${index}-label`}
															placeholder='Field Name'
															value={column.label}
															onChange={(e) =>
																updateColumn(index, 'label', e.target.value)
															}
														/>
													</div>
												</div>

												<div className='grid grid-cols-2 gap-3'>
													<div>
														<Label
															htmlFor={`column-${index}-type`}
															className='text-xs text-muted-foreground'
														>
															Type
														</Label>
														<Select
															value={column.type}
															onValueChange={(value: UIColumnType) =>
																updateColumn(index, 'type', value)
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{UIColumnTypes.map((type) => (
																	<SelectItem key={type} value={type}>
																		{UIColumnTypeLabels[type]}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div className='flex items-end'>
														<div className='flex items-center space-x-2'>
															<Checkbox
																id={`column-${index}-required`}
																checked={column.required}
																onCheckedChange={(checked) =>
																	updateColumn(index, 'required', checked)
																}
															/>
															<Label
																htmlFor={`column-${index}-required`}
																className='text-xs text-muted-foreground'
															>
																Required
															</Label>
														</div>
													</div>
												</div>
											</div>
										</Card>
									))}

									{watchedColumns.length === 0 && (
										<div className='text-center py-8 text-muted-foreground'>
											<p>No columns added yet</p>
											<p className='text-sm'>
												Click "Add Column" to start building your schema
											</p>
										</div>
									)}
								</div>
							</ScrollArea>

							<Button type='submit' disabled={isCreating} className='w-full'>
								{isCreating ? 'Creating…' : 'Create Custom'}
							</Button>

							<div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
								<Button
									type='button'
									variant='link'
									onClick={onDefaultClick}
									disabled={isCreating}
									className='group relative z-10 bg-background px-2 text-muted-foreground hover:text-foreground hover:no-underline'
								>
									Or continue with
									<span className='-m-1 relative'>
										default
										<span className='absolute left-0 right-0 bottom-0 h-[1px] bg-current origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100' />
									</span>
									table
								</Button>
							</div>
						</div>
					</form>

					{/* Правая часть: JSON Preview */}
					<ScrollArea className='h-[600px]'>
						<div className='p-6 bg-muted/30'>
							<div className='mb-4'>
								<h3 className='text-sm font-medium mb-2'>
									Configuration Preview
								</h3>
								<Separator />
							</div>
							<pre className='text-xs font-mono text-muted-foreground whitespace-pre-wrap'>
								{JSON.stringify(
									{
										name: watch('workspaceName') || 'Workspace Name',
										columns:
											watchedColumns.length > 0
												? watchedColumns
												: 'Default schema will be used',
									},
									null,
									2,
								)}
							</pre>
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	)
}

export default CreateWorkspaceForm
