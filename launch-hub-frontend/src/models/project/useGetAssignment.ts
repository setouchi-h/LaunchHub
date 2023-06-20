import { useFetchEffect } from "./useFetchEffect";
import { useUserValue } from "@/states/userState";
import { getAssignmentApplicationFromId } from "../firestore/getAssignmentApplicationFromId";
import { getSubmissionFromId } from "../firestore/getSubmissionFromId";
import { Project } from "@/types/Project";
import { useSubmissionsState } from "@/states/submissionsState";
import { useAssignmentApplicationsState } from "@/states/assignmentApplicatinsState";
import { AssignmentApplication } from "@/types/assignmentApplication";
import { Submission } from "@/types/submission";

export const useGetAssignment = (project: Project | null | undefined) => {

  const user = useUserValue()
  const [assignmentApplications, setAssignmentApplications] = useAssignmentApplicationsState()
  const [submissions, setSubmissions] = useSubmissionsState()

  //get project
  useFetchEffect(async () => {
    if (!user || !project || !project.tasks) { return }

    //get assignment applications
    const allAssignmentApplicationIds: string[] = project.tasks.map((task) => task.assignmentApplicationIds).flat()

    let assignmentApplicationsArray: AssignmentApplication[] = []
    for (let i = 0; i < allAssignmentApplicationIds.length; i++) {
      const assignmentApplicationId = allAssignmentApplicationIds[i]
      const { data: assignmentApplication } = await getAssignmentApplicationFromId(assignmentApplicationId)
      if (!assignmentApplication) { continue }
      assignmentApplicationsArray.push(assignmentApplication)
    }
    //set assignment applications
    setAssignmentApplications(assignmentApplicationsArray)

    //get submissions
    const allSubmissionIds: string[] = project.tasks.map((task) => task.submissionIds).flat()
    const submissionsArray: Submission[] = []
    for (let i = 0; i < allSubmissionIds.length; i++) {
      const submissionId = allSubmissionIds[i]
      const { data: submission } = await getSubmissionFromId(submissionId)
      if (!submission) { continue }
      submissionsArray.push(submission)
    }
    //set submissions
    setSubmissions(submissionsArray)


  }, [user, project], {
    skipFetch: [!user, !project, !project?.tasks]
  })

  return {
    assignmentApplications,
    submissions,
  }
}
