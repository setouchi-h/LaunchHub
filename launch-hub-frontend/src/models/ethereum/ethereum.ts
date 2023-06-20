import { BaseProvider } from "@metamask/providers"

const getEthereum = () => {
  if (typeof window === "undefined") {
    return null

  } else {
    return (window as any).ethereum as BaseProvider
  }
}

export const ethereum = getEthereum()