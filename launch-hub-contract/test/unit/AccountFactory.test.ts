import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Account, AccountFactory } from "../../typechain-types"
import { expect } from "chai"
import { Deployment } from "hardhat-deploy/types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("AccountFactory Unit Tests", () => {
          let accountFactory: AccountFactory, account: Account
          let deployer: SignerWithAddress, founder: SignerWithAddress, admin: SignerWithAddress
          let SecuritiesFactory: Deployment
          const FOUNDER_GAIN_PERCENTAGE = 1

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              admin = accounts[1]
              founder = accounts[2]

              await deployments.fixture(["factory"])
              SecuritiesFactory = await deployments.get("SecuritiesFactory")
              const AccountFactory = await deployments.get("AccountFactory")
              accountFactory = (await ethers.getContractAt(
                  "AccountFactory",
                  AccountFactory.address
              )) as AccountFactory
          })

          describe("deploy", () => {
              beforeEach(() => {
                  accountFactory = accountFactory.connect(founder)
              })
              it("emits an event after deploying", async () => {
                  await expect(
                      accountFactory.deploy(
                          admin.address,
                          SecuritiesFactory.address,
                          FOUNDER_GAIN_PERCENTAGE
                      )
                  ).to.emit(accountFactory, "AccountDeployed")
              })
              it("transfers ownership correctly", async () => {
                  const txResponse = await accountFactory.deploy(
                      admin.address,
                      SecuritiesFactory.address,
                      FOUNDER_GAIN_PERCENTAGE
                  )
                  const txReceipt = await txResponse.wait(1)
                  const event = txReceipt.events?.find((x) => x.event === "AccountDeployed")

                  account = (await ethers.getContractAt(
                      "Account",
                      event?.args?._accountAddr
                  )) as Account
                  await expect(await account.owner()).to.be.equal(founder.address)
              })
              it("sets admin correctly", async () => {
                  const txResponse = await accountFactory.deploy(
                      admin.address,
                      SecuritiesFactory.address,
                      FOUNDER_GAIN_PERCENTAGE
                  )
                  const txReceipt = await txResponse.wait(1)
                  const event = txReceipt.events?.find((x) => x.event === "AccountDeployed")

                  account = (await ethers.getContractAt(
                      "Account",
                      event?.args?._accountAddr
                  )) as Account
                  await expect(await account.getAdminAddress()).to.be.equal(admin.address)
              })
              it("sets founder's share correctly", async () => {
                  const txResponse = await accountFactory.deploy(
                      admin.address,
                      SecuritiesFactory.address,
                      FOUNDER_GAIN_PERCENTAGE
                  )
                  const txReceipt = await txResponse.wait(1)
                  const event = txReceipt.events?.find((x) => x.event === "AccountDeployed")

                  account = (await ethers.getContractAt(
                      "Account",
                      event?.args?._accountAddr
                  )) as Account
                  await expect(await account.getFounderGainPercentage()).to.be.equal(
                      FOUNDER_GAIN_PERCENTAGE
                  )
              })
              it("sets securities correctly", async () => {
                  const txResponse = await accountFactory.deploy(
                      admin.address,
                      SecuritiesFactory.address,
                      FOUNDER_GAIN_PERCENTAGE
                  )
                  const txReceipt = await txResponse.wait(1)
                  const event = txReceipt.events?.find((x) => x.event === "AccountDeployed")

                  account = (await ethers.getContractAt(
                      "Account",
                      event?.args?._accountAddr
                  )) as Account
                  await expect(await account.getSecurities()).to.be.equal(SecuritiesFactory.address)
              })
          })
      })
