import { useEffect, useState } from 'react'

/* ──────────────────────────────────────────────────────────────────────────
   useRefreshOnFocus — returns a number that bumps every time the browser tab
   becomes visible or the window regains focus. Put it in any data-loading
   useEffect's dependency array and the fetch re-runs automatically when the
   parent comes back to the tab — so pegawai-side updates appear without a
   manual reload.

   Usage:
     const refresh = useRefreshOnFocus()
     useEffect(() => { API.get(...).then(setData) }, [refresh, otherDeps])
   ────────────────────────────────────────────────────────────────────────── */
export default function useRefreshOnFocus() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const bump = () => setTick((n) => n + 1)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') bump()
    }
    window.addEventListener('focus', bump)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', bump)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return tick
}
