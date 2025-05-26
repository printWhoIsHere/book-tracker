import { useCallback, useLayoutEffect, useState } from 'react'

export function useVisibleTags(
	tags: string[],
	containerRef: React.RefObject<HTMLDivElement>,
	rowHeight: 'compact' | 'default' | 'comfortable',
) {
	const [visible, setVisible] = useState<string[]>([])
	const [hidden, setHidden] = useState<string[]>([])

	const measure = useCallback(() => {
		const el = containerRef.current
		if (!el || tags.length === 0) {
			setVisible([])
			setHidden([])
			return
		}

		const containerWidth = el.clientWidth
		const maxRows = rowHeight === 'comfortable' ? 2 : 1
		const gap = 4
		const moreWidth = 32

		// Canvas для измерения ширины текста
		const ctx = document.createElement('canvas').getContext('2d')!
		const bodyStyle = getComputedStyle(document.body)
		ctx.font = `${bodyStyle.fontSize} ${bodyStyle.fontFamily}`

		let currentRow = 1
		let usedWidth = 0
		const vis: string[] = []
		const rem = [...tags]

		while (rem.length && currentRow <= maxRows) {
			const tag = rem[0]
			const textW = ctx.measureText(tag).width
			const badgePad = 16 + gap // 8px padding sides + gap
			const totalW =
				usedWidth + textW + badgePad + (rem.length > 1 ? moreWidth : 0)

			if (totalW <= containerWidth) {
				vis.push(tag)
				usedWidth += textW + badgePad
				rem.shift()
			} else if (currentRow < maxRows) {
				currentRow++
				usedWidth = 0
			} else {
				break
			}
		}

		setVisible(vis)
		setHidden(rem)
	}, [tags, containerRef, rowHeight])

	// При монтировании и изменении tags
	useLayoutEffect(() => {
		measure()
	}, [tags, measure])

	// ResizeObserver для любых изменений размера контейнера
	useLayoutEffect(() => {
		const el = containerRef.current
		if (!el) return
		const ro = new ResizeObserver(() => {
			measure()
		})
		ro.observe(el)
		return () => void ro.disconnect()
	}, [containerRef, measure])

	return { visible, hidden }
}

const DEFAULT_TAG_COLOR = '#d3cfc7'
/**
 * Возвращает цвет для каждого тега на основе настроек.
 * @param tagLabel Название тега
 * @param settings Объект настроек пользователя
 */
export function getTagColor(
	tagLabel: string,
	settings: WorkspaceSettings['tags'],
): string {
	const found = settings.find((tag) => tag.label === tagLabel)
	return found?.color ?? DEFAULT_TAG_COLOR
}
