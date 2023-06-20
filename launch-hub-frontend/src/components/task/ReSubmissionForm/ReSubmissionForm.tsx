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
import { EditingSubmission, Submission } from "@/types/submission"
import { uploadSubmissionFile } from "@/models/storage/uploadSubmissionFile"
import { updateSubmission } from "@/models/firestore/updateSubmission"
import { useSetSubmissionsState } from "@/states/submissionsState"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"

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

type ReSubmission = z.infer<typeof formInputSchema>

type Props = {
  task: Task,
  submission: Submission
}

const ReSubmissionForm: React.FC<Props> = ({ task, submission }) => {

  const user = useUserValue()
  const [project, setProject] = useProjectState()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { register, handleSubmit, reset } = useForm<ReSubmission>({ resolver: zodResolver(formInputSchema) })
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

  const onSubmit: SubmitHandler<ReSubmission> = async (data) => {
    if (!user || !project) { return }
    setIsButtonEnabled(false)
    setIsButtonLoading(true)

    //update submission
    const newSubmission: EditingSubmission = {
      projectId: project.id,
      taskId: task.id,
      userId: user.uid,
      link: data.link,
      message: data.message,
      stage: "inReview"
    }
    await updateSubmission({
      submissionId: submission.id,
      submission: newSubmission
    })

    if (data.file) {
      //upload file
      const { data: fileUrl } = await uploadSubmissionFile({
        submissionId: submission.id,
        file: data.file
      })
      if (!fileUrl) { return }

      //update submission
      await updateSubmission({
        submissionId: submission.id,
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
      value: submission.id,
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
            submissionIds: [
              ...$0.submissionIds,
              submission.id
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
      return currentValue.map(($0) => {
        if ($0.id === submission.id) {
          const newCreatedSubmission: Submission = {
            ...newSubmission,
            id: submission.id,
            user: user
          }
          return newCreatedSubmission
        } else {
          return $0
        }
      })
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
            Re-submit Task
          </Button>
        )
        : (
          <div>
            <Title style="subtitle">
              Re-submit Task
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
                  defaultValue={submission.link ?? ""}
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
                  defaultValue={submission.message}
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

export default ReSubmissionForm