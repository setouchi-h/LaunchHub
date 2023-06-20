import * as s from "./style"
import { useContext } from "react"
import SocialLogin from "@biconomy/web3-auth"
import { ChainId } from "@biconomy/core-types"
import { ethers } from "ethers"
import SmartAccount from "@biconomy/smart-account"
import { useUserState } from "@/states/userState"
import Button from "../ui/Button"
import { SmartAccountContext, SocialLoginContext } from "./AuthProvider"
import Spacer from "../ui/Spacer"
import LoadingCircle from "../ui/LoadingCircle/LoadingCircle"

export const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return

  const separator = "..."
  const separatorLen = separator.length
  const charsToShow = strLen - separatorLen
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)
  return (
    fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
  )
}

export default function Scw({
  isSetting,
  setIsSetting,
}: {
  isSetting: boolean
  setIsSetting: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { setSmartAccount, setProvider } = useContext(SmartAccountContext)
  const { sdkRef } = useContext(SocialLoginContext)

  // const [interval, enableInterval] = useState<boolean>(false)
  let interval = false
  const [user, setUser] = useUserState()

  // useEffect(() => {
  //   let configureLogin: any
  //   console.log(interval)
  //   if (interval) {
  //     configureLogin = setInterval(() => {
  //       console.log(sdkRef.current?.provider)
  //       if (sdkRef.current?.provider) {
  //         console.log("AAA")
  //         setupSmartAccount()
  //         clearInterval(configureLogin)
  //       }
  //     }, 1000)
  //   }
  // }, [interval])

  async function login() {
    setIsSetting(true)
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin()
      const signature1 = await socialLoginSDK.whitelistUrl("http://localhost:3000")
      const signature2 = await socialLoginSDK.whitelistUrl(
        "https://share-profit-dapp-frontend-git-develop-shinchan-git.vercel.app"
      )
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI),
        network: "testnet",
        whitelistUrls: {
          "http://localhost:3000": signature1,
          "https://share-profit-dapp-frontend-git-develop-shinchan-git.vercel.app": signature2,
        },
      })
      sdkRef.current = socialLoginSDK
    }
    if (!sdkRef.current.provider) {
      console.log("BBB")
      // sdkRef.current.showWallet()
      sdkRef.current.showWallet()
      interval = true

      const configureLogin = setInterval(() => {
        console.log(sdkRef.current?.provider)
        if (sdkRef.current?.provider) {
          setupSmartAccount()
          clearInterval(configureLogin)
        }
      }, 1000)
    } else {
      console.log("CCC")
      setupSmartAccount()
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) return
    sdkRef.current.hideWallet()
    const web3Provider = new ethers.providers.Web3Provider(sdkRef.current.provider)
    setProvider(web3Provider)
    try {
      const newSmartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            dappAPIKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY,
          },
        ],
      })
      await newSmartAccount.init().then(() => {
        setSmartAccount(newSmartAccount)
        console.log("Your smart account address: ", newSmartAccount.address)
      })
    } catch (err) {
      console.log("error setting up smart account... ", err)
    }
    setIsSetting(false)
  }

  const logout = async () => {
    if (!user?.socialLogin) {
      console.error("Web3Modal not initialized.")
      return
    }
    await user?.socialLogin.logout()
    user?.socialLogin.hideWallet()
    interval = false

    sdkRef.current = null
    setUser(undefined)
    setSmartAccount(null)
  }
  console.log("user", user)

  return (
    <div>
      {!user?.smartAccount &&
        (!isSetting ? (
          <div css={s.container}>
            <h1>LaunchHub</h1>
            <Spacer size={30} />
            <Button onClick={login}>Login</Button>
            <Spacer size={20} />
            <p css={s.textContainer}>Let&apos;s turn your dream into reality!</p>
          </div>
        ) : (
          <div css={s.setUpContainer}>
            <p css={s.setUpTextContainer}>Setting up your Smart Account...</p>
            <LoadingCircle />
          </div>
        ))}
      {user?.smartAccount && (
        <div css={s.userInfo}>
          <div css={s.userAddr}>
            <p>Smart Account address</p>
            <p>{truncateStr(user?.smartAccount.address, 15)}</p>
          </div>
          <div css={s.button}>
            <Button onClick={logout}>Logout</Button>
          </div>
        </div>
      )}
    </div>
  )
}
