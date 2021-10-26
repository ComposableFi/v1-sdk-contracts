import { TOKEN_PRICE_FEEDS } from "../../scripts/deployment/oracleAdapters/priceFeeds";

const { expect } = require("chai");
const { ethers } = require("hardhat");
import { before } from "mocha";
import { Contract } from "ethers";
import { getProviderOrWallet } from "../../networks";

if (process.env.MODE == "LIVE") {
  describe("Chainlink Adapter Mainnet", function() {
    let chainlinkAdapterPolygon: Contract;
    let chainlinkAdapterArbitrum: Contract;
    let chainlinkAdapterEthereum: Contract;

    const ETH_MAINNET_ADDRESS = "0xCE43D1DddDB80C4189672d91eDD8c023F89a7B24";
    const POLYGON_MAINNET_ADDRESS = "0xae5f4C97842596Ccaf29F2839037022678Bbb6eA";
    const ARBITRUM_MAINNET_ADDRESS = "0xae5f4C97842596Ccaf29F2839037022678Bbb6eA";

    const ETH_TOKEN_PRICE_FEEDS = TOKEN_PRICE_FEEDS["1"];
    const POLYGON_TOKEN_PRICE_FEEDS = TOKEN_PRICE_FEEDS["137"];
    const ARBITRUM_TOKEN_PRICE_FEEDS = TOKEN_PRICE_FEEDS["42161"];

    before(async function() {
      chainlinkAdapterEthereum = await ethers.getContractAt(
        "ChainlinkAdapter",
        ETH_MAINNET_ADDRESS,
        (await getProviderOrWallet("mainnet")).wallet
      );

      chainlinkAdapterPolygon = await ethers.getContractAt(
        "ChainlinkAdapter",
        POLYGON_MAINNET_ADDRESS,
        (await getProviderOrWallet("matic")).wallet
      );

      chainlinkAdapterArbitrum = await ethers.getContractAt(
        "ChainlinkAdapter",
        ARBITRUM_MAINNET_ADDRESS,
        (await getProviderOrWallet("arbitrum_mainnet")).wallet
      );
    });

    describe("Ethereum mainnet oracle adapter test", function() {
      for (const tokenPriceFeed of ETH_TOKEN_PRICE_FEEDS) {
        it(`get the token price of ${tokenPriceFeed.symbol}`, async function() {
          expect(
            (await chainlinkAdapterEthereum.getTokenPrice(tokenPriceFeed.token)).toNumber()
          ).to.be.greaterThan(0);
        }).timeout(50000);
      }

      it("should revert when it tries to get token price for an unsupported token", async function() {
        const UNSUPPORTED_TOKEN_ADDRESS = "0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94";
        await expect(chainlinkAdapterEthereum.getTokenPrice(UNSUPPORTED_TOKEN_ADDRESS))
          .to.be.revertedWith("UNSUPPORTED_TOKEN_ADDRESS");
      });
    });

    describe("Polygon mainnet oracle adapter test", function() {
      for (const tokenPriceFeed of POLYGON_TOKEN_PRICE_FEEDS) {
        it(`get the token price of ${tokenPriceFeed.symbol}`, async function() {
          expect(
            (await chainlinkAdapterPolygon.getTokenPrice(tokenPriceFeed.token)).toNumber()
          ).to.be.greaterThan(0);
        }).timeout(50000);
      }

      it("should revert when it tries to get token price for an unsupported token", async function() {
        const UNSUPPORTED_TOKEN_ADDRESS = "0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94";
        await expect(chainlinkAdapterEthereum.getTokenPrice(UNSUPPORTED_TOKEN_ADDRESS))
          .to.be.revertedWith("UNSUPPORTED_TOKEN_ADDRESS");
      });
    });

    describe("Arbitrum mainnet oracle adapter test", function() {
      for (const tokenPriceFeed of ARBITRUM_TOKEN_PRICE_FEEDS) {
        it(`get the token price of ${tokenPriceFeed.symbol}`, async function() {
          expect(
            (await chainlinkAdapterArbitrum.getTokenPrice(tokenPriceFeed.token)).toNumber()
          ).to.be.greaterThan(0);
        }).timeout(50000);
      }

      it("should revert when it tries to get token price for an unsupported token", async function() {
        const UNSUPPORTED_TOKEN_ADDRESS = "0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94";
        await expect(chainlinkAdapterEthereum.getTokenPrice(UNSUPPORTED_TOKEN_ADDRESS))
          .to.be.revertedWith("UNSUPPORTED_TOKEN_ADDRESS");
      });
    });
  });
}

//2 parameters: - address and amount
//hardcode some form of funding is required to run the tests