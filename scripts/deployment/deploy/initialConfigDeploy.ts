/* global ethers */
/* eslint prefer-const: "off" */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkObjFromId } from "../../../networks";
import {
  getSelectors,
  DModulesAction,
} from "../config/libraries/proxyModules.js";

/*const contractName = getContractNameFromScriptFileName(
  path.basename(__filename)
);*/

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  //const { deployments, getNamedAccounts, ethers } = hre;

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

  const actionsDeployTx = await deploy("DModulesActions", {
    from: deployer,
    log: true,
  });

  log("DModulesActions deployed:", actionsDeployTx.address);

  // deploy DProxyModules
  const proxyDeployTx = await deploy("ProtocolConfigProxy", {
    from: deployer,
    args: [deployer, actionsDeployTx.address],
    log: true,
  });
  log("ProtocolConfigProxy deployed:", proxyDeployTx.address);

  const modulesInitDeployTx = await deploy("DProxyModulesInit", {
    from: deployer,
    log: true,
  });
  log("DProxyModulesInit deployed:", modulesInitDeployTx.address);
  const dProxyModulesInit = await ethers.getContractAt(
    "DProxyModulesInit",
    modulesInitDeployTx.address
  );

  // deploy core modules
  log("");
  log("Deploying core modules");
  const ModuleNames = [
    "DProxyModulesFuncSelectors",
    "OwnershipModule",
    "ExchangesConfigModule",
    "NetworksConfigModule",
  ];
  const modulesActions = [];
  let modulesDeployTx;
  let module; //deployed contract
  for (const ModuleName of ModuleNames) {
    modulesDeployTx = await deploy(ModuleName, {
      from: deployer,
      args: [],
      log: true,
    });
    module = await ethers.getContractAt(ModuleName, modulesDeployTx.address);
    log(`${ModuleName} deployed: ${modulesDeployTx.address}`);
    modulesActions.push({
      moduleAddress: modulesDeployTx.address,
      action: DModulesAction.Add,
      functionSelectors: getSelectors(module),
    });
  }

  const iDModulesActions = await ethers.getContractAt(
    "IDModulesActions",
    proxyDeployTx.address
  );

  let receipt;
  // call to init function
  let functionCall = dProxyModulesInit.interface.encodeFunctionData("init");
  const tx = await iDModulesActions.runModuleFuncSelectorsAction(
    modulesActions,
    dProxyModulesInit.address,
    functionCall
  );
  //console.log("DProxyModules modulesActions tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`DProxyModules upgrade failed: ${tx.hash}`);
  }
  console.log("Completed deployment dProxyModules modulesActions");
};
export default func;
func.tags = ["deploy_composable_config"];
//func.dependencies = ["PerpetualManagerProxy"];
//to initialize run
// hh deploy--deploy - scripts./ scripts / deployment / init--network matic_mumbai
