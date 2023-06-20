import { asyncTask } from "@/utils/asyncTask"
import { useEffect, useRef, DependencyList } from "react"

export const useFetchEffect = (action: () => void, deps: DependencyList, { skipFetch }: { skipFetch: boolean[] }) => {

  const hasFetched = useRef<boolean>(false)

  useEffect(() => {
    if (hasFetched.current) { return }
    if (skipFetch.some($0 => $0)) { return }

    asyncTask(async () => {
      action()
      hasFetched.current = true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps])
}