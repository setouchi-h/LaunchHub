import { auth } from "@/models/firebase/client"
import { User } from "../../types/User"
import { signInWithCustomToken } from "firebase/auth"
import { userFromFirebase } from "../firestore/dataConverter"
import { PATHS } from "@/components/pages/paths"
import { getUser } from "../firestore/getUser"

type Props = {
  address: string
}

export const signIn = async ({ address }: Props): Promise<User | null> => {
  // 認証処理

  //generate firebase custom token
  const customTokenRes = await fetch(`${PATHS.API.CUSTOM_TOKEN}?address=${address}`)
  const customToken = (await customTokenRes.json()) as string

  //authenticate using the custom token
  const userCredential = await signInWithCustomToken(auth, customToken)
  const authenticatedUser = userFromFirebase(userCredential.user)

  //get user data
  const { data: user } = await getUser(authenticatedUser.uid)

  if (user) {
    return user
  } else {
    return authenticatedUser
  }
}
