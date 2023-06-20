import { toHex } from "@/utils/toHex"
import { ethereum } from "./ethereum"

type Props = {
  nonce: string,
  address: string
}

export const requestSignature = async ({ nonce, address }: Props): Promise<string | null> => {

  if (!ethereum) { return null }

  try {
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [
        `0x${toHex(nonce)}`,
        address,
      ],
    }) as string
    return signature

  } catch {
    return null
  }
}