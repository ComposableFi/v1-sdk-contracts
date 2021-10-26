import { before } from "mocha";
import { Contract } from "ethers";
const { ethers } = require("hardhat");
const { expect } = require("chai");
import { getProviderOrWallet, ProviderOrWallet } from "../../networks";

describe("Oracle tests from local libraries", function() {
  let providerOrWallet: ProviderOrWallet;
  let contractDemo: Contract;

  before(async function () {
    providerOrWallet = await getProviderOrWallet("matic_mumbai");
    const ContractDemo = (await ethers.getContractFactory("ContractDemo")).connect(providerOrWallet.wallet);
    contractDemo = await ContractDemo.deploy();
    await contractDemo.deployed();
  });

  it("should deposit token liquidity into a pool", async () => {
    const USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    const tokenPrice = await contractDemo.getTokenPrice(USDC);
    expect(tokenPrice).to.not.be.null;
  }).timeout(50000);
}).timeout(50000);