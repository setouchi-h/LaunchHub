import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { verify } from "../utils/verify"
// @ts-ignore
import { developmentChains } from "../helper-hardhat-config"

const deployAccountFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("Deploying factory...")
    const args: null[] = []
    const AccountFactory = await deploy("AccountFactory", {
        from: deployer,
        args,
        log: true,
    })

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying...")
        await verify(AccountFactory.address, args)
    }

    log("-------------------------------------------------")
}

export default deployAccountFactory

deployAccountFactory.tags = ["all", "factory", "accountFactory"]
