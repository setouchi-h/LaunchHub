import { User } from "./User"

export type Holder = {
  address: string,
  amount: number
}

export type SbtOwner = Holder & User