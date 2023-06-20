import { useEffect, useState } from "react"
import { useUserValue } from "@/states/userState"
import { Project } from "@/types/Project"

export const useIsProjectOwner = (project: Project | null | undefined) => {

  const user = useUserValue()
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false)

  useEffect(() => {
    if (!user || !project) { return }
    if (project.ownerIds.includes(user.uid)) {
      setIsProjectOwner(true)

    } else {
      setIsProjectOwner(false)
    }
  }, [user, project])

  return isProjectOwner
}
