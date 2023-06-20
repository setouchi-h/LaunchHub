import Title from "../ui/Title/Title"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import TabBar from "../radix/TabBar"
import { useUserValue } from "@/states/userState"
import { updateProjectArray } from "@/models/firestore/updateProject"
import LoadingCircle from "../ui/LoadingCircle/LoadingCircle"
import TaskBoard from "../task/TaskBoard"
import Assignments from "../task/Assignments"
import ProjectOverview from "../project/ProjectOverview/ProjectOverview"
import ProjectMembers from "../project/ProjectMembers"
import { useGetSbtHolders } from "@/models/project/useGetSbtHolders"
import { useGetProject } from "@/models/project/useGetProject"
import { useGetAssignment } from "@/models/project/useGetAssignment"
import { useIsProjectOwner } from "@/models/project/useIsProjectOwner"
import ProjectHeader from "../project/ProjectHeader"
import ReceiveProceeds from "../project/ReceiveProceeds"
import { useSetAttendingProjectState } from "@/states/attendingProjects"

export default function ProjectPage() {
  const router = useRouter()
  const { projectId, taskId } = router.query
  const user = useUserValue()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const { project } = useGetProject(projectId)
  const setAttendingProjects = useSetAttendingProjectState()
  const sbtHolders = useGetSbtHolders()
  const { assignmentApplications, submissions } = useGetAssignment(project)
  const isProjectOwner = useIsProjectOwner(project)
  const [_, setProjectIdQueryString] = useState<string>("")
  const projectTreasuryAddress = project?.vaultAddress ?? ""

  // useEffect(() => {
  //   setProjectIdQueryString((currentValue) => {
  //     if (typeof projectId !== "string") {
  //       return currentValue
  //     }
  //     if (!projectId) {
  //       return currentValue
  //     }
  //     if (currentValue && projectId !== currentValue) {
  //       router.reload()
  //     }
  //     return projectId
  //   })
  // }, [projectId])

  //set if user needs to enter invitation code
  useEffect(() => {
    if (!project || !user) {
      return
    }
    if (isProjectOwner) {
      setIsVerified(true)
    } else {
      setIsVerified(project.memberIds.includes(user.uid))
    }
  }, [project, user, isProjectOwner])

  const onChangeInvitationCode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    if (!project) {
      return
    }
    if (!user) {
      return
    }

    if (text === project.invitationCode) {
      setIsVerified(true)
      await updateProjectArray({
        projectId: project.id,
        key: "memberIds",
        value: user.uid,
        method: "union",
      })

      setAttendingProjects((currentValue) => {
        return [
          ...currentValue,
          project
        ]
      })
    }
  }

  return (
    <div>
      {project ? (
        isVerified ? (
          <TabBar.Root defaultValue={taskId ? "tasks" : "overview"}>
            <ProjectHeader project={project} />

            <TabBar.List>
              <TabBar.Trigger value="overview">Overview</TabBar.Trigger>
              <TabBar.Trigger value="tasks">Tasks</TabBar.Trigger>
              <TabBar.Trigger value="project-members">Project Members</TabBar.Trigger>
              <TabBar.Trigger value="receive-proceeds">Receive Proceeds</TabBar.Trigger>
              {isProjectOwner && <TabBar.Trigger value="assignments">Assignments</TabBar.Trigger>}
            </TabBar.List>

            <TabBar.Content value="overview">
              <ProjectOverview project={project} isProjectOwner={isProjectOwner} />
            </TabBar.Content>

            <TabBar.Content value="tasks">
              <TaskBoard />
            </TabBar.Content>

            <TabBar.Content value="project-members">
              <ProjectMembers projectMembers={sbtHolders} />
            </TabBar.Content>

            <TabBar.Content value="receive-proceeds">
              <ReceiveProceeds projectTreasuryAddress={projectTreasuryAddress} />
            </TabBar.Content>

            {isProjectOwner && (
              <TabBar.Content value="assignments">
                <Assignments
                  assignmentApplications={assignmentApplications}
                  submissions={submissions}
                  tasks={project.tasks}
                />
              </TabBar.Content>
            )}
          </TabBar.Root>
        ) : (
          <div>
            <p>Enter Invitation Code</p>
            <input
              type="text"
              placeholder="Invitation code..."
              onChange={onChangeInvitationCode}
            />
          </div>
        )
      ) : project === undefined ? (
        <div>
          <p>Loading</p>
          <LoadingCircle />
        </div>
      ) : (
        <div>
          <Title>Project Not Found</Title>
        </div>
      )}
    </div>
  )
}
