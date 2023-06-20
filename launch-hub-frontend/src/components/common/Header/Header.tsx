import { signIn } from "@/models/auth/signIn"
import * as s from "./style"
import { ConnectWallet, useAddress } from "@thirdweb-dev/react"
import { useSetUserState } from "@/states/userState"
import { useEffect } from "react"
import { asyncTask } from "@/utils/asyncTask"
import { getUser } from "@/models/firestore/getUser"
import { createUser } from "@/models/firestore/createUser"

const Header: React.FC = () => {
  const setUser = useSetUserState()
  const account = useAddress()

  useEffect(() => {
    const address = account
    asyncTask(async () => {
      if (address) {
        const authenticatedUser = await signIn({ address: address })
        if (!authenticatedUser) {
          return
        }
        const { data: existingUserData } = await getUser(authenticatedUser.uid)
        if (!existingUserData) {
          const { data: createdUser } = await createUser({
            uid: authenticatedUser.uid,
            name: "",
          })
          if (!createdUser) {
            return
          }
          setUser(createdUser)
        } else {
          setUser(authenticatedUser)
        }
      } else {
        setUser(null)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <header css={s.headerStyle}>
      <div css={s.spacerStyle} />
      <ConnectWallet theme="light" />
    </header>
  )
}

export default Header
