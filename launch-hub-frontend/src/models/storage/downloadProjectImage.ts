import { Res } from "@/types/Res"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "../firebase/client"

export const downloadImageFromUrl = async (imageUrl: string): Promise<Res<string | null>> => {
  const storageRef = ref(storage, imageUrl)

  try {
    const downloadImageUrl = await getDownloadURL(storageRef)
    return {
      data: downloadImageUrl,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}
