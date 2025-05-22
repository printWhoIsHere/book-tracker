import React, { createContext, useContext, useState } from 'react'

interface TableContextType {
	selectedRows: number[]
	setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export const TableProvider = ({ children }: { children: React.ReactNode }) => {
	const [selectedRows, setSelectedRows] = useState<number[]>([])

	return (
		<TableContext.Provider
			value={{
				selectedRows,
				setSelectedRows,
			}}
		>
			{children}
		</TableContext.Provider>
	)
}

export const useTableContext = (): TableContextType => {
	const context = useContext(TableContext)
	if (!context) {
		throw new Error('useTableContext must be used within a TableProvider')
	}
	return context
}
