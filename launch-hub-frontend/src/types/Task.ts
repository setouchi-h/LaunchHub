export type TaskStage = "todo" | "inProgress" | "inReview" | "done"

export type EditingTask = {
  title: string,
  stage: TaskStage,
  outline?: string,
  details: string,
  bountySbt: number,
  ownerId: string,
  asigneeIds: string[],
  assignmentApplicationIds: string[],
  submissionIds: string[]
}

export type Task = EditingTask & {
  id: string
}

export type TaskIndex = {
  taskId: string,
  index: number
}

export const taskStageDisplayText = (stage: TaskStage): string => {
  if (stage === "todo") { return "To Do" }
  if (stage === "inProgress") { return "In Progress" }
  if (stage === "inReview") { return "In Review" }
  if (stage === "done") { return "Done" }
  return ""
}