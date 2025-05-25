interface ApiResponse<T = any> {
	data?: T
	error?: {
		type: 'validation' | 'app_error' | 'unknown'
		message: string
		code?: string
		details?: unknown
	}
}
