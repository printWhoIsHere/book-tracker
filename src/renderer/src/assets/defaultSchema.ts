// src/assets/defaultWorkspaceSchema.ts

export const defaultGenres = [
	'Фантастика',
	'Фэнтези',
	'Детектив',
	'Роман',
	'Триллер',
	'Драма',
	'Комедия',
	'Биография',
	'История',
	'Поэзия',
	'Философия',
	'Научная литература',
]

export const defaultTags = [
	{ label: 'Избранное', color: '#FFD700' },
	{ label: 'В наличии', color: '#50C878' },
	{ label: 'Планируется', color: '#6495ED' },
	{ label: 'Прочитано', color: '#49c143' },
	{ label: 'Отложено', color: '#FFA500' },
	{ label: 'Нет в наличии', color: '#ff3600' },
	{ label: 'Повреждено', color: '#8B0000' },
]

export const defaultWorkspaceSchema = [
	{
		key: 'title',
		label: 'Название',
		type: 'InputText',
		required: false,
	},
	{
		key: 'totalVolumes',
		label: 'Т',
		type: 'InputNumber',
		required: false,
	},
	{
		key: 'currentVolume',
		label: '№',
		type: 'InputNumber',
		required: false,
	},
	{
		key: 'author',
		label: 'Автор',
		type: 'InputText',
		required: false,
		subFields: [
			{
				key: 'firstName',
				label: 'Имя',
				type: 'InputText',
				required: false,
			},
			{
				key: 'middleName',
				label: 'Отчество',
				type: 'InputText',
				required: false,
			},
			{
				key: 'lastName',
				label: 'Фамилия',
				type: 'InputText',
				required: false,
			},
		],
	},
	{
		key: 'content',
		label: 'Содержание',
		type: 'InputTextarea',
		required: false,
	},
	{
		key: 'annotation',
		label: 'Аннотация',
		type: 'InputTextarea',
		required: false,
	},
	{
		key: 'genre',
		label: 'Жанр',
		type: 'Select',
		required: false,
		options: defaultGenres,
	},
	{
		key: 'year',
		label: 'Год издания',
		type: 'InputNumber',
		required: false,
	},
	{
		key: 'tags',
		label: 'Теги',
		type: 'MultiSelect',
		required: false,
		options: defaultTags,
	},
] as const
