const BookSchema = z.object({
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
type Book = z.infer<typeof BookSchema>
