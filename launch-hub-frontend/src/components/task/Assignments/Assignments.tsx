import React from "react"
import * as s from "./style"
import Title from "@/components/ui/Title"
import Spacer from "@/components/ui/Spacer"
import { Submission } from "@/types/submission"
import { AssignmentApplication } from "@/types/assignmentApplication"
import { Task } from "@/types/Task"
import AssignmentApprovalDialog from "../AssignmentApprovalDialog"

type Props = {
  assignmentApplications: AssignmentApplication[],
  submissions: Submission[],
  tasks: Task[]
}

const Assignments: React.FC<Props> = ({ assignmentApplications, submissions, tasks }) => {

  return (
    <div css={s.assignmentsStyle}>
      <div css={s.assignmentsContainerStyle}>
        <Title style="subtitle">
          Task Assignment Applicatoins
        </Title>

        <Spacer size={10} />
        <p>
          Need to Approve/Reject
        </p>
        <ul css={s.tableStyle}>
          {assignmentApplications.map((assignmentApplication, index) =>
            assignmentApplication.stage === "inReview" && (
              <AssignmentApprovalDialog
                type="assignmentApplication"
                tasks={tasks}
                assignment={assignmentApplication}
                key={index}
              />
            )
          )}
        </ul>

        <Spacer size={20} />
        <p>
          Approved Assignments
        </p>
        <ul css={s.tableStyle}>
          {assignmentApplications.map((assignmentApplication, index) =>
            assignmentApplication.stage === "accepted" && (
              <AssignmentApprovalDialog
                type="assignmentApplication"
                tasks={tasks}
                assignment={assignmentApplication}
                isEditable={false}
                key={index}
              />
            )
          )}
        </ul>

        <Spacer size={20} />
        <p>
          Rejected Assignment Applicatins
        </p>
        <ul css={s.tableStyle}>
          {assignmentApplications.map((assignmentApplication, index) =>
            assignmentApplication.stage === "rejected" && (
              <AssignmentApprovalDialog
                type="assignmentApplication"
                tasks={tasks}
                assignment={assignmentApplication}
                isEditable={false}
                key={index}
              />
            )
          )}
        </ul>
      </div>
      <Spacer size={30} />

      <div css={s.assignmentsContainerStyle}>
        <Title style="subtitle">
          Task Submissions
        </Title>

        <Spacer size={10} />
        <p>
          Need to Approve/Reject
        </p>
        <ul css={s.tableStyle}>
          {submissions.map((submission, index) =>
            submission.stage === "inReview" && (
              <AssignmentApprovalDialog
                type="submission"
                tasks={tasks}
                assignment={submission}
                key={index}
              />
            )
          )}
        </ul>

        <Spacer size={20} />
        <p>
          Approved Submissions
        </p>
        <ul css={s.tableStyle}>
          {submissions.map((submission, index) =>
            submission.stage === "accepted" && (
              <AssignmentApprovalDialog
                type="submission"
                tasks={tasks}
                assignment={submission}
                isEditable={false}
                key={index}
              />
            )
          )}
        </ul>

        <Spacer size={20} />
        <p>
          Rejected Submissions
        </p>
        <ul css={s.tableStyle}>
          {submissions.map((submission, index) =>
            submission.stage === "rejected" && (
              <AssignmentApprovalDialog
                type="submission"
                tasks={tasks}
                assignment={submission}
                isEditable={false}
                key={index}
              />
            )
          )}
        </ul>
      </div>
    </div>
  )
}

export default Assignments