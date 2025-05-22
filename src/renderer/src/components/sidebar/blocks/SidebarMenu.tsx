import React, { useMemo } from 'react'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenuList,
	SidebarMenuItem,
} from '@renderer/components/sidebar/menu-items'
import { ConfirmModal } from '@renderer/components/modals'
import { useModal } from '@renderer/hooks/useModal'
import { useTableContext } from '@renderer/providers/table-provider'
import { useBook } from '@renderer/hooks/useBook'
import type { NavGroup, NavItem } from '@renderer/navigation'

interface NavItemsProps {
	label: NavGroup['group']
	items: NavItem[]
}

export function NavItems({ label, items }: NavItemsProps) {
	const { openModal } = useModal()
	const { selectedRows } = useTableContext()
	const { deleteBooks } = useBook()

	const visible = useMemo(
		() =>
			items.filter(
				(i) =>
					!(
						i.kind === 'action' &&
						i.actionKey === 'deleteSelected' &&
						!selectedRows.length
					),
			),
		[items, selectedRows],
	)

	const handleClick = (item: NavItem) => {
		if (item.kind === 'modal') {
			openModal(item.modal, { ...item })
		} else if (item.kind === 'action') {
			if (item.actionKey === 'deleteSelected') {
				openModal(ConfirmModal, {
					title: 'Подтвердите',
					props: {
						message: 'Удалить выбранные книги?',
						onConfirm: () => deleteBooks(selectedRows),
					},
				})
			}
			// другие action...
		}
	}

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{label}</SidebarGroupLabel>
			<SidebarMenuList>
				{visible.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarButton
							onClick={() => handleClick(item)}
							tooltip={item.title}
						>
							<item.icon />
							<span className='group-data-[state=collapsed]:hidden'>
								{item.title}
							</span>
						</SidebarButton>
					</SidebarMenuItem>
				))}
			</SidebarMenuList>
		</SidebarGroup>
	)
}
