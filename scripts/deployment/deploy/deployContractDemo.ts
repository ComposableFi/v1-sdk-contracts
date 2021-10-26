/* global ethers */
/* eslint prefer-const: "off" */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, log },
    getNamedAccounts,
    ethers,
    getChainId,
    network,
  } = hre;
  const chainId = parseInt(await getChainId());
  log("Starting deployment to network name: ", network.name, "id: ", chainId);
  const { deployer } = await getNamedAccounts();

  const contractDemoTx = await deploy("ContractDemo", {
    from: deployer,
    log: true,
  });

  log("ContractsDemo deployed:", contractDemoTx.address);
};

export default func;
func.tags = ["deploy_contract_demo"];
