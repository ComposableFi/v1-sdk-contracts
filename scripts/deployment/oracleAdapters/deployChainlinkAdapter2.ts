const { run, ethers } = require("hardhat");
import { getProviderOrWallet } from "../../../networks";
import { TOKEN_PRICE_FEEDS } from "./priceFeeds";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployChainlinkAdapter: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const {
    deployments: { deploy, log },
    getNamedAccounts,
    ethers,
  } = hre;

  let chainId = (await ethers.provider.getNetwork()).chainId;
  log("chainId =", chainId);
  console.log("Starting deployment to", chainId, "network");
  const providerOrWallet = await getProviderOrWallet(chainId);

  /*const ChainlinkAdapter = await ethers.getContractFactory("ChainlinkAdapter");
  const chainlinkAdapter = await ChainlinkAdapter.deploy();
  await chainlinkAdapter.deployed();*/

  const { deployer } = await getNamedAccounts();

  const accounts = await ethers.getSigners();

  const deployTx = await deploy("ChainlinkAdapter", {
    from: deployer,
    log: true,
  });

  const chainlinkAdapter = await ethers.getContractAt(
    "ChainlinkAdapter",
    deployTx.address
  );
  console.log(
    `chainlink adapter address on ${chainId}`,
    chainlinkAdapter.address
  );

  // @ts-ignore
  if (TOKEN_PRICE_FEEDS[chainId]) {
    // @ts-ignore
    const tokenPriceFeeds = TOKEN_PRICE_FEEDS[chainId];
    for (const tokenPriceFeed of tokenPriceFeeds) {
      console.log(
        "adding token: ",
        tokenPriceFeed.token,
        ", pricefeed: ",
        tokenPriceFeed.priceFeed
      );
      const transaction = await chainlinkAdapter.addTokenPriceAggregator(
        tokenPriceFeed.token,
        tokenPriceFeed.priceFeed
      );
      //await transaction.wait();
    }
  }
  log("Chainlink adapter deployed on networkId ", chainId);
};
export default deployChainlinkAdapter;
deployChainlinkAdapter.tags = ["deploy_chainlink_adapter_2"];
/*deployChainlinkAdapter.skip = function (HardhatRuntimeEnvironment: {
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
};*/
