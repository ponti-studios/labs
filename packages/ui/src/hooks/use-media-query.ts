"use client"

import * as React from "react"

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    // Fallback for browsers that don't support addEventListener on MediaQueryList
    if (result.media !== "not all") {
      try {
        result.addEventListener("change", onChange)
      } catch {
        result.addListener(onChange)
      }
    }

    setValue(result.matches)

    return () => {
      try {
        result.removeEventListener("change", onChange)
      } catch {
        result.removeListener(onChange)
      }
    }
  }, [query])

  return value
}

export function useIsMobile(threshold = 768): boolean {
  return useMediaQuery(`(max-width: ${threshold - 1}px)`)
}
