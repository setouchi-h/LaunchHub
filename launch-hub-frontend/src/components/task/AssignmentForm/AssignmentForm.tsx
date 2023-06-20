import React, { useState } from "react"
import * as s from "./style"
import { Task } from "@/types/Task"
import Button from "@/components/ui/Button"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Title from "@/components/ui/Title"
import Spacer from "@/components/ui/Spacer"
import { useProjectState } from "@/states/projectState"
import { updateTaskArray } from "@/models/firestore/updateTask"
import { useUserValue } from "@/states/userState"
import { EditingAssignmentApplication } from "@/types/assignmentApplication"
import { createAssignmentApplication } from "@/models/firestore/createAssignmentApplication"
import { Project } from "@/types/Project"
import { useSetAssignmentApplicationsState } from "@/states/assignmentApplicatinsState"
import { User } from "@/types/User"

const formInputSchema = z.object({
  message: z.string(),
})

type AssignmentApplication = z.infer<typeof formInputSchema>

type Props = {
  task: Task
}

const AssignmentForm: React.FC<Props> = ({ task }) => {
  const userWithSmartAccount = useUserValue()
  const user: User = {
    uid: userWithSmartAccount?.uid!,
    nonce: userWithSmartAccount?.nonce ?? undefined,
    name: userWithSmartAccount?.name!,
  }
  const [project, setProject] = useProjectState()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { register, handleSubmit, reset } = useForm<AssignmentApplication>({
    resolver: zodResolver(formInputSchema),
  })
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const setAssignmentApplication = useSetAssignmentApplicationsState()

  const onApplyForAssignment = () => {
    setIsEditing(true)
  }

  const onCancel = () => {
    setIsEditing(false)
    reset()
  }

  const onSubmit: SubmitHandler<AssignmentApplication> = async (data) => {
    if (!user || !project) {
      return
    }
    setIsButtonEnabled(false)
    setIsButtonLoading(true)

    //create assignment application
    const assignmentApplication: EditingAssignmentApplication = {
      projectId: project.id,
      taskId: task.id,
      userId: user.uid,
      message: data.message,
      stage: "inReview",
    }
    const { data: createdAssignmentApplication } = await createAssignmentApplication({
      assignmentApplication: assignmentApplication,
      user: user,
    })
    console.log(user)
    if (!createdAssignmentApplication) {
      return
    }

    //update task
    await updateTaskArray({
      projectId: project.id,
      taskId: task.id,
      key: "assignmentApplicationIds",
      value: createdAssignmentApplication.id,
      method: "union",
    })

    //update project state
    const newProject: Project = {
      ...project,
      tasks: project.tasks.map(($0) => {
        if ($0.id === task.id) {
          return {
            ...$0,
            assignmentApplicationIds: [
              ...$0.assignmentApplicationIds,
              createdAssignmentApplication.id,
            ],
          }
        } else {
          return $0
        }
      }),
    }
    setProject(newProject)

    //set assignmentApplicationsState
    setAssignmentApplication((curretValue) => {
      return [...curretValue, createdAssignmentApplication]
    })

    setIsEditing(false)
  }

  return (
    <>
      {!isEditing ? (
        <Button onClick={onApplyForAssignment} style="outlined">
          Apply for Assignment
        </Button>
      ) : (
        <div>
          <Title style="subtitle">Apply for Assignment</Title>
          <Spacer size={20} />

          <form>
            <div>
              <label>
                <p>Message</p>
              </label>
              <textarea
                placeholder="When and how you want to work on the task..."
                {...register("message")}
              />
            </div>
            <Spacer size={20} />

            <div css={s.buttonGroupStyle}>
              <Button
                onClick={handleSubmit(onSubmit)}
                isEnabled={isButtonEnabled}
                isLoading={isButtonLoading}
                style="contained"
              >
                Register
              </Button>
              <Spacer size={6} isVertical={false} />
              <Button onClick={onCancel} style="outlined">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default AssignmentForm
