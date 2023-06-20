import { ethers, network, deployments } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Account, Securities, TestUSDC } from "../../typechain-types"
import { expect } from "chai"
import { BigNumber } from "ethers"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Account Unit Tests", () => {
          let securities: Securities, account: Account, usdc: TestUSDC
          let founder: SignerWithAddress,
              admin: SignerWithAddress,
              member: SignerWithAddress,
              outsider: SignerWithAddress
          const FOUNDER_GAIN_PERCENTAGE = 1
          const NEW_FOUNDER_GAIN_PERCENTAGE = 2
          const ETH_AMOUNT = ethers.utils.parseEther("1")
          const USDC_AMOUNT = 100
          const TOKEN_AMOUNT = 10

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              founder = accounts[0]
              admin = accounts[1]
              member = accounts[2]
              outsider = accounts[3]

              await deployments.fixture(["main", "mock"])
              const Securities = await deployments.get("Securities")
              securities = (await ethers.getContractAt(
                  "Securities",
                  Securities.address
              )) as Securities
              const Account = await deployments.get("Account")
              account = (await ethers.getContractAt("Account", Account.address)) as Account
              const Usdc = await deployments.get("TestUSDC")
              usdc = (await ethers.getContractAt("TestUSDC", Usdc.address)) as TestUSDC
              await securities.mint(TOKEN_AMOUNT, member.address)
          })

          describe("constructor", () => {
              it("sets starting value correctly", async () => {
                  await expect(await account.getSecurities()).to.be.equal(securities.address)
                  await expect(await account.getFounderGainPercentage()).to.be.equal(
                      FOUNDER_GAIN_PERCENTAGE
                  )
                  await expect(await account.getAdminAddress()).to.be.equal(admin.address)
              })
          })
          describe("pay", () => {
              it("accepts pay through pay func", async () => {
                  account = account.connect(outsider)
                  await expect(account.pay({ value: ETH_AMOUNT }))
                      .to.emit(account, "EthReceived")
                      .withArgs(outsider.address, ETH_AMOUNT)
              })
              it("updates balance after paying through pay func", async () => {
                  const initialAmount = await account.getAddressToAmountPayed(outsider.address)
                  account = account.connect(outsider)
                  await account.pay({ value: ETH_AMOUNT })
                  await expect(
                      (await account.getAddressToAmountPayed(outsider.address)).toString()
                  ).to.be.equal(initialAmount.add(ETH_AMOUNT).toString())
                  await expect(outsider.getBalance())
              })
              it("accepts pay not through pay func", async () => {
                  await expect(outsider.sendTransaction({ to: account.address, value: ETH_AMOUNT }))
                      .to.emit(account, "EthReceived")
                      .withArgs(outsider.address, ETH_AMOUNT)
              })
              it("updates balance after paying not through pay func", async () => {
                  const initialAmount = await account.getAddressToAmountPayed(outsider.address)
                  await outsider.sendTransaction({ to: account.address, value: ETH_AMOUNT })
                  await expect(
                      (await account.getAddressToAmountPayed(outsider.address)).toString()
                  ).to.be.equal(initialAmount.add(ETH_AMOUNT).toString())
              })
          })
          describe("withdrawEth", () => {
              it("exclusively allows those authorized to withdraw eth", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = account.connect(outsider)
                  await expect(account.withdrawEth()).to.be.revertedWithCustomError(
                      account,
                      "Account__NotAuthorized"
                  )
              })
              it("emits event after admin withdrawing eth", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = await account.connect(admin)
                  const amount = await account.releasableEth(admin.address)
                  await expect(account.withdrawEth())
                      .to.emit(account, "EthWithdrawn")
                      .withArgs(admin.address, amount)
              })
              it("transfers eth from account to admin", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = await account.connect(admin)
                  const amount = await account.releasableEth(admin.address)
                  const accountBalanceBefore = await account.provider.getBalance(account.address)
                  const adminBalanceBefore = await admin.getBalance()
                  const txResponse = await account.withdrawEth()
                  const transactionReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const accountBalanceAfter = await account.provider.getBalance(account.address)
                  const adminBalanceAfter = await admin.getBalance()
                  await expect(accountBalanceAfter.add(amount)).to.be.equal(accountBalanceBefore)
                  await expect(adminBalanceAfter.add(gasCost)).to.be.equal(
                      adminBalanceBefore.add(amount)
                  )
              })
              it("updates released balance after admin withdrawing eth", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = await account.connect(admin)
                  const amount = await account.releasableEth(admin.address)
                  await account.withdrawEth()

                  // check released balance
                  await expect(await account.getTotalReleasedEth()).to.be.equal(amount)
                  await expect(await account.getAddressToReleasedEth(admin.address)).to.be.equal(
                      amount
                  )
              })
              it("emits event after founder withdrawing eth", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  const amount = await account.releasableEth(founder.address)
                  await expect(account.withdrawEth())
                      .to.emit(account, "EthWithdrawn")
                      .withArgs(founder.address, amount)
              })
              it("transfers eth from account to founder", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  const amount = await account.releasableEth(founder.address)
                  const accountBalanceBefore = await account.provider.getBalance(account.address)
                  const founderBalanceBefore = await founder.getBalance()
                  const txResponse = await account.withdrawEth()
                  const transactionReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const accountBalanceAfter = await account.provider.getBalance(account.address)
                  const founderBalanceAfter = await founder.getBalance()
                  await expect(accountBalanceAfter.add(amount)).to.be.equal(accountBalanceBefore)
                  await expect(founderBalanceAfter.add(gasCost)).to.be.equal(
                      founderBalanceBefore.add(amount)
                  )
              })
              it("updates released balance after founder withdrawing eth", async () => {
                  await outsider.sendTransaction({ to: account.address, value: ETH_AMOUNT })
                  const amount = await account.releasableEth(founder.address)
                  await account.withdrawEth()

                  // check released balance
                  await expect(await account.getTotalReleasedEth()).to.be.equal(amount)
                  await expect(await account.getAddressToReleasedEth(founder.address)).to.be.equal(
                      amount
                  )
              })
              it("emits event after member withdrawing eth", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = account.connect(member)
                  const amount = await account.releasableEth(member.address)
                  await expect(account.withdrawEth())
                      .to.emit(account, "EthWithdrawn")
                      .withArgs(member.address, amount)
              })
              it("transfers eth from account to member", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = await account.connect(member)
                  const amount = await account.releasableEth(member.address)
                  const accountBalanceBefore = await account.provider.getBalance(account.address)
                  const memberBalanceBefore = await member.getBalance()
                  const txResponse = await account.withdrawEth()
                  const transactionReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const accountBalanceAfter = await account.provider.getBalance(account.address)
                  const memberBalanceAfter = await member.getBalance()
                  await expect(accountBalanceAfter.add(amount)).to.be.equal(accountBalanceBefore)
                  await expect(memberBalanceAfter.add(gasCost)).to.be.equal(
                      memberBalanceBefore.add(amount)
                  )
              })
              it("updates released balance after member withdrawing eth", async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  account = await account.connect(member)
                  const amount = await account.releasableEth(member.address)
                  await account.withdrawEth()

                  // check released balance
                  await expect(await account.getTotalReleasedEth()).to.be.equal(amount)
                  await expect(await account.getAddressToReleasedEth(member.address)).to.be.equal(
                      amount
                  )
              })
              it("reverts eth withdrawal if paused", async () => {
                  await account.pause()
                  await expect(account.withdrawEth()).to.be.revertedWith("Pausable: paused")
              })
              it("reverts if eth amount is 0 or less", async () => {
                  await expect(account.withdrawEth()).to.be.revertedWithCustomError(
                      account,
                      "Account__NotDuePayment"
                  )
              })
              it("remains zero eth after withdrawing all", async () => {
                  await account.pay({ value: ETH_AMOUNT })

                  // admin withdrawal
                  account = account.connect(admin)
                  await account.withdrawEth()

                  // founder withdrawal
                  account = account.connect(founder)
                  await account.withdrawEth()

                  // member withdrawal
                  account = account.connect(member)
                  await account.withdrawEth()

                  console.log(await account.provider.getBalance(account.address))
                  await expect(
                      (await account.provider.getBalance(account.address)).toString()
                  ).to.be.equal("0")
              })
          })
          describe("withdrawToken", () => {
              it("exclusively allows those authorized to withdraw token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = account.connect(outsider)
                  await expect(account.withdrawToken(usdc.address)).to.be.revertedWithCustomError(
                      account,
                      "Account__NotAuthorized"
                  )
              })
              it("emits event after admin withdrawing token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = await account.connect(admin)
                  const amount = await account.releasableToken(usdc.address, admin.address)
                  await expect(account.withdrawToken(usdc.address))
                      .to.emit(account, "TokenWithdrawn")
                      .withArgs(usdc.address, admin.address, amount)
              })
              it("transfers usdc from account to admin", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = await account.connect(admin)
                  const amount = await account.releasableToken(usdc.address, admin.address)
                  const accountBalanceBefore = await usdc.balanceOf(account.address)
                  const adminBalanceBefore = await usdc.balanceOf(admin.address)
                  await account.withdrawToken(usdc.address)
                  const accountBalanceAfter = await usdc.balanceOf(account.address)
                  const adminBalanceAfter = await usdc.balanceOf(admin.address)
                  await expect(accountBalanceAfter.add(amount)).to.be.equal(accountBalanceBefore)
                  await expect(adminBalanceAfter).to.be.equal(adminBalanceBefore.add(amount))
              })
              it("updates released balance after admin withdrawing token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = await account.connect(admin)
                  const amount = await account.releasableToken(usdc.address, admin.address)
                  await account.withdrawToken(usdc.address)

                  // check released balance
                  await expect(await account.getTotalReleasedToken(usdc.address)).to.be.equal(
                      amount
                  )
                  await expect(
                      await account.getAddressToReleasedToken(usdc.address, admin.address)
                  ).to.be.equal(amount)
              })
              it("emits event after founder withdrawing token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  const amount = await account.releasableToken(usdc.address, founder.address)
                  await expect(account.withdrawToken(usdc.address))
                      .to.emit(account, "TokenWithdrawn")
                      .withArgs(usdc.address, founder.address, amount)
              })
              it("transfers usdc from account to founder", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  const amount = await account.releasableToken(usdc.address, founder.address)
                  const accountBalanceBefore = await usdc.balanceOf(account.address)
                  const founderBalanceBefore = await usdc.balanceOf(founder.address)
                  await account.withdrawToken(usdc.address)
                  const accountBalanceAfter = await usdc.balanceOf(account.address)
                  const founderBalanceAfter = await usdc.balanceOf(founder.address)
                  await expect(accountBalanceAfter.add(amount)).to.be.equal(accountBalanceBefore)
                  await expect(founderBalanceAfter).to.be.equal(founderBalanceBefore.add(amount))
              })
              it("updates released balance after founder withdrawing token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  const amount = await account.releasableToken(usdc.address, founder.address)
                  await account.withdrawToken(usdc.address)

                  // check released balance
                  await expect(await account.getTotalReleasedToken(usdc.address)).to.be.equal(
                      amount
                  )
                  await expect(
                      await account.getAddressToReleasedToken(usdc.address, founder.address)
                  ).to.be.equal(amount)
              })
              it("emits event after member withdrawing token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = account.connect(member)
                  const amount = await account.releasableToken(usdc.address, member.address)
                  await expect(account.withdrawToken(usdc.address))
                      .to.emit(account, "TokenWithdrawn")
                      .withArgs(usdc.address, member.address, amount)
              })
              it("transfers usdc from account to member", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = account.connect(member)
                  const amount = await account.releasableToken(usdc.address, member.address)
                  const accountBalanceBefore = await usdc.balanceOf(account.address)
                  const memberBalanceBefore = await usdc.balanceOf(member.address)
                  await account.withdrawToken(usdc.address)
                  const accountBalanceAfter = await usdc.balanceOf(account.address)
                  const memberBalanceAfter = await usdc.balanceOf(member.address)
                  await expect(accountBalanceAfter.add(amount)).to.be.equal(accountBalanceBefore)
                  await expect(memberBalanceAfter).to.be.equal(memberBalanceBefore.add(amount))
              })
              it("updates released balance after member withdrawing token", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)
                  account = account.connect(member)
                  const amount = await account.releasableToken(usdc.address, member.address)
                  await account.withdrawToken(usdc.address)

                  // check released balance
                  await expect(await account.getTotalReleasedToken(usdc.address)).to.be.equal(
                      amount
                  )
                  await expect(
                      await account.getAddressToReleasedToken(usdc.address, member.address)
                  ).to.be.equal(amount)
              })
              it("reverts token withdrawal if paused", async () => {
                  await account.pause()
                  await expect(account.withdrawToken(usdc.address)).to.be.revertedWith(
                      "Pausable: paused"
                  )
              })
              it("reverts if token amount is 0 or less", async () => {
                  await expect(account.withdrawToken(usdc.address)).to.be.revertedWithCustomError(
                      account,
                      "Account__NotDuePayment"
                  )
              })
              it("remains zero token after withdrawing all", async () => {
                  usdc.transfer(account.address, USDC_AMOUNT)

                  // admin withdrawal
                  account = account.connect(admin)
                  await account.withdrawToken(usdc.address)

                  // founder withdrawal
                  account = account.connect(founder)
                  await account.withdrawToken(usdc.address)

                  // member withdrawal
                  account = account.connect(member)
                  await account.withdrawToken(usdc.address)

                  console.log(await usdc.balanceOf(account.address))
                  await expect((await usdc.balanceOf(account.address)).toString()).to.be.equal("0")
              })
          })
          describe("releasableEth", () => {
              beforeEach(async () => {
                  await account.pay({ value: ETH_AMOUNT })
                  await account.setFounderGainPercentage(NEW_FOUNDER_GAIN_PERCENTAGE)
              })
              it("calculates releasable eth of admin", async () => {
                  const adminShare = (await account.provider.getBalance(account.address))
                      .mul(await account.getAdminGainPercentage())
                      .div(BigNumber.from(100))
                  console.log(adminShare)
                  console.log(await account.provider.getBalance(account.address))
                  await expect((await account.releasableEth(admin.address)).toString()).to.be.equal(
                      adminShare.toString()
                  )
              })
              it("calculates releasable eth of founder", async () => {
                  const founderShare = (await account.provider.getBalance(account.address))
                      .mul(await account.getFounderGainPercentage())
                      .div(BigNumber.from(100))
                  console.log(founderShare)
                  console.log(await account.provider.getBalance(account.address))
                  await expect(
                      (await account.releasableEth(founder.address)).toString()
                  ).to.be.equal(founderShare.toString())
              })
              it("calculates releasable eth of member", async () => {
                  const memberShare = (await account.provider.getBalance(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(member.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(memberShare)
                  console.log(await account.provider.getBalance(account.address))
                  await expect(
                      (await account.releasableEth(member.address)).toString()
                  ).to.be.equal(memberShare.toString())
              })
              it("calculates releasable eth when withdrawer is founder and member", async () => {
                  await securities.mint(TOKEN_AMOUNT, founder.address)
                  const founderShare = (await account.provider.getBalance(account.address))
                      .mul(await account.getFounderGainPercentage())
                      .div(BigNumber.from(100))
                  const memberShare = (await account.provider.getBalance(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(founder.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(founderShare.add(memberShare))
                  console.log(await account.provider.getBalance(account.address))
                  await expect(
                      (await account.releasableEth(founder.address)).toString()
                  ).to.be.equal(founderShare.add(memberShare).toString())
              })
              it("calculates releasable eth when withdrawer is admin and member", async () => {
                  await securities.mint(TOKEN_AMOUNT, admin.address)
                  const adminShare = (await account.provider.getBalance(account.address))
                      .mul(await account.getAdminGainPercentage())
                      .div(BigNumber.from(100))
                  const memberShare = (await account.provider.getBalance(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(admin.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(adminShare.add(memberShare))
                  console.log(await account.provider.getBalance(account.address))
                  await expect((await account.releasableEth(admin.address)).toString()).to.be.equal(
                      adminShare.add(memberShare).toString()
                  )
              })
              it("calculates releasable eth when withdrawer is admin, founder and member", async () => {
                  await securities.mint(TOKEN_AMOUNT, admin.address)
                  await account.transferOwnership(admin.address)
                  const adminShare = (await account.provider.getBalance(account.address))
                      .mul(await account.getAdminGainPercentage())
                      .div(BigNumber.from(100))
                  const founderShare = (await account.provider.getBalance(account.address))
                      .mul(await account.getFounderGainPercentage())
                      .div(BigNumber.from(100))
                  const memberShare = (await account.provider.getBalance(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(admin.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(adminShare.add(founderShare).add(memberShare))
                  console.log(await account.provider.getBalance(account.address))
                  await expect((await account.releasableEth(admin.address)).toString()).to.be.equal(
                      adminShare.add(founderShare).add(memberShare).toString()
                  )
              })
          })
          describe("releasableToken", () => {
              beforeEach(async () => {
                  await usdc.transfer(account.address, USDC_AMOUNT)
                  await account.setFounderGainPercentage(NEW_FOUNDER_GAIN_PERCENTAGE)
              })
              it("calculates releasable token of admin", async () => {
                  const adminShare = (await usdc.balanceOf(account.address))
                      .mul(await account.getAdminGainPercentage())
                      .div(BigNumber.from(100))
                  console.log(adminShare)
                  await expect(
                      (await account.releasableToken(usdc.address, admin.address)).toString()
                  ).to.be.equal(adminShare.toString())
              })
              it("calculates releasable token of founder", async () => {
                  const founderShare = (await usdc.balanceOf(account.address))
                      .mul(await account.getFounderGainPercentage())
                      .div(BigNumber.from(100))
                  console.log(founderShare)
                  await expect(
                      (await account.releasableToken(usdc.address, founder.address)).toString()
                  ).to.be.equal(founderShare.toString())
              })
              it("calculates releasable token of member", async () => {
                  const memberShare = (await usdc.balanceOf(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(member.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(memberShare)
                  await expect(
                      (await account.releasableToken(usdc.address, member.address)).toString()
                  ).to.be.equal(memberShare.toString())
              })
              it("calculates releasable token when withdrawer is founder and member", async () => {
                  await securities.mint(TOKEN_AMOUNT, founder.address)
                  const founderShare = (await usdc.balanceOf(account.address))
                      .mul(await account.getFounderGainPercentage())
                      .div(BigNumber.from(100))
                  const memberShare = (await usdc.balanceOf(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(founder.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(founderShare.add(memberShare))
                  await expect(
                      (await account.releasableToken(usdc.address, founder.address)).toString()
                  ).to.be.equal(founderShare.add(memberShare).toString())
              })
              it("calculates releasable token when withdrawer is admin and member", async () => {
                  await securities.mint(TOKEN_AMOUNT, admin.address)
                  const adminShare = (await usdc.balanceOf(account.address))
                      .mul(await account.getAdminGainPercentage())
                      .div(BigNumber.from(100))
                  const memberShare = (await usdc.balanceOf(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(admin.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(adminShare.add(memberShare))
                  await expect(
                      (await account.releasableToken(usdc.address, admin.address)).toString()
                  ).to.be.equal(adminShare.add(memberShare).toString())
              })
              it("calculates releasable token when withdrawer is admin, founder and member", async () => {
                  await securities.mint(TOKEN_AMOUNT, admin.address)
                  await account.transferOwnership(admin.address)
                  const adminShare = (await usdc.balanceOf(account.address))
                      .mul(await account.getAdminGainPercentage())
                      .div(BigNumber.from(100))
                  const founderShare = (await usdc.balanceOf(account.address))
                      .mul(await account.getFounderGainPercentage())
                      .div(BigNumber.from(100))
                  const memberShare = (await usdc.balanceOf(account.address))
                      .mul(
                          BigNumber.from(100 - 1)
                              .sub(await account.getFounderGainPercentage())
                              .mul(await securities.balanceOfHolder(admin.address))
                      )
                      .div((await securities.balanceOfAll()).mul(BigNumber.from(100)))
                  console.log(adminShare.add(founderShare).add(memberShare))
                  await expect(
                      (await account.releasableToken(usdc.address, admin.address)).toString()
                  ).to.be.equal(adminShare.add(founderShare).add(memberShare).toString())
              })
          })
          describe("setFounderGainPercentage", () => {
              it("emits event after setting newff founder gain percentage", async () => {
                    await expect(account.setFounderGainPercentage(NEW_FOUNDER_GAIN_PERCENTAGE))
                        .to.emit(account, "FounderGainPercentageSet")
                        .withArgs(NEW_FOUNDER_GAIN_PERCENTAGE)
              })
              it("exclusively allows founder to set founder gain percentage", async () => {
                  account = account.connect(member)
                  await expect(
                      account.setFounderGainPercentage(NEW_FOUNDER_GAIN_PERCENTAGE)
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
              it("reverts set founder gain percentage if paused", async () => {
                  await account.pause()
                  await expect(
                      account.setFounderGainPercentage(NEW_FOUNDER_GAIN_PERCENTAGE)
                  ).to.be.revertedWith("Pausable: paused")
              })
              it("reverts is founder gain percentage is greater than 99", async () => {
                  await expect(account.setFounderGainPercentage(100)).to.be.revertedWithCustomError(
                      account,
                      "Account__PercentageMustBeBetween0To99"
                  )
              })
          })
      })
