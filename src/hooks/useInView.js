import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook that detects when an element enters the viewport.
 * Returns [ref, isInView] — attach ref to the element you want to observe.
 * Once visible, stays visible (no re-triggering).
 */
export function useInView(options = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element) // once visible, stay visible
        }
      },
      {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || '0px',
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, isInView]
}
