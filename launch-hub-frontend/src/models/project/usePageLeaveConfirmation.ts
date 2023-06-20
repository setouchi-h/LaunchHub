import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export const usePageLeaveConfirmation = (isPageLeaveAllowed: boolean = false) => {

  const router = useRouter()
  const [isBrowserBack, setIsBrowserBack] = useState(false)

  useEffect(() => {
    const message = " Are you sure to leave this page? The content you are editing will be discarded."

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    const pageChangeHandler = () => {
      if (!isBrowserBack && !window.confirm(message)) {
        throw 'changeRoute aborted'
      }
    }

    const setBeforePopState = () => {
      router.beforePopState(() => {
        if (!confirm(message)) {
          window.history.pushState(null, "", router.asPath)
          return false
        }
        setIsBrowserBack(true)
        return true
      })
    }

    if (!isPageLeaveAllowed) {
      window.addEventListener('beforeunload', beforeUnloadHandler)
      router.events.on('routeChangeStart', pageChangeHandler)
      setBeforePopState()

      return () => {
        window.removeEventListener('beforeunload', beforeUnloadHandler)
        router.events.off('routeChangeStart', pageChangeHandler)
        router.beforePopState(() => true)
      }
    }
  }, [isBrowserBack, router, isPageLeaveAllowed])
}