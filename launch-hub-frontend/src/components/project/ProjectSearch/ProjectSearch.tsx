import * as s from "./style"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getProjectsWhere } from "@/models/firestore/getProjectsWhere"
import { KEYS } from "@/models/firestore/keys"
import { z } from "zod"
import { updateProjectArray } from "@/models/firestore/updateProject"
import { PATHS } from "@/components/pages/paths"
import { useRouter } from "next/router"
import Button from "@/components/ui/Button"
import Title from "@/components/ui/Title"
import Spacer from "@/components/ui/Spacer"
import { useUserValue } from "@/states/userState"
import { useSetAttendingProjectState } from "@/states/attendingProjects"

const formInputSchema = z.object({
  enteredText: z.string().nonempty(),
})

type SearchProject = z.infer<typeof formInputSchema>

const ProjectSearch: React.FC = () => {
  const user = useUserValue()
  const router = useRouter()
  const { register, handleSubmit } = useForm<SearchProject>({
    resolver: zodResolver(formInputSchema),
  })
  const setAttendingProjects = useSetAttendingProjectState()

  const onClickSearch: SubmitHandler<SearchProject> = async (data) => {
    //get projects where invitatoin code matches
    const { data: projects } = await getProjectsWhere({
      key: KEYS.PROJECT.INVITATION_CODE,
      operation: "==",
      value: data.enteredText,
    })
    if (!projects || !projects.length) {
      return
    }
    const project = projects[0]

    //add user.uid to member ids
    console.log(user?.uid)
    if (!user?.uid) {
      return
    }
    await updateProjectArray({
      projectId: project.id,
      key: "memberIds",
      value: user?.uid,
      method: "union",
    })

    setAttendingProjects((currentValue) => {
      return [
        ...currentValue,
        project
      ]
    })

    //go to project page
    router.push(PATHS.PROJECT(project.id))
  }

  const onEnterDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return
    }
    handleSubmit(onClickSearch)
  }

  return (
    <div css={s.projectSearchContainerStyle}>
      <form>
        <Title>Search Projects</Title>

        <Spacer size={30} />
        <p>
          Enter invitation code to join projects.
        </p>

        <div css={s.searchBarContainerStyle}>
          <label css={s.inputContainerStyle}>
            <input
              type="text"
              placeholder="Invitation code..."
              onKeyDown={onEnterDown}
              {...register("enteredText")}
              css={s.inputStyle}
            />
          </label>
          <Spacer size={12} isVertical={false} />
          <Button onClick={handleSubmit(onClickSearch)}>
            Search
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProjectSearch
