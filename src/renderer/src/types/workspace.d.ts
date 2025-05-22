type UIColumnType =
	| 'InputText'
	| 'InputTextarea'
	| 'InputNumber'
	| 'Select'
	| 'MultiSelect'
	| 'Date'

type UIColumn = {
	key: string
	label: string
	type: UIColumnType
	required: boolean
}
