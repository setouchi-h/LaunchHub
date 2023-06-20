import { Task, TaskIndex } from "./Task"

type ProjectCoreInformation = {
  title: string
  imageUrl?: string
  details?: string
  twitterUrl?: string
  discordUrl?: string
  ownerProfitShare?: number
  invitationCode: string
  state: "ongoing" | "uncompleted"
  createdBy: string
  ownerIds: string[]
  memberIds: string[]
  lastModifiedAt: Date
  sbtImageUrl?: string
  tasks: Task[]
  taskIndexes: TaskIndex[]
}

type ProjectWithId = {
  id: string
}

type ProjectWithServerInformation = {
  sbtTokenName: string
  // sbt token symbol is not necessary
  // sbtTokenSymbol: string,
  sbtAddress: string
  vaultAddress: string
  downloadImageUrl?: string | null
}

//project being edited, id is not required
export type EditingProject = ProjectCoreInformation &
  Partial<ProjectWithId> &
  Partial<ProjectWithServerInformation>

//project being edited, but id is required
export type EditingProjectWithId = ProjectCoreInformation &
  ProjectWithId &
  Partial<ProjectWithServerInformation>

//project from database
export type Project = ProjectCoreInformation & ProjectWithId & ProjectWithServerInformation
