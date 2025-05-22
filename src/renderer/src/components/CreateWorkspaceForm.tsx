import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'

import { cn } from '@renderer/lib/utils'
import { Textarea } from '@renderer/components/ui/textarea'
import { ScrollArea } from '@renderer/components/ui/scroll-area'

import { useWorkspace } from '@renderer/hooks/useWorkspace'

const workspaceFormSchema = z.object({
	workspaceName: z.string().min(1, { message: 'Введите название' }),
	// Пока схемы таблицы нет — пустой объект
	tableSchema: z.string().optional(),
})
type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>

function CreateWorkspaceForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const { workspaces, create: createWorkspace, isCreating } = useWorkspace()
	const [jsonPreview, setJsonPreview] = useState('{}')

	const form = useForm<WorkspaceFormValues>({
		resolver: zodResolver(workspaceFormSchema),
		defaultValues: {
			workspaceName: '',
			tableSchema: '',
		},
	})

	const onSubmit = async (values: WorkspaceFormValues) => {
		let schema: UIColumn[] | undefined

		if (values.tableSchema) {
			try {
				schema = JSON.parse(values.tableSchema) as UIColumn[]
			} catch {
				console.error('JSON parse error')
				return
			}
		}

		try {
			const newId = await createWorkspace({
				name: values.workspaceName,
				schema,
			})
			console.log('Created workspace with ID:', newId)
			form.reset()
			setJsonPreview('')
		} catch (error) {
			console.error('Create workspace error', error)
		}
	}

	const onDefaultClick = async () => {
		try {
			const newId = await createWorkspace({
				name: form.getValues('workspaceName') || 'New Workspace',
			})
			console.log('Created with default schema:', newId)
			form.reset()
			setJsonPreview('')
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6 h-[500px]', className)} {...props}>
			<Card className='overflow-hidden shadow-sm dark:border-muted dark:shadow-none'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					{/* Левая часть: Форма */}
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
						<div className='flex flex-col gap-6'>
							<div className='flex flex-col items-center text-center'>
								<h1 className='text-2xl font-bold'>Create Workspace</h1>
								<p className='text-balance text-muted-foreground'>
									Create custom table of choose default
								</p>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='password'>Name</Label>
								<Input
									id='workspaceName'
									type='text'
									placeholder='My Workspace'
								/>
							</div>

							{/* Заготовка под построение таблицы */}
							<div className='flex flex-col gap-1'>
								<Label htmlFor='tableSchema'>Схема таблицы (JSON)</Label>
								<Textarea
									id='tableSchema'
									rows={6}
									onBlur={(event) => {
										setJsonPreview(event.target.value)
									}}
									className='w-full rounded border px-2 py-1 font-mono text-sm'
								/>
							</div>

							<Button type='submit' disabled={isCreating} className='w-full'>
								{isCreating ? 'Creating…' : 'Create'}
							</Button>
							<div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
								<Button
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

					{/* Правая часть: JSON */}
					<ScrollArea className='h-[500px]'>
						<pre className='flex-1 overflow-auto rounded bg-muted p-4 font-mono text-sm'>
							<span className='text-xs text-muted-foreground'>
								// JSON Configuration {`\n`}
							</span>
							{jsonPreview}
						</pre>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	)
}

export default CreateWorkspaceForm
