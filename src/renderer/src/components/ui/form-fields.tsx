import { Control, FieldPath, FieldValues } from 'react-hook-form'

import { FormControl, FormField, FormItem } from '@renderer/components/ui/form'
import { Textarea } from '@renderer/components/ui/textarea'
import { Input } from '@renderer/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@renderer/components/ui/select'
import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger,
} from '@renderer/components/ui/multi-select'

interface FormInputProps<T extends FieldValues> {
	control: Control<T>
	name: FieldPath<T>
	placeholder?: string
	id?: string
}

function FormTextInput<T extends FieldValues>({
	control,
	name,
	placeholder,
	id,
}: FormInputProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Input id={id || name} placeholder={placeholder} {...field} />
					</FormControl>
				</FormItem>
			)}
		/>
	)
}

function FormNumberInput<T extends FieldValues>({
	control,
	name,
	placeholder,
	min,
	max,
	id,
}: FormInputProps<T> & { min?: string; max?: string }) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Input
							id={id || name}
							type='number'
							min={min}
							max={max}
							placeholder={placeholder}
							onWheel={(e) => e.currentTarget.blur()}
							{...field}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	)
}

function FormTextarea<T extends FieldValues>({
	control,
	name,
	placeholder,
	id,
}: FormInputProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Textarea id={id || name} placeholder={placeholder} {...field} />
					</FormControl>
				</FormItem>
			)}
		/>
	)
}

function FormYearInput<T extends FieldValues>({
	control,
	name,
	id,
}: FormInputProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Input
							id={id || name}
							type='number'
							min={1800}
							placeholder={new Date().getFullYear().toString()}
							inputMode='numeric'
							onWheel={(e) => e.currentTarget.blur()}
							{...field}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	)
}

function FormSelect<T extends FieldValues>({
	control,
	name,
	placeholder,
	id,
	options,
}: FormInputProps<T> & { options: string[] }) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Select onValueChange={field.onChange} value={field.value}>
							<SelectTrigger id={id || name}>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>

							<SelectContent>
								{options.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormControl>
				</FormItem>
			)}
		/>
	)
}

function FormMultiSelect<T extends FieldValues>({
	control,
	name,
	placeholder,
	id,
	options,
}: FormInputProps<T> & { options: string[] }) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<MultiSelector
							values={field.value || []}
							onValuesChange={field.onChange}
							loop
						>
							<MultiSelectorTrigger id={id || name}>
								<MultiSelectorInput placeholder={placeholder} />
							</MultiSelectorTrigger>
							<MultiSelectorContent>
								<MultiSelectorList>
									{options.map((option) => (
										<MultiSelectorItem key={option} value={option}>
											{option}
										</MultiSelectorItem>
									))}
								</MultiSelectorList>
							</MultiSelectorContent>
						</MultiSelector>
					</FormControl>
				</FormItem>
			)}
		/>
	)
}

export {
	FormTextInput,
	FormNumberInput,
	FormTextarea,
	FormYearInput,
	FormSelect,
	FormMultiSelect,
}
