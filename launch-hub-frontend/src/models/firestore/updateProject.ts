import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { Project } from "@/types/Project"
import { Task } from "@/types/Task"

export const updateProject = async ({ projectId, project }: { projectId: string, project: Partial<Project> }): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.PROJECTS, projectId)

  try {
    await updateDoc(docRef, project)
    return {
      data: null,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}

export const updateProjectArray = async ({ projectId, key, value, method }: { projectId: string, key: keyof Project, value: string | Task, method: "union" | "remove" }): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.PROJECTS, projectId)

  try {
    if (method === "union") {
      await updateDoc(docRef, { [key]: arrayUnion(value) })
    } else {
      await updateDoc(docRef, { [key]: arrayRemove(value) })
    }
    return {
      data: null,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}