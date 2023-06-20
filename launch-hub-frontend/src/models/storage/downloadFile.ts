import { Res } from "@/types/Res"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "../firebase/client"

export const downloadFileFromUrl = async (fileUrl: string): Promise<Res<string | null>> => {
  const storageRef = ref(storage, fileUrl)

  try {
    const downloadFileUrl = await getDownloadURL(storageRef)
    return {
      data: downloadFileUrl,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}
