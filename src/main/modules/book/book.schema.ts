import { z } from 'zod'

const BookRecordSchema = z.object({
	id: z.number(),
	title: z.string().nullable().optional(),
	totalVolumes: z.number().nullable().optional(),
	currentVolume: z.number().nullable().optional(),
	lastName: z.string().nullable().optional(),
	firstName: z.string().nullable().optional(),
	middleName: z.string().nullable().optional(),
	genre: z.string().nullable().optional(),
	content: z.string().nullable().optional(),
	annotation: z.string().nullable().optional(),
	year: z.number().nullable().optional(),
	tags: z.array(z.string()).optional().default([]),
})
export type BookRecord = z.infer<typeof BookRecordSchema>

const BookAddSchema = BookRecordSchema.omit({ id: true }).partial()
export type BookAdd = z.infer<typeof BookAddSchema>

const BookUpdateSchema = BookRecordSchema.partial()
export type BookUpdate = z.infer<typeof BookUpdateSchema>
