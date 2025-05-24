import { z } from 'zod'

export interface BookRecord {
	id?: number
	title: string
	totalVolumes: number
	currentVolume: number
	lastName: string
	firstName: string
	middleName: string
	genre: string
	content: string
	annotation: string
	year: number
	tags: string
}

const BookRecordSchema = z.object({
	title: z.string().min(1).max(500),
	totalVolumes: z.number().int().min(1).default(1),
	currentVolume: z.number().int().min(1).default(1),
	lastName: z.string().min(1).max(100),
	firstName: z.string().min(1).max(100),
	middleName: z.string().max(100).optional(),
	genre: z.string().min(1).max(100),
	content: z.string().min(1).max(1000),
	annotation: z.string().max(2000).optional(),
	year: z.number().int().min(1).max(new Date().getFullYear()).optional(),
	tags: z.string().optional(),
})

const UpdateBookSchema = BookRecordSchema.partial()

const WorkspaceIdSchema = z.object({
	workspaceId: z.string().uuid(),
})

const BookIdSchema = z.object({
	workspaceId: z.string().uuid(),
	id: z.number().int().positive(),
})

const SearchFiltersSchema = z.object({
	title: z.string().optional(),
	author: z.string().optional(),
	genre: z.string().optional(),
	year: z.number().int().optional(),
	tags: z.array(z.string()).optional(),
	hasAnnotation: z.boolean().optional(),
})

const PaginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
	sortBy: z.enum(['title', 'author', 'year', 'createdAt']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
})

const SearchBooksSchema = z.object({
	workspaceId: z.string().uuid(),
	filters: SearchFiltersSchema.default({}),
	pagination: PaginationSchema.default({}),
})

const AuthorSchema = z.object({
	workspaceId: z.string().uuid(),
	lastName: z.string().min(1),
	firstName: z.string().optional(),
})
