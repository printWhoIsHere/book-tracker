import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

function useMobile() {
	const [isMobile, setIsMobile] = useState<boolean>(() =>
		typeof window !== 'undefined'
			? window.innerWidth < MOBILE_BREAKPOINT
			: false,
	)

	useEffect(() => {
		const mediaQuery = window.matchMedia(
			`(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
		)
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
		}
		mediaQuery.addEventListener('change', onChange)
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

		return () => mediaQuery.removeEventListener('change', onChange)
	}, [])

	return isMobile
}

export { useMobile }
