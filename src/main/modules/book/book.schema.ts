import { z } from 'zod'

export const BookRecordSchema = z.object({
	id: z.number(),
	title: z.string().nullable(),
	totalVolumes: z.number().nullable(),
	currentVolume: z.number().nullable(),
	lastName: z.string().nullable(),
	firstName: z.string().nullable(),
	middleName: z.string().nullable(),
	genre: z.string().nullable(),
	content: z.string().nullable(),
	annotation: z.string().nullable(),
	year: z.number().nullable(),
	tags: z.array(z.string()).default([]),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
})
export const BookIdSchema = z.object({
	workspaceId: z.string().uuid(),
	id: z.number().int().positive(),
})
export const BookAddSchema = BookRecordSchema.omit({ id: true }).partial()
export const BookUpdateSchema = BookRecordSchema.partial()

export type BookRecord = z.infer<typeof BookRecordSchema>
export type BookId = z.infer<typeof BookIdSchema>
export type BookAdd = z.infer<typeof BookAddSchema>
export type BookUpdate = z.infer<typeof BookUpdateSchema>

//

export interface DeleteManyResult {
	id: number
	success: boolean
	error?: string
}
