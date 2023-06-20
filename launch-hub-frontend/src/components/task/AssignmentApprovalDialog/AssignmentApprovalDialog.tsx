import React, { useState } from "react"
import * as s from "./style"
import * as Dialog from "@radix-ui/react-dialog"
import { useSetProjectState } from "@/states/projectState"
import { AssignmentApplication } from "@/types/assignmentApplication"
import { Task } from "@/types/Task"
import Button from "@/components/ui/Button"
import Spacer from "@/components/ui/Spacer"
import { updateTask, updateTaskArray } from "@/models/firestore/updateTask"
import { updateAssignmentApplication } from "@/models/firestore/updateAssignmentApplication"
import { Submission } from "@/types/submission"
import { useSetAssignmentApplicationsState } from "@/states/assignmentApplicatinsState"
import { useSetSubmissionsState } from "@/states/submissionsState"
import Title from "@/components/ui/Title"
import Link from "next/link"
import { extractFileNameFromUrl } from "@/utils/extractFileNameFromUrl"
import { useFetchEffect } from "@/models/project/useFetchEffect"
import { downloadFileFromUrl } from "@/models/storage/downloadFile"
import { updateSubmission } from "@/models/firestore/updateSubmission"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ethers } from "ethers"
import securitiesAbi from "../../../../constants/Securities.json"
import { useUserValue } from "@/states/userState"
import { useRouter } from "next/router"
import { useGetProject } from "@/models/project/useGetProject"

const formInputSchema = z.object({
  commentFromPrjectOwner: z.string(),
})

type AssignmentApproval = z.infer<typeof formInputSchema>

type Props = {
  type: "assignmentApplication" | "submission"
  assignment: AssignmentApplication | Submission
  tasks: Task[]
  isEditable?: boolean
}

