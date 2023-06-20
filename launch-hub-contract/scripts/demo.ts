import { ethers, deployments } from "hardhat"

export async function demo() {
    const accounts = await ethers.getSigners()
    const founder = accounts[0]
    const admin = accounts[1]
    const member = accounts[2]
    const ETH_AMOUNT = ethers.utils.parseEther("1")

    const Securities = await deployments.get("Securities")
    let securities = await ethers.getContractAt("Securities", Securities.address)
    const Account = await deployments.get("Account")
    let account = await ethers.getContractAt("Account", Account.address)

    console.log("Transfer owenrship to admin")
    await account.transferOwnership(admin.address)
    await securities.transferOwnership(admin.address)
    account = account.connect(admin)
    securities = securities.connect(admin)
    console.log("----------------------------------------------------------------")

    console.log("Mint...")
    await securities.mint(10, admin.address)
    await securities.mint(10, member.address)
    console.log("----------------------------------------------------------------")

    console.log("Pay eth...")
    await account.pay({ value: ETH_AMOUNT })
    console.log("----------------------------------------------------------------")

    console.log(await account.releasableEth(admin.address))
    console.log(await account.releasableEth(member.address))

    console.log("Withdraw...")
    await account.withdrawEth()
    account = account.connect(member)
    await account.withdrawEth()
    console.log("----------------------------------------------------------------")

    console.log(await account.releasableEth(admin.address))
    console.log(await account.releasableEth(member.address))
}

demo()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
