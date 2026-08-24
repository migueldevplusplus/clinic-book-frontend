import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../api/client'

/**
 * Runs a fetcher and exposes { data, loading, error, reload }.
 * Every screen needs the same three states, so they live here once.
 *
 * `deps` drives the refetch, the same way useEffect deps do.
 */
export function useAsync(fetcher, deps = [], { skip = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)

  // Guards against a slow response overwriting a newer one.
  const requestId = useRef(0)

  const run = useCallback(async () => {
    if (skip) {
      setLoading(false)
      return
    }
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (id === requestId.current) setData(result)
    } catch (err) {
      if (id === requestId.current) setError(errorMessage(err))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps])

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, reload: run, setData }
}
