import SmartAccount from "@biconomy/smart-account"
import SocialLogin from "@biconomy/web3-auth"

export type User = {
  uid: string
  nonce?: string
  name: string
}

export type UserWithSmartAccount = User & {
  socialLogin?: SocialLogin | null | undefined
  smartAccount?: SmartAccount | null | undefined
  provider?: any
}
