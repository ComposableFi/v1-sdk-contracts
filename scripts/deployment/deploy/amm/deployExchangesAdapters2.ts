import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getExchangeAddress } from "./deploymentConfig";
require("dotenv").config();

//const sushiswapRouterAddress = process.env.SUSHISWAP_ROUTER_ADDRESS;

const deployExchangesAdapter: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const {
    deployments: { deploy, log },
    getNamedAccounts,
    ethers,
  } = hre;

  let chainId = (await ethers.provider.getNetwork()).chainId;
  log("chainId =", chainId);
  const sushiswapRouterAddress = getExchangeAddress(chainId);

  if (sushiswapRouterAddress === undefined) {
    //throw `Please provide sushiswapRouterAddress in the .env file`;
    throw `Please provide sushiswapRouterAddress in the deploymentConfig file`;
  }
  console.log("Starting Sushiswap adapter deployment to", chainId, "network");

  const { deployer } = await getNamedAccounts();

  const contractName = "SushiswapAdapter";
  const deployTx = await deploy(contractName, {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: { methodName: "initialize", args: [sushiswapRouterAddress] },
      },
    },
  });

  console.log(contractName, "proxy address:", deployTx.address);

  log("SushiswapAdapter deployed on networkId ", chainId);
};
export default deployExchangesAdapter;
deployExchangesAdapter.tags = ["deploy_exchanges_adapters_2"];
