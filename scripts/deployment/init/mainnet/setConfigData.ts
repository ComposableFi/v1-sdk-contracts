import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { getOrNull, log },
    ethers,
    getChainId,
    network,
  } = hre;

  const { BigNumber } = ethers;
  const BN = BigNumber;

  log("hre.network.name: ", network.name);

  const chainId = parseInt(await getChainId());
  log(
    "Starting setting config data on network: ",
    network.name,
    "id: ",
    chainId
  );

  const dModulesProxy = await getOrNull("ProtocolConfigProxy");

  if (dModulesProxy == null) {
    throw new Error("ProtocolConfigProxy is not deployed");
  }

  const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
  const configAddresses = {
    1: "0xC320E591c9AA1b0cE3eAf7c009209A19194cfC88", // Ethereum Mainnet
    137: "0x80f13794e532359A991bdcfe86d839837ef1908B", // Polygon
    42161: "0xC320E591c9AA1b0cE3eAf7c009209A19194cfC88", // Arbitrum Mainnet
    // TODO More mainnet networks should be added here (avalanche, moonriver, fantom, harmony)
  };

  // SET INFO
  /*struct NetworkConfig {
    uint256 networkId; // 421611
    uint256 timeout; // 120000
    uint256 gasPrice; // 20000000
    uint256 gas; // 10000000
    bytes32 networkName; // rinkeby
    address vaultAddress; // the network vault proxy address
    string url; // "https://rinkeby.arbitrum.io/rpc"
  }*/

  const networkConfigData = {
    1: {
      // Ethereum mainnet
      networkId: BN.from(1),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("mainnet"),
      vaultAddress: "0x29E0A2A859301957C93E626Eb611Ff4D41291cAD",
      url: "https://main-light.eth.linkpool.io/",
    },
    137: {
      // Matic mainnet
      networkId: BN.from(137),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("matic_mainnet"),
      vaultAddress: "0xCd8e7322dc2659b1ec447e5d52FDd9c67e8C3c01",
      url: "https://rpc-mainnet.maticvigil.com",
    },
    250: {
      // Fantom mainnet
      networkId: BN.from(250),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("fantom_mainnet"),
      vaultAddress: "0x5ca6F10F259CCF8e412fd0A2f5BA915F2b4FF21a",
      url: "https://rpc.ftm.tools/",
    },
    1285: {
      // Moonriver mainnet
      networkId: BN.from(1285),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("moonriver_mainnet"),
      vaultAddress: "0x23Bdb092ACC1660faF1f6eE8C1846BbCf2A7aFB2",
      url: "https://rpc.moonriver.moonbeam.network",
    },
    42161: {
      // Arbitrum mainnet
      networkId: BN.from(42161),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("arbitrum_mainnet"),
      vaultAddress: "0xEba8C2Bf0d1C9413543188fc42D7323690AED051",
      url: "https://arb1.arbitrum.io/rpc",
    },
    43114: {
      // Avalanche mainnet
      networkId: BN.from(43114),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("avalanche_mainnet"),
      vaultAddress: "0xAC5b41d45ac10E28C34d201E491a3CCe6932FDF1",
      url: "https://api.avax.network/ext/bc/C/rpc",
    },
    1666600000: {
      // Harmony mainnet
      networkId: BN.from(1666600000),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("harmony_mainnet"),
      vaultAddress: "0x1E4645597C9a9C6af7719721C52b9FED17cC3201",
      url: "https://api.harmony.one",
    },
  };

  const signer = ethers.provider.getSigner();

  const chain = chainId;
  const config = Object(configAddresses)[chain];
  log("const [chain, config]: [", chain, ",", config, "]");
  const networkConfig = await ethers.getContractAt(
    "contracts/utils/protocol_config/interfaces/INetworksConfigModule.sol:INetworksConfigModule",
    config,
    signer
  );
  const exchangesConfig = await ethers.getContractAt(
    "contracts/utils/protocol_config/interfaces/IExchangesConfigModule.sol:IExchangesConfigModule",
    config,
    signer
  );

  // Add network config for every config in `networkConfigData`
  const prevRegisteredConfigsIds = await networkConfig.getNetworkIds();
  let strIds = []; // List of networkIds already in the config
  for (let id of prevRegisteredConfigsIds) {
    strIds.push(id.toString());
  }
  let netName: string;
  let txConfig: any;
  let txReceipt: any;
  let netConf: any;
  let netId: any;
  for ([netId, netConf] of Object.entries(networkConfigData)) {
    if (strIds.includes(netId)) {
      log(`Config for network ${netId} already defined, skipping...`);
      continue; // Exclude already defined config
    }
    netName = ethers.utils.parseBytes32String(netConf["networkName"]);
    log(netName, "...");
    txConfig = await networkConfig.addNetworkConfig(netConf);
    txReceipt = await txConfig.wait();
    log("gas used: ", txReceipt.gasUsed.toString());
    log("gas price: ", txReceipt.effectiveGasPrice.toString());
    log("done");
  }

  /**
   * AMM Adapter Config Setup
   */
  const sushiswapB32 = ethers.utils.formatBytes32String("sushiswap");
  // Sushiswap adapter in Matic mainnet
  log("Sushiswap adapter in matic mainnet...");
  const tx_sushiswap_matic = await exchangesConfig.setExchangeAdapterAddress(
    137,
    sushiswapB32,
    "0xAF5a5a841C5f81E42113E43eD1e09e1dA4516CA2" // TODO Get it from deployments
  );
  txReceipt = await tx_sushiswap_matic.wait();
  log("gas used: ", txReceipt.gasUsed.toString());
  log("gas price: ", txReceipt.effectiveGasPrice.toString());

  // Sushiswap adapter in Arbitrum mainnet
  log("Sushiswap adapter in Arbitrum mainnet...");
  const tx_sushiswap_arbitrum = await exchangesConfig.setExchangeAdapterAddress(
    42161,
    sushiswapB32,
    "0xbf3aCB6bcFDD26Da3D4DA90cCecf5B7FCf48290F" // TODO Get it from deployments
  );
  txReceipt = await tx_sushiswap_arbitrum.wait();
  log("gas used: ", txReceipt.gasUsed.toString());
  log("gas price: ", txReceipt.effectiveGasPrice.toString());

  // Sushiswap adapter in Ethereum mainnet
  log("Sushiswap adapter in Ethereum mainnet...");
  const tx_sushiswap_ethereum = await exchangesConfig.setExchangeAdapterAddress(
    1,
    sushiswapB32,
    "0xbf3aCB6bcFDD26Da3D4DA90cCecf5B7FCf48290F" // TODO Get it from deployments
  );
  txReceipt = await tx_sushiswap_ethereum.wait();
  log("gas used: ", txReceipt.gasUsed.toString());
  log("gas price: ", txReceipt.effectiveGasPrice.toString());

  // VERIFY
  const networkConfigDataKeys = Object.keys(networkConfigData);
  log("--- await networkConfig.getNetworkIds(): ---");
  const registeredConfigsIds = await networkConfig.getNetworkIds();
  log(registeredConfigsIds);
  log(
    "Should be as many registered network configs as declared in `networkConfigData`"
  );
  if (registeredConfigsIds.length == networkConfigDataKeys.length) {
    log("CHECK!");
  } else {
    log("ERROR! The numbers don't match");
  }

  let registeredConfig: any;
  let key: any;
  for (key of networkConfigDataKeys) {
    log(`--- await networkConfig.getNetworkConfigById(${key}): ---`);
    registeredConfig = await networkConfig.getNetworkConfigById(key);
    log(registeredConfig);
    if (Object(registeredConfig)["vaultAddress"] == EMPTY_ADDRESS) {
      log(`ERROR! The network ${key} does not have a valid vault address!`);
    }
  }
};
export default func;
func.tags = ["set_config_data_mainnet"];
//func.dependencies = ["PerpetualManagerProxy"];