const AssignmentApprovalDialog: React.FC<Props> = ({
  type,
  assignment,
  tasks,
  isEditable = true,
}: Props) => {
  const router = useRouter()
  const { projectId } = router.query
  const { project } = useGetProject(projectId)
  const sbtAddr = project?.sbtAddress
  const user = useUserValue()
  const task = tasks.find(($0) => $0.id === assignment.taskId)
  const setProject = useSetProjectState()
  const setAssignmentApplications = useSetAssignmentApplicationsState()
  const setSubmissions = useSetSubmissionsState()
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [fileDownloadUrl, setFileDownloadUrl] = useState<string>("")
  const { register, handleSubmit } = useForm<AssignmentApproval>({
    resolver: zodResolver(formInputSchema),
  })

  useFetchEffect(
    async () => {
      if (type !== "submission") {
        return
      }
      const submission = assignment as Submission
      const { data: url } = await downloadFileFromUrl(submission.fileUrl ?? "")
      if (!url) {
        return
      }
      setFileDownloadUrl(url)
    },
    [],
    {
      skipFetch: [],
    }
  )

  const onApprove: SubmitHandler<AssignmentApproval> = async (data) => {
    if (!task) {
      return
    }
    setIsButtonEnabled(false)
    setIsButtonLoading(true)

    if (type === "assignmentApplication") {
      //update assignment application
      await updateTask({
        projectId: assignment.projectId,
        taskId: task.id,
        task: {
          stage: "inProgress",
          asigneeIds: [...task.asigneeIds, assignment.userId],
        },
      })
      await updateAssignmentApplication({
        assignmentApplicationId: assignment.id,
        assignmentApplication: {
          stage: "accepted",
          commentsFromProjectOwner: data.commentFromPrjectOwner,
        },
      })

      //set project state
      setProject((currentValue) => {
        if (!currentValue) {
          return currentValue
        }
        const newTasks: Task[] = currentValue.tasks.map(($0) => {
          if ($0.id === task.id) {
            return { ...$0, stage: "inProgress" }
          } else {
            return $0
          }
        })
        return {
          ...currentValue,
          tasks: newTasks,
        }
      })
      //ここはSWRのmutatorで書き換える
      setAssignmentApplications((currentValue) => {
        const newAssignmentApplications: AssignmentApplication[] = currentValue.map(($0) => {
          if ($0.id === task.id) {
            return {
              ...$0,
              stage: "accepted",
              commentsFromProjectOwner: data.commentFromPrjectOwner,
            }
          } else {
            return $0
          }
        })
        return newAssignmentApplications
      })
    } else {
      //update submission
      await updateTask({
        projectId: assignment.projectId,
        taskId: task.id,
        task: { stage: "done" },
      })
      await updateSubmission({
        submissionId: assignment.id,
        submission: {
          stage: "accepted",
          commentsFromProjectOwner: data.commentFromPrjectOwner,
        },
      })

      await mintSbt(assignment.userId, task.bountySbt)

      //set project state
      setProject((currentValue) => {
        if (!currentValue) {
          return currentValue
        }
        const newTasks: Task[] = currentValue.tasks.map(($0) => {
          if ($0.id === task.id) {
            return { ...$0, stage: "done" }
          } else {
            return $0
          }
        })
        return {
          ...currentValue,
          tasks: newTasks,
        }
      })
      //ここはSWRのmutatorで書き換える
      setSubmissions((currentValue) => {
        const newSubmissions: Submission[] = currentValue.map(($0) => {
          if ($0.id === task.id) {
            return {
              ...$0,
              stage: "accepted",
              commentsFromProjectOwner: data.commentFromPrjectOwner,
            }
          } else {
            return $0
          }
        })
        return newSubmissions
      })
    }

    setIsDialogOpen(false)
    setIsButtonEnabled(true)
    setIsButtonLoading(false)
  }

  const mintSbt = async (to: string, sbtAmount: number) => {
    if (!user?.smartAccount) {
      console.log("smartAccount is not found")
      return
    }
    try {
      const sbtInterface = new ethers.utils.Interface(securitiesAbi)
      const encodedMintData = sbtInterface.encodeFunctionData("mint", [sbtAmount, to])
      const tx = {
        to: sbtAddr!,
        data: encodedMintData,
      }
      const txResponse = await user?.smartAccount.sendTransaction({
        transaction: tx,
      })
      console.log("userOp hash: ", txResponse.hash)
      const txReciept = await txResponse.wait()
      console.log("tx: ", txReciept)
    } catch (error) {
      console.log(error)
    }
  }

  const onReject: SubmitHandler<AssignmentApproval> = async (data) => {
    if (!task) {
      return
    }
    setIsButtonEnabled(false)
    setIsButtonLoading(true)

    if (type === "assignmentApplication") {
      //update assignment application
      await updateTask({
        projectId: assignment.projectId,
        taskId: task.id,
        task: { stage: "todo" },
      })
      await updateAssignmentApplication({
        assignmentApplicationId: assignment.id,
        assignmentApplication: {
          stage: "rejected",
          commentsFromProjectOwner: data.commentFromPrjectOwner,
        },
      })
      await updateTaskArray({
        projectId: assignment.projectId,
        taskId: task.id,
        key: "assignmentApplicationIds",
        value: assignment.id,
        method: "remove",
      })

      //set project state
      setProject((currentValue) => {
        if (!currentValue) {
          return currentValue
        }
        const newTasks: Task[] = currentValue.tasks.map(($0) => {
          if ($0.id === task.id) {
            return { ...$0, stage: "todo" }
          } else {
            return $0
          }
        })
        return {
          ...currentValue,
          tasks: newTasks,
        }
      })
      //ここはSWRのmutatorで書き換える
      setAssignmentApplications((currentValue) => {
        const newAssignmentApplications: AssignmentApplication[] = currentValue.map(($0) => {
          if ($0.id === task.id) {
            return {
              ...$0,
              stage: "rejected",
              commentsFromProjectOwner: data.commentFromPrjectOwner,
            }
          } else {
            return $0
          }
        })
        return newAssignmentApplications
      })
    } else {
      //update submission
      await updateSubmission({
        submissionId: assignment.id,
        submission: {
          stage: "rejected",
          commentsFromProjectOwner: data.commentFromPrjectOwner,
        },
      })

      //set project state
      //ここはSWRのmutatorで書き換える
      setSubmissions((currentValue) => {
        const newSubmissions: Submission[] = currentValue.map(($0) => {
          if ($0.id === task.id) {
            return { ...$0, stage: "rejected" }
          } else {
            return $0
          }
        })
        return newSubmissions
      })
    }

    setIsDialogOpen(false)
    setIsButtonEnabled(true)
    setIsButtonLoading(false)
  }

  return (
    <li>
      {task && (
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <button css={s.addNewTaskButtonStyle}>
              <p>{task.title}</p>
              <p>@{assignment.user.name}</p>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay css={s.dialogOverlayStyle} />
            <Dialog.Content css={s.dialogContentStyle}>
              <div css={s.titleContainerStyle}>
                <Dialog.Title>{task.title}</Dialog.Title>
                <div css={s.closeButtonSpacerStyle} />
                <Dialog.Close asChild>
                  <button aria-label="Close" css={s.closeButtonStyle}>
                    x
                  </button>
                </Dialog.Close>
              </div>

              <Spacer size={30} />
              <Title style="subtitle">Assignment</Title>
              <p>{`@${assignment.user.name}`}</p>

              {type === "assignmentApplication" && (
                <div>
                  <Spacer size={30} />
                  <Title style="subtitle">Message</Title>
                  {assignment.message ? <p>{assignment.message}</p> : <p>No message.</p>}
                </div>
              )}

              {type === "submission" && (
                <div>
                  {(assignment as Submission).link && (
                    <>
                      <Spacer size={30} />
                      <Title style="subtitle">Link</Title>
                      <Link href={(assignment as Submission).link ?? ""}>
                        {(assignment as Submission).link ?? ""}
                      </Link>
                    </>
                  )}

                  {fileDownloadUrl && (
                    <>
                      <Spacer size={30} />
                      <Title style="subtitle">Attached File</Title>
                      <a href={fileDownloadUrl} download={true} css={s.fileDownloadLinkStyle}>
                        {extractFileNameFromUrl((assignment as Submission).fileUrl ?? "")}
                      </a>
                    </>
                  )}

                  <Spacer size={30} />
                  <Title style="subtitle">Message</Title>
                  {assignment.message ? <p>{assignment.message}</p> : <p>No message.</p>}
                </div>
              )}

              {isEditable && (
                <>
                  <Spacer size={30} />
                  <div>
                    <form>
                      <div>
                        <label>
                          <p>Add Comments</p>
                        </label>
                        <textarea
                          placeholder="Comments from project owner..."
                          {...register("commentFromPrjectOwner")}
                        />
                      </div>

                      <Spacer size={30} />
                      <div css={s.buttonGroupStyle}>
                        <Button
                          onClick={handleSubmit(onApprove)}
                          isEnabled={isButtonEnabled}
                          isLoading={isButtonLoading}
                        >
                          Approve
                        </Button>
                        <Spacer size={6} isVertical={false} />
                        <Button
                          onClick={handleSubmit(onReject)}
                          style="outlined"
                          isEnabled={isButtonEnabled}
                          isLoading={isButtonLoading}
                        >
                          Reject
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}
              {!isEditable && assignment.commentsFromProjectOwner && (
                <>
                  <Spacer size={30} />
                  <Title style="subtitle">Comments from Project Owner</Title>
                  <p>{assignment.commentsFromProjectOwner}</p>
                </>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </li>
  )
}

export default AssignmentApprovalDialog
