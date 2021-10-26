import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployComposableConfig: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const {
    deployments: { deploy, log },
    getNamedAccounts,
    ethers,
  } = hre;

  let chainId = (await ethers.provider.getNetwork()).chainId;
  log("chainId =", chainId);
  console.log("Starting config deployment to", chainId, "network");

  let deployTx: any;
  let contractName: string;
  const numConfirmations = 5;
  const { deployer } = await getNamedAccounts();

  // deploy DModulesActions
  contractName = "DModulesActions";
  const DModulesActionsDeployment = await deploy(contractName, {
    from: deployer,
    log: true,
  });
  deployTx = await ethers.provider.getTransaction(DModulesActionsDeployment.transactionHash!);
  await deployTx.wait(numConfirmations);

  console.log("DModulesActions deployed:", DModulesActionsDeployment.address);

  // deploy DProxyModules
  contractName = "ProtocolConfigProxy";
  const DProxyModulesDeployment = await deploy(contractName, {
    from: deployer,
    log: true,
    args: [deployer, DModulesActionsDeployment.address]
  });
  deployTx = await ethers.provider.getTransaction(DProxyModulesDeployment.transactionHash!);
  await deployTx.wait(numConfirmations);

  console.log("DProxyModules deployed:", DProxyModulesDeployment.address);

};
export default deployComposableConfig;
deployComposableConfig.tags = ["deploy_composable_config_2"];
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