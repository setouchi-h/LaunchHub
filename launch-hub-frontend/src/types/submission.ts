import { User } from "./User"

export type SubmissionStage = "inReview" | "accepted" | "rejected"

export type EditingSubmission = {
  projectId: string,
  taskId: string,
  userId: string,
  fileUrl?: string,
  link?: string,
  message?: string,
  stage: SubmissionStage,
  commentsFromProjectOwner?: string
}

export type Submission = EditingSubmission & {
  id: string,
  user: User
}

export const submissionStageDisplayText = (stage: SubmissionStage): string => {
  if (stage === "inReview") { return "In Review" }
  if (stage === "accepted") { return "Accepted" }
  if (stage === "rejected") { return "Rejected" }
  return ""
}
