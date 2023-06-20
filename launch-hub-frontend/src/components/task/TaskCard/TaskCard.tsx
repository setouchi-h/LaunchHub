import React, { useState } from "react"
import * as s from "./style"
import { Task, taskStageDisplayText } from "@/types/Task"
import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/router"
import { useFetchEffect } from "@/models/project/useFetchEffect"
import AssignmentForm from "../AssignmentForm"
import Spacer from "@/components/ui/Spacer"
import { useUserValue } from "@/states/userState"
import SubmissionForm from "../SubmissionForm"
import { useSubmissionsValue } from "@/states/submissionsState"
import { useAssignmentApplicationsValue } from "@/states/assignmentApplicatinsState"
import Title from "@/components/ui/Title/Title"
import { assignmentApplicationStageDisplayText } from "@/types/assignmentApplication"
import { Submission, submissionStageDisplayText } from "@/types/submission"
import ReSubmissionForm from "../ReSubmissionForm"
import { useProjectValue } from "@/states/projectState"

type Props = {
  task: Task
}

const TaskCard: React.FC<Props> = ({ task }) => {
  const user = useUserValue()
  const router = useRouter()
  const { taskId } = router.query
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const project = useProjectValue()
  const isUsersCard = (user && task.asigneeIds.includes(user.uid)) ?? false
  const assignmentApplications = useAssignmentApplicationsValue()
  const submissions = useSubmissionsValue()
  const assignmentApplicationsForThisTask = assignmentApplications.filter(
    ($0) => $0.taskId === task.id
  )
  //only one person can apply for assignment
  const noOneHasAppliedForTask = !task.asigneeIds.length && !task.assignmentApplicationIds.length
  const isAssignmentFormAvailable =
    noOneHasAppliedForTask &&
    !assignmentApplicationsForThisTask.find(($0) => $0.userId === user?.uid)
  const submissionsForThisTask = submissions.filter(($0) => $0.taskId === task.id)
  const isSubmissionFormAvailable =
    isUsersCard && !submissionsForThisTask.find(($0) => $0.userId === user?.uid)
  const usersRejectedSubmission: Submission =
    submissionsForThisTask
      .filter(($0) => $0.userId === user?.uid)
      .filter(($0) => $0.stage === "rejected")[0] ?? null

  useFetchEffect(
    () => {
      if (taskId === task.id) {
        setIsDialogOpen(true)
      }
    },
    [],
    {
      skipFetch: [],
    }
  )

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger asChild>
        <button css={() => s.taskCardStyle(isUsersCard)}>
          <p>{task.title}</p>
          {assignmentApplicationsForThisTask.map((assignmentApplication, index) => (
            <p key={index}>@{assignmentApplication.user.name}</p>
          ))}
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

          <div>
            <div>
              <Spacer size={30} />
              <span css={s.taskStageBadgeStyle}>{taskStageDisplayText(task.stage)}</span>
              <span css={s.bountySbtBadgeStyle}>{`${task.bountySbt} USDC`}</span>
            </div>

            {task.outline && (
              <div>
                <Spacer size={30} />
                <Title style="subtitle">Outline</Title>
                <p>{task.outline}</p>
              </div>
            )}

            <div>
              <Spacer size={30} />
              <Title style="subtitle">Details</Title>
              <p css={s.textWithBreakStyle}>{task.details}</p>
            </div>

            {assignmentApplicationsForThisTask.length !== 0 && (
              <>
                <Spacer size={30} />
                <Title style="subtitle">Assignments</Title>
                {assignmentApplicationsForThisTask.map((assignmentApplication, index) => (
                  <p key={index}>
                    {`@${assignmentApplication.user.name} (${assignmentApplicationStageDisplayText(
                      assignmentApplication.stage
                    )})`}
                  </p>
                ))}
              </>
            )}

            {isAssignmentFormAvailable && (
              <>
                <Spacer size={30} />
                <AssignmentForm task={task} />
              </>
            )}

            {submissionsForThisTask.length !== 0 && (
              <>
                <Spacer size={30} />
                <Title style="subtitle">Submissions</Title>
                {submissionsForThisTask.map((submission, index) => (
                  <div key={index}>
                    {index !== 0 && <Spacer size={10} />}
                    <p>
                      {`@${submission.user.name} (${submissionStageDisplayText(
                        submission.stage
                      )})`}
                    </p>
                    {submission.commentsFromProjectOwner && (
                      <div css={s.commentsContainerStyle}>
                        <p>Comments from Project Owner</p>
                        <Spacer size={6} />
                        <p>{submission.commentsFromProjectOwner}</p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {isSubmissionFormAvailable && (
              <>
                <Spacer size={30} />
                <SubmissionForm task={task} />
              </>
            )}

            {usersRejectedSubmission && (
              <>
                <Spacer size={30} />
                <ReSubmissionForm task={task} submission={usersRejectedSubmission} />
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default TaskCard
