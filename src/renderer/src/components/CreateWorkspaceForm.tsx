import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Construction } from 'lucide-react'

import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'

import { Alert, AlertDescription } from '@renderer/components/ui/alert'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Separator } from '@renderer/components/ui/separator'

import { cn } from '@renderer/lib/utils'
import { useWorkspace } from '@renderer/hooks/useWorkspace'
import { defaultWorkspaceSchema } from '@renderer/assets/defaultSchema'

const workspaceFormSchema = z.object({
	workspaceName: z.string().min(1, { message: 'Введите название workspace' }),
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
		},
	})

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = form

	const workspaceName = watch('workspaceName')

	const onSubmit = async (values: WorkspaceFormValues) => {
		try {
			const newId = await createWorkspace({
				name: values.workspaceName,
			})
			reset()
		} catch (error) {
			console.error('Create workspace error', error)
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className='overflow-hidden shadow-sm dark:border-muted dark:shadow-none'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					<div className='p-6 md:p-8'>
						<div className='flex flex-col gap-6'>
							<div className='flex flex-col items-center text-center space-y-2'>
								<h1 className='text-3xl font-bold tracking-tight'>
									Create Workspace
								</h1>
								<p className='text-muted-foreground max-w-md'>
									Create a new workspace with default book management schema.
									Perfect for organizing your library collection.
								</p>
							</div>

							<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
								<div className='space-y-2'>
									<Label
										htmlFor='workspaceName'
										className='text-sm font-medium'
									>
										Workspace Name
									</Label>
									<Input
										id='workspaceName'
										type='text'
										placeholder='My Book Collection'
										{...register('workspaceName')}
										className='w-full'
									/>
									{errors.workspaceName && (
										<p className='text-sm text-destructive'>
											{errors.workspaceName.message}
										</p>
									)}
								</div>

								<Button
									type='submit'
									disabled={isCreating || !workspaceName.trim()}
									className='w-full'
									size='lg'
								>
									{isCreating ? 'Creating Workspace...' : 'Create Workspace'}
								</Button>
							</form>

							<div className='pt-4 border-t border-muted h-full'>
								<Alert>
									<Construction className='h-4 w-4' />
									<AlertDescription>
										<strong>Coming Soon:</strong> Custom column configuration
										will be available in future updates. You'll be able to
										create fully customized workspace schemas.
									</AlertDescription>
								</Alert>
							</div>
						</div>
					</div>

					<div className='bg-muted/30'>
						<ScrollArea className='h-[600px]'>
							<div className='p-6 space-y-4'>
								<div>
									<h3 className='text-sm font-semibold mb-2'>
										Default Schema Preview
									</h3>
									<Separator className='mb-4' />
								</div>

								<div className='space-y-2'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>
											Workspace Name:
										</span>
										<span className='font-medium'>
											{workspaceName || 'Not specified'}
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Schema:</span>
										<span className='font-medium'>Default Book Schema</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Columns:</span>
										<span className='font-medium'>
											{defaultWorkspaceSchema.length}
										</span>
									</div>
								</div>

								<Separator />

								<div>
									<h4 className='text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide'>
										Schema Structure
									</h4>
									<pre className='text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-background/50 rounded-md p-3 border'>
										{JSON.stringify(defaultWorkspaceSchema, null, 2)}
									</pre>
								</div>
							</div>
						</ScrollArea>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default CreateWorkspaceForm
