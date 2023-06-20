import fs from "fs"
import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const frontEndAbiLocation = "../share-profit-dapp-frontend/constants/"

const updateFrontEnd: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const accountFactory = await ethers.getContractFactory("AccountFactory")
    fs.writeFileSync(
        `${frontEndAbiLocation}AccountFactory.json`,
        accountFactory.interface.format(ethers.utils.FormatTypes.json).toString()
    )

    const securitiesFactory = await ethers.getContractFactory("SecuritiesFactory")
    fs.writeFileSync(
        `${frontEndAbiLocation}SecuritiesFactory.json`,
        securitiesFactory.interface.format(ethers.utils.FormatTypes.json).toString()
    )

    const securities = await ethers.getContractFactory("Securities")
    fs.writeFileSync(
        `${frontEndAbiLocation}Securities.json`,
        securities.interface.format(ethers.utils.FormatTypes.json).toString()
    )

    const account = await ethers.getContractFactory("Account")
    fs.writeFileSync(
        `${frontEndAbiLocation}Account.json`,
        account.interface.format(ethers.utils.FormatTypes.json).toString()
    )
}

export default updateFrontEnd
updateFrontEnd.tags = ["all", "frontend"]
