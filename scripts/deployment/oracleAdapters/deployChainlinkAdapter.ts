const { run, ethers } = require("hardhat");
import { getProviderOrWallet } from "../../../networks";
import { TOKEN_PRICE_FEEDS } from "./priceFeeds";

// @ts-ignore
module.exports = async ({ network }) => {
  console.log("Starting deployment to", network.name, "network");

  const chainId = network.config.network_id;
  const providerOrWallet = await getProviderOrWallet(chainId);

  const ChainlinkAdapter = await ethers.getContractFactory("ChainlinkAdapter");
  const chainlinkAdapter = await ChainlinkAdapter.deploy();
  await chainlinkAdapter.deployed();

  console.log(
    `chainlink adapter address on ${network.name}`,
    chainlinkAdapter.address
  );

  // @ts-ignore
  if (TOKEN_PRICE_FEEDS[chainId]) {
    // @ts-ignore
    const tokenPriceFeeds = TOKEN_PRICE_FEEDS[chainId];
    for (const tokenPriceFeed of tokenPriceFeeds) {
      const transaction = await chainlinkAdapter.addTokenPriceAggregator(
        tokenPriceFeed.token,
        tokenPriceFeed.priceFeed,
        { gasPrice: 1000000000 }
      );
      await transaction.wait();
    }
  }

  /*await run("verify:verify", {
    address: chainlinkAdapter.address,
    constructorArguments: [],
    contract:
      "contracts/cross-layer/oracles/adapters/ChainlinkAdapter.sol:ChainlinkAdapter",
  });*/
};

module.exports.tags = ["deploy_chainlink_adapter"];
module.exports.skip = function (HardhatRuntimeEnvironment: {
  network: { name: any; live: any };
}) {
  // This deployment script is only for live network to connect to L2, so skipping it for localhost and hardhat networks
  console.log(
    HardhatRuntimeEnvironment.network.name,
    "is",
    HardhatRuntimeEnvironment.network.live ? "a" : "not",
    "live network"
  );
  return !HardhatRuntimeEnvironment.network.live;
};
