import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { developmentChains } from "../helper-hardhat-config"
// @ts-ignore
import { verify } from "../utils/verify"

const deployAccount: DeployFunction = async function (fre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log, get } = deployments
    const { deployer, admin } = await getNamedAccounts()
    let adminAddress = "0x8eBD4fAa4fcEEF064dCaEa48A3f75d0D0A3ba3f2"
    const securities = await get("Securities")

    if (developmentChains.includes(network.name)) {
        adminAddress = admin
    }

    log("Deploying account...")
    const account = await deploy("Account", {
        from: deployer,
        args: [adminAddress, securities.address, 1],
        log: true,
    })

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying...")
        await verify(account.address, [adminAddress, securities.address, 1])
    }

    log("-------------------------------------------------")
}

export default deployAccount

deployAccount.tags = ["all", "main", "account"]
