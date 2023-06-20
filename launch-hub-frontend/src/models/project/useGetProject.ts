import { useFetchEffect } from "./useFetchEffect";
import { getProjectFromId } from "../firestore/getProjectFromId";
import { getTasksFromId } from "../firestore/getTasksFromId";
import { useProjectState } from "@/states/projectState";
import { downloadFileFromUrl } from "../storage/downloadFile";

export const useGetProject = (projectId: string | string[] | undefined) => {

  const [project, setProject] = useProjectState()

  //get project
  useFetchEffect(async () => {
    if (typeof projectId !== "string") { return }
    if (!projectId) { return }

    //get project
    const { data: projectData } = await getProjectFromId(projectId)
    if (!projectData) { return }

    //get tasks
    const { data: tasksData } = await getTasksFromId(projectId)

    //set project state
    if (projectData.imageUrl) {
      const { data: downloadImageUrl } = await downloadFileFromUrl(projectData.imageUrl)
      setProject({
        ...projectData,
        tasks: tasksData ?? [],
        downloadImageUrl: downloadImageUrl
      })
    } else {
      setProject({
        ...projectData,
        tasks: tasksData ?? []
      })
    }
  }, [projectId], {
    skipFetch: [!projectId]
  })

  return {
    project
  }
}
