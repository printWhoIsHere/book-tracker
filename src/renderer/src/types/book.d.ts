import { z } from 'zod'

const BookRecordSchema = z.object({
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

const BookIdSchema = z.number().int().positive()

const BookAddSchema = BookRecordSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial()

const BookUpdateSchema = BookRecordSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial()

const BookIdsSchema = z.object({
	ids: z.array(BookIdSchema).min(1),
})

type BookRecord = z.infer<typeof BookRecordSchema>
type BookId = z.infer<typeof BookIdSchema>
type BookIds = z.infer<typeof BookIdsSchema>
type BookAdd = z.infer<typeof BookAddSchema>
type BookUpdate = z.infer<typeof BookUpdateSchema>
