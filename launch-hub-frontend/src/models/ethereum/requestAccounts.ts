import { ethereum } from "./ethereum"

export const requestAccounts = async (): Promise<string[] | null> => {

  if (!ethereum) { return null }

  try {
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    }) as string[]
    return accounts

  } catch {
    return null
  }
}