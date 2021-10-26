/* global ethers */
/* eslint prefer-const: "off" */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkObjFromId } from "../../../networks";
import {
  getSelectors,
  DModulesAction,
  removeSelectors,
  findAddressPositionInModules,
} from "../config/libraries/proxyModules.js";

import { ExchangesConfigModule } from "../../../types";

/*const contractName = getContractNameFromScriptFileName(
  path.basename(__filename)
);*/

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get, getOrNull, log },
    getNamedAccounts,
    ethers,
    getChainId,
    network,
  } = hre;

  log("hre.network.name: ", network.name);

  const chainId = parseInt(await getChainId());
  // log("chainId", chainId);
  log("Starting deployment to network name: ", network.name, "id: ", chainId);
  const { deployer } = await getNamedAccounts();

  //if (network.name != "") return;

  const dModulesProxy = await getOrNull("ProtocolConfigProxy");

  if (dModulesProxy == null)
    throw new Error("ProtocolConfigProxy is not deployed");

  const dModulesProxyAddress = dModulesProxy.address;

  const dModulesActions = await ethers.getContractAt(
    "DModulesActions",
    dModulesProxyAddress
  );
  const ModuleName = "ExchangesConfigModule";

  const deployTx = await deploy(ModuleName, {
    from: deployer,
    args: [],
    log: true,
  });
  const deployedContract = await ethers.getContractAt(
    "ExchangesConfigModule",
    deployTx.address
  );
  log(`${ModuleName} deployed: ${deployTx.address}`);
  const funcSig = "setExchangeAdapterAddress(uint256,bytes32,address)";
  //@ts-ignore
  const selectors = await getSelectors(deployedContract).get([funcSig]);
  log(selectors);

  const tx = await dModulesActions.runModuleFuncSelectorsAction(
    [
      {
        moduleAddress: deployTx.address,
        action: DModulesAction.Replace,
        functionSelectors: selectors,
      },
    ],
    ethers.constants.AddressZero,
    "0x"
    //,{ gasLimit: 800000 }
  );
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
  } else {
    log(
      `${ModuleName} function ${funcSig} , func sig hash: ${selectors[0]}, replaced.\n New module address: ${deployTx.address}`
    );
  }
};
export default func;
func.tags = ["redeployExchangesModuleFunction"];
//func.dependencies = ["PerpetualManagerProxy"];
