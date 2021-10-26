import { TOKEN_PRICE_FEEDS } from "../../../scripts/deployment/oracleAdapters/priceFeeds";

const { expect } = require("chai");
const { ethers } = require("hardhat");
import { before } from "mocha";
import { Contract } from "ethers";
import { getProviderOrWallet, ProviderOrWallet } from "../../../networks";

describe("Chainlink Adapter Polygon", function() {
  let chainlinkAdapter: Contract;
  let providerOrWallet: ProviderOrWallet;
  const chainlinkAdapterAddress = "0x4a99B5427fEA6bD4343E8Cee69bA77F6B19EfC54";

  before(async function() {
    providerOrWallet = await getProviderOrWallet("matic_mumbai");
    chainlinkAdapter = await ethers.getContractAt(
      "ChainlinkAdapter",
      chainlinkAdapterAddress,
      providerOrWallet.wallet
    );
  });

  it("emit an event when a new token adapter is added on Polygon", async function() {
    const MATIC_MUMBAI_USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    const CHAINLINK_USDC_AGGREGATOR = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
    await expect(chainlinkAdapter.addTokenPriceAggregator(MATIC_MUMBAI_USDC, CHAINLINK_USDC_AGGREGATOR, { gasLimit: 1000000 }))
      .to.emit(chainlinkAdapter, "AddedTokenPriceAggregator")
      .withArgs(MATIC_MUMBAI_USDC, CHAINLINK_USDC_AGGREGATOR);
  }).timeout(50000);

  it("should revert when token address is zero", async function() {
    const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000";
    const CHAINLINK_USDC_AGGREGATOR = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
    const transaction = await chainlinkAdapter.addTokenPriceAggregator(INVALID_ADDRESS, CHAINLINK_USDC_AGGREGATOR, { gasLimit: 1000000 });
    try {
      await transaction.wait();
    } catch (error) {
      // @ts-ignore
      expect(error.code).to.equal("CALL_EXCEPTION");
    }
  }).timeout(50000);

  it("should revert when aggregator address is zero", async function() {
    const MATIC_MUMBAI_USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    const INVALID_AGGREGATOR = "0x0000000000000000000000000000000000000000";
    const transaction = await chainlinkAdapter.addTokenPriceAggregator(MATIC_MUMBAI_USDC, INVALID_AGGREGATOR, { gasLimit: 1000000 });
    try {
      await transaction.wait();
    } catch (error) {
      // @ts-ignore
      expect(error.code).to.equal("CALL_EXCEPTION");
    }
  }).timeout(50000);

  it("get the token price of a supported token", async function() {
    const MATIC_MUMBAI_USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    expect(
      (await chainlinkAdapter.getTokenPrice(MATIC_MUMBAI_USDC)).toNumber()
    ).to.be.greaterThan(0);
  }).timeout(50000);

  it("should revert when it tries to get token price for an unsupported token", async function() {
    const UNSUPPORTED_TOKEN_ADDRESS = "0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94";
    await expect(chainlinkAdapter.getTokenPrice(UNSUPPORTED_TOKEN_ADDRESS))
      .to.be.revertedWith("UNSUPPORTED_TOKEN_ADDRESS");
  })
});

//TODO: Arbitrum contract not emitting event. Why?
describe("Chainlink Adapter Arbitrum", function() {
  let chainlinkAdapter: Contract;
  let providerOrWallet: ProviderOrWallet;
  const chainlinkAdapterAddress = "0xfbce4aacc4b9bdcda01177ec9f358c6267ca3ade";

  before(async function() {
    providerOrWallet = await getProviderOrWallet("arbitrum_testnet");
    chainlinkAdapter = await ethers.getContractAt(
      "ChainlinkAdapter",
      chainlinkAdapterAddress,
      providerOrWallet.wallet
    );
  });

  it("emit an event when a new token adapter is added on Arbitrum", async function() {
    const ARB_RINKEBY_USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    const CHAINLINK_USDC_AGGREGATOR = "0xe020609A0C31f4F96dCBB8DF9882218952dD95c4";
    await expect(chainlinkAdapter.addTokenPriceAggregator(ARB_RINKEBY_USDC, CHAINLINK_USDC_AGGREGATOR, { gasLimit: 1000000 }))
      .to.emit(chainlinkAdapter, "AddedTokenPriceAggregator")
      .withArgs(ARB_RINKEBY_USDC, CHAINLINK_USDC_AGGREGATOR);
  }).timeout(500000);

  it("should revert when token address is zero", async function() {
    const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000";
    const CHAINLINK_USDC_AGGREGATOR = "0xe020609A0C31f4F96dCBB8DF9882218952dD95c4";
    const transaction = await chainlinkAdapter.addTokenPriceAggregator(INVALID_ADDRESS, CHAINLINK_USDC_AGGREGATOR, { gasLimit: 1000000 });
    try {
      await transaction.wait();
    } catch (error) {
      // @ts-ignore
      expect(error.code).to.equal("CALL_EXCEPTION");
    }
  }).timeout(50000);

  it("should revert when aggregator address is zero", async function() {
    const ARB_RINKEBY_USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    const INVALID_AGGREGATOR = "0x0000000000000000000000000000000000000000";
    const transaction = await chainlinkAdapter.addTokenPriceAggregator(ARB_RINKEBY_USDC, INVALID_AGGREGATOR, { gasLimit: 1000000 });
    try {
      await transaction.wait();
    } catch (error) {
      // @ts-ignore
      expect(error.code).to.equal("CALL_EXCEPTION");
    }
  }).timeout(50000);

  it("get the token price of a supported token", async function() {
    const ARB_RINKEBY_USDC = "0xBD2094e633296909DDc7954Cf2f29e2f508112a2";
    expect(
      (await chainlinkAdapter.getTokenPrice(ARB_RINKEBY_USDC)).toNumber()
    ).to.be.greaterThan(0);
  }).timeout(50000);

  it("should revert when it tries to get token price for an unsupported token", async function() {
    const UNSUPPORTED_TOKEN_ADDRESS = "0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94";
    await expect(chainlinkAdapter.getTokenPrice(UNSUPPORTED_TOKEN_ADDRESS))
      .to.be.revertedWith("UNSUPPORTED_TOKEN_ADDRESS");
  })
});

//2 parameters: - address and amount