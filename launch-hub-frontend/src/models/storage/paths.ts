export const PATHS = {
  ROOT: "gs://share-profit-dapp.appspot.com",
  projectImage: ({ projectId, fileName }: { projectId: string, fileName: string }) => {
    const fileExtension = fileName.substring(fileName.lastIndexOf("."))
    return `/projects/${projectId}/projectImage/project${fileExtension}`
  },
  sbtImage: ({ projectId, fileName }: { projectId: string, fileName: string }) => {
    const fileExtension = fileName.substring(fileName.lastIndexOf("."))
    return `/projects/${projectId}/sbtImage/sbt${fileExtension}`
  },
  submissionFile: ({ submissionId, fileName, avoidConflict }: { submissionId: string, fileName: string, avoidConflict: string }) => {
    return `/submissions/${submissionId}/submissionFile${avoidConflict}/${fileName}`
  }
}