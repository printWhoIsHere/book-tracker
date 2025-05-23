export class AppError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 500,
		public details?: unknown,
	) {
		super(message)
		this.name = 'AppError'
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 'VALIDATION_ERROR', 400, details)
		this.name = 'ValidationError'
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, id?: string) {
		const message = id
			? `${resource} with id ${id} not found`
			: `${resource} not found`
		super(message, 'NOT_FOUND', 404)
		this.name = 'NotFoundError'
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 'CONFLICT', 409)
		this.name = 'ConflictError'
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 'DATABASE_ERROR', 500, details)
		this.name = 'DatabaseError'
	}
}
