import React, { createContext, useEffect, useRef, useState } from "react"
import { useUserState } from "@/states/userState"
import UserNameDialog from "../user/UserNameDialog"
import dynamic from "next/dynamic"
import SmartAccount from "@biconomy/smart-account"
import { asyncTask } from "@/utils/asyncTask"
import { signIn } from "@/models/auth/signIn"
import SocialLogin from "@biconomy/web3-auth"

type Props = {
  children: React.ReactNode
}

export const SmartAccountContext = createContext<{
  smartAccount: SmartAccount | null
  setSmartAccount: React.Dispatch<React.SetStateAction<SmartAccount | null>>
  provider: any
  setProvider: React.Dispatch<React.SetStateAction<any>>
}>({ smartAccount: null, setSmartAccount: () => {}, provider: null, setProvider: () => {} })

export const SocialLoginContext = createContext<{
  sdkRef: React.MutableRefObject<SocialLogin | null | undefined>
}>({ sdkRef: { current: null } })

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useUserState()
  const hasNoUserName = user && !user.name
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const sdkRef = useRef<SocialLogin | null | undefined>(null)
  const [isSetting, setIsSetting] = useState<boolean>(false)

  const SocialLoginDynamic = dynamic(() => import("./Scw").then((res) => res.default), {
    ssr: false,
  })

  console.log(user)

  useEffect(() => {
    // user setup
    if (smartAccount && sdkRef.current) {
      const address = smartAccount?.address
      if (!address) {
        return
      }
      asyncTask(async () => {
        const authenticatedUser = await signIn({ address: address })
        if (!authenticatedUser) {
          return
        }
        setUser({
          ...authenticatedUser,
          socialLogin: sdkRef.current,
          smartAccount: smartAccount,
          provider: provider,
        })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartAccount])

  return (
    <>
      <SocialLoginContext.Provider value={{ sdkRef }}>
        <SmartAccountContext.Provider
          value={{ smartAccount, setSmartAccount, provider, setProvider }}
        >
          <SocialLoginDynamic isSetting={isSetting} setIsSetting={setIsSetting} />
          <React.Fragment>
            {user ? hasNoUserName ? <UserNameDialog /> : children : isSetting ? <></> : <></>}
          </React.Fragment>
          {/* )} */}
        </SmartAccountContext.Provider>
      </SocialLoginContext.Provider>
    </>
  )
}

export default AuthProvider
