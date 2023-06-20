import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { Task } from "@/types/Task"

export const updateTask = async ({ projectId, taskId, task }: { projectId: string, taskId: string, task: Partial<Task> }): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.PROJECTS, projectId, KEYS.PROJECT.TASKS, taskId)

  try {
    await updateDoc(docRef, task)
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

export const updateTaskArray = async ({ projectId, taskId, key, value, method }: { projectId: string, taskId: string, key: keyof Task, value: string, method: "union" | "remove" }): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.PROJECTS, projectId, KEYS.PROJECT.TASKS, taskId)

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
