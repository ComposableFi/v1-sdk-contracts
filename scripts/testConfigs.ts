import { ethers, getChainId } from "hardhat";

async function testConfig() {
  const configAddresses = {
    80001: "0xCAe716f8878BB6A0abC80A7b0eF48C6A5A02b312", // Matic mumbai
    421611: "0xeD9062Bb8B80FAeF802E705191952Dc931f98F8d", // Arbitrum testnet
    3: "0xE5815818725864aDaA790Eb491251758f5f225b5", // Ropsten
    4: "0x341B20B900dB27EC08e31D8aD96371A91fe9Bda6", // Rinkeby
    // TODO Add new configAddresses when deployed
  };
  let allGood = true;

  const chainId: number = parseInt(await getChainId());

  console.log(
    `Checking that Config contracts work correctly on network ${chainId}`
  );

  const signer = ethers.provider.getSigner();

  if (!(chainId in configAddresses)) {
    console.log(`ERROR! Network ${chainId} does not have a configAddress`);
    return;
  }
  const configAddress = Object(configAddresses)[chainId];

  const networkConfig = await ethers.getContractAt(
    "contracts/utils/protocol_config/interfaces/INetworksConfigModule.sol:INetworksConfigModule",
    configAddress,
    signer
  );

  const exchangesConfig = await ethers.getContractAt(
    "contracts/utils/protocol_config/interfaces/IExchangesConfigModule.sol:IExchangesConfigModule",
    configAddress,
    signer
  );

  try {
    const configuredNetworks = await networkConfig.getNetworkIds();
    if (configuredNetworks.length == 0) {
      console.log(
        "ERROR! No network config found in the network config contract"
      );
      allGood = false;
    }
  } catch (error) {
    console.log(
      "ERROR trying to call `getNetworkIds` in network config contract"
    );
    console.log(error);
  }

  try {
    const exchangesAvailable = await exchangesConfig.getNetworkExchanges(80001); // Exchanges in Matic Mumbai
    if (exchangesAvailable.length == 0) {
      console.log(
        "ERROR! No network config found in the network config contract"
      );
      allGood = false;
    }
  } catch (error) {
    console.log(
      "ERROR trying to call `getNetworkExchanges` in exchanges config contract"
    );
    console.log(error);
  }

  // TODO Add new test criteria, such as other exchanges in other networks

  if (allGood) {
    console.log(
      `[PASS] - All config seems to be working correctly in network ${chainId}`
    );
  } else {
    console.log(
      `[ERROR] - At least on of the tests failed in network ${chainId}`
    );
  }
}

testConfig();

// To run this test use `yarn hardhat run scripts/testConfigs.ts --network <your-network>`
