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
import { updateTask, updateTaskArray } from "@/models/firestore/updateTask"
import { useUserValue } from "@/states/userState"
import { Project } from "@/types/Project"
import { EditingSubmission } from "@/types/submission"
import { uploadSubmissionFile } from "@/models/storage/uploadSubmissionFile"
import { createSubmission } from "@/models/firestore/createSubmission"
import { updateSubmission } from "@/models/firestore/updateSubmission"
import { useSetSubmissionsState } from "@/states/submissionsState"

const formInputSchema = z
  .object({
    file: z
      .custom<FileList>()
      .transform((data) => data[0]),
    link: z
      .string(),
    message: z
      .string()
  })

type Submission = z.infer<typeof formInputSchema>

type Props = {
  task: Task
}

const SubmissionForm: React.FC<Props> = ({ task }) => {

  const user = useUserValue()
  const [project, setProject] = useProjectState()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { register, handleSubmit, reset } = useForm<Submission>({ resolver: zodResolver(formInputSchema) })
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const setSubmissions = useSetSubmissionsState()

  const onEditSubmission = () => {
    setIsEditing(true)
  }

  const onCancel = () => {
    setIsEditing(false)
    reset()
  }

  const onSubmit: SubmitHandler<Submission> = async (data) => {
    if (!user || !project) { return }
    setIsButtonEnabled(false)
    setIsButtonLoading(true)

    //create submission
    const submission: EditingSubmission = {
      projectId: project.id,
      taskId: task.id,
      userId: user.uid,
      link: data.link,
      message: data.message,
      stage: "inReview"
    }
    const { data: createdSubmission } = await createSubmission({
      submission: submission,
      user: user
    })
    if (!createdSubmission) { return }

    if (data.file) {
      //upload file
      const { data: fileUrl } = await uploadSubmissionFile({
        submissionId: createdSubmission.id,
        file: data.file
      })
      if (!fileUrl) { return }

      //update submission
      await updateSubmission({
        submissionId: createdSubmission.id,
        submission: {
          fileUrl: fileUrl
        }
      })
    }

    //update task
    await updateTaskArray({
      projectId: project.id,
      taskId: task.id,
      key: "submissionIds",
      value: createdSubmission.id,
      method: "union"
    })
    await updateTask({
      projectId: project.id,
      taskId: task.id,
      task: {
        stage: "inReview"
      }
    })

    //update project state
    const newProject: Project = {
      ...project,
      tasks: project.tasks.map(($0) => {
        if ($0.id === task.id) {
          return {
            ...$0,
            stage: "inReview",
            submissionIds: [
              ...$0.submissionIds,
              createdSubmission.id
            ]
          }
        } else {
          return $0
        }
      })
    }
    setProject(newProject)

    //set submissionsState
    setSubmissions((currentValue) => {
      return [
        ...currentValue,
        createdSubmission
      ]
    })

    setIsEditing(false)
  }

  return (
    <>
      {!isEditing
        ? (
          <Button
            onClick={onEditSubmission}
            style="outlined"
          >
            Submit Task
          </Button>
        )
        : (
          <div>
            <Title style="subtitle">
              Submit Task
            </Title>
            <Spacer size={20} />

            <form>
              <div>
                <label>
                  <p>
                    File
                  </p>
                </label>
                <input
                  type="file"
                  {...register("file")}
                />
              </div>
              <Spacer size={20} />

              <div>
                <label>
                  <p>
                    Link
                  </p>
                </label>
                <input
                  type="text"
                  placeholder="Link..."
                  {...register("link")}
                />
              </div>
              <Spacer size={20} />

              <div>
                <label>
                  <p>
                    Message
                  </p>
                </label>
                <textarea
                  placeholder="Message about the task..."
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
                  Submit
                </Button>
                <Spacer size={6} isVertical={false} />
                <Button
                  onClick={onCancel}
                  style="outlined"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )
      }
    </>
  )
}

export default SubmissionForm