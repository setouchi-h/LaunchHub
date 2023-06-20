import * as s from "./style"
import React, { useContext, useEffect, useState } from "react"
import Spacer from "@/components/ui/Spacer"
import networkConfig from "../../../../constants/networkMapping.json"
import accountAbi from "../../../../constants/Account.json"
import { ethers } from "ethers"
import { contractAddressesInterface } from "@/types/networkAddress"
import { ChainId } from "@biconomy/core-types"
import Button from "@/components/ui/Button"
import { SmartAccountContext } from "@/components/auth/AuthProvider"

type Props = {
  projectTreasuryAddress: string
}

const ReceiveProceeds: React.FC<Props> = ({ projectTreasuryAddress }) => {
  const { smartAccount, provider } = useContext(SmartAccountContext)

  const [releasableToken, setReleasableToken] = useState<string>("0.0")
  const [isWithdrawalButtonClickable, setIsWithdrawalButtonClickable] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const addresses: contractAddressesInterface = networkConfig
  const chainString = ChainId.POLYGON_MUMBAI.toString()
  const tokenAddr = addresses[chainString].TT[0]

  const getReleasableToken = async () => {
    const contract = new ethers.Contract(projectTreasuryAddress, accountAbi, provider)
    const currentReleasableToken = await contract.releasableToken(tokenAddr, smartAccount?.address)
    console.log(currentReleasableToken)
    setReleasableToken(ethers.utils.formatEther(currentReleasableToken))
  }

  const onWithdrawToken = async () => {
    setIsWithdrawalButtonClickable(false)
    setIsLoading(true)
    if (!smartAccount) return
    try {
      const accountInterface = new ethers.utils.Interface(accountAbi)
      const encodedWithdrawTokenData = accountInterface.encodeFunctionData("withdrawToken", [
        tokenAddr,
      ])
      const tx = {
        to: projectTreasuryAddress,
        data: encodedWithdrawTokenData,
      }
      // const contract = new ethers.Contract(projectTreasuryAddress, accountAbi, provider)
      // const myTx = await contract.populateTransaction.withdrawToken(tokenAddr)
      // const tx = {
      //   to: projectTreasuryAddress,
      //   data: myTx.data,
      // }
      // const quotes = await smartAccount.getFeeQuotes({
      //   transaction: tx,
      // })
      // console.log("quotes: ", quotes)
      // const transaction = await smartAccount.createUserPaidTransaction({
      //   transaction: tx,
      //   feeQuote: quotes[0],
      // })
      const txResponse = await smartAccount.sendTransaction({ transaction: tx })
      // const txResponse = await smartAccount.sendUserPaidTransaction({
      //   tx: transaction,
      //   gasLimit: {
      //     hex: "0xC3500",
      //     type: "hex",
      //   },
      // })
      console.log("userOp hash: ", txResponse.hash)
      const txReciept = await txResponse.wait()
      console.log("Tx: ", txReciept)
      setIsLoading(false)
      setReleasableToken("0.0")
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getReleasableToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (releasableToken !== "0.0") {
      setIsWithdrawalButtonClickable(true)
    }
  }, [releasableToken])

  return (
    <div>
      <p>Unreceived Proceeds</p>
      {releasableToken ? (
        // <div>{ethers.utils.formatUnits(parseInt(releasableToken as strdiv>ing), 6)} USDC</div>
        <div>{releasableToken} USDC</div>
      ) : (
        <div>0.0 USDC</div>
      )}

      <Spacer size={60} />
      <p>Receive Proceeds</p>
      <Button
        isEnabled={isWithdrawalButtonClickable}
        isLoading={isLoading}
        onClick={onWithdrawToken}
      >
        Withdraw USDC
      </Button>
    </div>
  )
}

export default ReceiveProceeds
