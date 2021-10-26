import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy, get, getOrNull, log },
    getNamedAccounts,
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
    80001: "0xCAe716f8878BB6A0abC80A7b0eF48C6A5A02b312", // Matic mumbai
    421611: "0xeD9062Bb8B80FAeF802E705191952Dc931f98F8d", // Arbitrum testnet
    3: "0xE5815818725864aDaA790Eb491251758f5f225b5", // Ropsten
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
    3: {  // Ropsten
      networkId: BN.from(3),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("ropsten"),
      vaultAddress: "0xC80f04563Cd7ddFdF95a3706ba02808D3274C9F1",
      url: "https://ropsten.infura.io/v3/",
    },
    80001: {  // Matic Mumbai
      networkId: BN.from(80001),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("matic_mumbai"),
      vaultAddress: "0x5c6678513702Ccf311Ef9F3834884D46B70BEa62",
      url: "https://matic-mumbai.chainstacklabs.com",
    },
    421611: {  // Arbitrum testnet
      networkId: BN.from(421611),
      timeout: BN.from(120000),
      gasPrice: BN.from(20000000),
      gas: BN.from(10000000),
      networkName: ethers.utils.formatBytes32String("arbitrum_testnet"),
      vaultAddress: "0x6D34da521Ab93C8BE50925e1dc67a57fDb8F7c95",
      url: "https://rinkeby.arbitrum.io/rpc",
    },
  }

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
  let strIds = [];  // List of networkIds already in the config
  for(let id of prevRegisteredConfigsIds) {strIds.push(id.toString())}
  let netName: string;
  let txConfig: any;
  let txReceipt: any;
  let netConf: any;
  let netId: any;
  for([netId, netConf] of Object.entries(networkConfigData)){
    if(strIds.includes(netId)) {
      log(`Config for network ${netId} already defined, skipping...`);
      continue;  // Exclude already defined config
    }
    netName = ethers.utils.parseBytes32String(netConf['networkName']);
    log(netName, " ...");
    txConfig = await networkConfig.addNetworkConfig(netConf);
    txReceipt = await txConfig.wait();
    log('txId: ', txReceipt.transactionHash);
    log('gas used: ', txReceipt.gasUsed.toString());
    log('gas price: ', txReceipt.effectiveGasPrice.toString());
    log("done");
  }

  /**
   * AMM Adapter Config Setup
   */
  const sushiswapB32 = ethers.utils.formatBytes32String("sushiswap");
  // Sushiswap adapter in Matic mumbai
  log("Sushiswap adapter in matic mumbai...");
  const tx_sushiswap_matic = await exchangesConfig.setExchangeAdapterAddress(
    80001,
    sushiswapB32,
    "0x16E2c094C8354bD46d3FBc59090654B7BA97a238" // TODO Get it from deployments
  );
  txReceipt = await tx_sushiswap_matic.wait();
  log('txId: ', txReceipt.transactionHash);
  log('gas used: ', txReceipt.gasUsed.toString());
  log('gas price: ', txReceipt.effectiveGasPrice.toString());

  // VERIFY
  const networkConfigDataKeys = Object.keys(networkConfigData);
  log("--- await networkConfig.getNetworkIds(): ---");
  const registeredConfigsIds = await networkConfig.getNetworkIds()
  log(registeredConfigsIds);
  log("Should be as many registered network configs as declared in `networkConfigData`");
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
    if(Object(registeredConfig)['vaultAddress'] == EMPTY_ADDRESS) {
      log(`ERROR! The network ${key} does not have a valid vault address!`);
    }
  }
};
export default func;
func.tags = ["set_config_data_testnet"];
//func.dependencies = ["PerpetualManagerProxy"];
