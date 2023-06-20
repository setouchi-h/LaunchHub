import { Project } from "@/types/Project"
import { User } from "../../types/User"
import { Task } from "@/types/Task"
import { AssignmentApplication } from "@/types/assignmentApplication"
import { Submission } from "@/types/submission"
import { Holder } from "@/types/SbtOwner"

export const userFromFirebase = (data: any): User => {
  return {
    uid: data?.uid ?? "",
    nonce: data?.nonce ?? "",
    name: data?.name ?? "",
  }
}

export const projectFromFirebase = (data: any): Project => {
  return {
    id: data?.id ?? "",
    title: data?.title ?? "",
    imageUrl: data?.imageUrl,
    details: (data?.details ?? "").replace(/\\n/g, "\n"),
    twitterUrl: data?.twitterUrl,
    discordUrl: data?.discordUrl,
    ownerProfitShare: data?.ownerProfitShare ?? 0,
    invitationCode: data?.invitationCode ?? "",
    state: data?.state ?? "uncompleted",
    createdBy: data?.createdBy ?? "",
    ownerIds: data?.ownerIds ?? [],
    memberIds: data?.memberIds ?? [],
    lastModifiedAt: data?.lastModifiedAt ?? new Date(),
    sbtImageUrl: data?.sbtImageUrl,
    sbtTokenName: data?.sbtTokenName,
    sbtAddress: data?.sbtAddress,
    // sbtTokenSymbol: data?.sbtTokenSymbol,
    vaultAddress: data?.vaultAddress,
    tasks: [],
    taskIndexes: data?.taskIndexes ?? [],
  }
}

export const taskFromFirebase = (data: any): Task => {
  return {
    id: data?.id ?? "",
    title: data?.title ?? "",
    stage: data?.stage ?? "todo",
    outline: data?.outline,
    details: (data?.details ?? "").replace(/\\n/g, "\n"),
    bountySbt: data?.bountySbt ?? 0,
    ownerId: data?.ownerId ?? "",
    asigneeIds: data?.asigneeIds ?? [],
    assignmentApplicationIds: data?.assignmentApplicationIds ?? [],
    submissionIds: data?.submissionIds ?? [],
  }
}

export const assignmentApplicationFromFirebase = (data: any): AssignmentApplication => {
  return {
    id: data?.id ?? "",
    projectId: data?.projectId ?? "",
    taskId: data?.taskId ?? "",
    userId: data?.userId ?? "",
    message: (data?.message ?? "").replace(/\\n/g, "\n"),
    stage: data?.stage ?? "inReview",
    commentsFromProjectOwner: data?.commentsFromProjectOwner,
    user: userFromFirebase(data?.user),
  }
}

export const submissionFromFirebase = (data: any): Submission => {
  return {
    id: data?.id ?? "",
    projectId: data?.projectId ?? "",
    taskId: data?.taskId ?? "",
    userId: data?.userId ?? "",
    link: data?.link,
    fileUrl: data?.fileUrl,
    message: (data?.message ?? "").replace(/\\n/g, "\n"),
    stage: data?.stage ?? "inReview",
    commentsFromProjectOwner: data?.commentsFromProjectOwner,
    user: userFromFirebase(data?.user),
  }
}

export const holdersFromChain = (data: any): Holder[] => {
  if (Array.isArray(data)) {
    return data.map(($0) => {
      return {
        address: $0.address ?? "",
        amount: $0.amount ?? 0
      }
    })
  } else {
    return []
  }
}
