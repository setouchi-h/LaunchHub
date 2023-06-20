import * as s from "./style"
import React, { useState } from "react"
import Spacer from "@/components/ui/Spacer"
import { Web3Button, useAddress, useContract, useContractRead } from "@thirdweb-dev/react"
import networkConfig from "../../../../constants/networkMapping.json"
import accountAbi from "../../../../constants/Account.json"
import { ethers } from "ethers"
import { contractAddressesInterface } from "@/types/networkAddress"
import { Astar } from "@thirdweb-dev/chains"

type Props = {
  projectTreasuryAddress: string
}

const ReceiveProceeds: React.FC<Props> = ({ projectTreasuryAddress }) => {
  const [isWithdrawalButtonUnClickable, setWithdrawalButtonUnClickable] = useState<boolean>(true)

  const addresses: contractAddressesInterface = networkConfig
  const chainString = Astar.chainId.toString()
  const tokenAddr = addresses[chainString].Usdc[0]
  const account = useAddress()
  const { contract: accountContaract } = useContract(projectTreasuryAddress, accountAbi)
  const { data: releasableToken } = useContractRead(accountContaract, "releasableToken", [
    tokenAddr,
    account,
  ])
  if (releasableToken && ethers.utils.formatUnits(parseInt(releasableToken as string)) !== "0.0") {
    setWithdrawalButtonUnClickable(false)
  }

  return (
    <div>
      <p>Unreceived Proceeds</p>
      {releasableToken ? (
        <div>{ethers.utils.formatUnits(parseInt(releasableToken as string), 6)} USDC</div>
      ) : (
        <div>0.0 USDC</div>
      )}

      <Spacer size={60} />
      <p>Receive Proceeds</p>
      <Web3Button
        contractAddress={projectTreasuryAddress}
        contractAbi={accountAbi}
        action={(contract) => {
          contract.call("withdrawToken", [tokenAddr])
        }}
        onError={(error) => console.log(error)}
        isDisabled={isWithdrawalButtonUnClickable}
      >
        Withdraw USDC
      </Web3Button>
    </div>
  )
}

export default ReceiveProceeds
