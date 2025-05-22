import {
	useMutation,
	useQueryClient,
	MutationFunction,
} from '@tanstack/react-query'
import { VariantProps } from 'class-variance-authority'
import { toast, useToast } from '@renderer/hooks/useToast'

interface Options<TData> {
	queryKey: string[]
	successMessage: string
	errorMessage: string
	toastVariant?: VariantProps<typeof toast>['variant']
	onSuccess?: (data: TData) => void
	onError?: (error: unknown) => void
	onSettled?: () => void
}

/**
 * Универсальный хук для мутаций с автоматической инвалидизацией кэша и показом тостов.
 *
 * @template TVariables  Тип аргументов мутации
 * @template TData       Тип данных, возвращаемых мутацией
 *
 * @param mutationFn     Функция, выполняющая мутацию (возвращает TData)
 * @param options        Опции:
 *    - queryKey       Ключ(и) запроса для инвалидирования после успеха
 *    - successMessage Сообщение для тоста при успешной мутации
 *    - errorMessage   Сообщение для тоста при ошибке
 *    - toastVariant   Вариант тоста (success / destructive и т.д.)
 *    - onSuccess      Дополнительный колбэк после успешной мутации
 *    - onError        Дополнительный колбэк при ошибке
 *    - onSettled      Колбэк, вызываемый в любом случае по завершении
 *
 * @returns Результат работы `useMutation` @tanstack/react-query
 */
export function useTypedMutation<TVariables, TData = unknown>(
	mutationFn: MutationFunction<TData, TVariables>,
	options: Options<TData>,
) {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	return useMutation<TData, unknown, TVariables>({
		mutationFn,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: options.queryKey })
			toast({
				description: options.successMessage,
				variant: options.toastVariant || 'success',
			})
			options.onSuccess?.(data)
		},
		onError: (error) => {
			toast({
				description: options.errorMessage,
				variant: options.toastVariant || 'destructive',
			})
			options.onError?.(error)
		},
		onSettled: () => options.onSettled?.(),
	})
}
