import { before } from "mocha";
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { getProviderOrWallet, ProviderOrWallet } from "../../../networks";
import { BigNumber, Contract } from "ethers";

describe("Operations", function() {
  let providerOrWallet: ProviderOrWallet;
  let operationsMock: Contract;
  let contractAddress: string;
  const token = "0xA785B32Da0d3126DBb9FB929E46b7EE3b4AFe372"//"0x065270Fe2319B9E23d2894009542485EbDF125dA";

  before(async function () {
    this.timeout(30000);
    providerOrWallet = await getProviderOrWallet("matic_mumbai");
    const OperationsMock = (await ethers.getContractFactory("OperationsMock")).connect(providerOrWallet.wallet);
    operationsMock = await OperationsMock.deploy({gasLimit: 1000000});
    await operationsMock.deployed();
    contractAddress = operationsMock.address;

    const erc20 = await ethers.getContractAt(
      "SampleTokenERC20",
      token,
      providerOrWallet.wallet
    );
    await erc20.transfer(contractAddress, 10000, {gasLimit: 1000000});
    console.log('contract: ', operationsMock.address);
  });

  it("should emit AddressApproved after a successful approval", async function() {
    const value = 1000;
    const to = "0xaaaa701efea3AC6B184628eD104F827014641592"
    await expect(operationsMock.safeApprove(token, to, value, {gasLimit: 1000000}))
      .to.emit(operationsMock, "AddressApproved")
      .withArgs(to, value);
  }).timeout(50000);

  it("should emit TokenTransfered after a successful token transfer", async function() {
    const value = 100;
    const to = "0xaaaa701efea3AC6B184628eD104F827014641592"
    await expect(operationsMock.safeTransfer(token, to, value, {gasLimit: 1000000}))
      .to.emit(operationsMock, "TokenTransfered")
      .withArgs(to, value);
  }).timeout(50000);

  //TODO: Fix issue with this test
  // it("should emit TokenTransferedFrom after a successful token transfer", async function() {
  //   const value = 100;
  //   const to = "0xaaaa701efea3AC6B184628eD104F827014641592";
  //   const from = "0xaaaa701efea3AC6B184628eD104F827014641592";
  //   await expect(operationsMock.safeTransferFrom(token, from, to, value))
  //     .to.emit(operationsMock, "TokenTransferedFrom")
  //     .withArgs(from, to, value);
  // });

  it("should emit ETHTransfered after a successful ETH transfer", async function() {
    const tx = {
      from: providerOrWallet.wallet.address,
      chainId: 80001,
      gasLimit: BigNumber.from(20000000),
      to: operationsMock.address,
      value: ethers.utils.parseEther("0.0001")
    };
    await providerOrWallet.wallet.sendTransaction(tx);

    const value = ethers.utils.parseEther("0.00001");
    await expect(operationsMock.safeTransferETH(providerOrWallet.wallet.address, value, {gasLimit: 20000000}))
      .to.emit(operationsMock, "ETHTransfered")
      .withArgs(providerOrWallet.wallet.address, value);
  }).timeout(50000);
})