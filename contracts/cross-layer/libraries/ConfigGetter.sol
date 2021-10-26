pragma solidity ^0.6.8;

library ConfigGetter {
	address private constant configAddress3 = 0xE5815818725864aDaA790Eb491251758f5f225b5; // Ropsten
	address private constant configAddress4 = 0x341B20B900dB27EC08e31D8aD96371A91fe9Bda6; // Rinkeby
	address private constant configAddress80001 = 0xCAe716f8878BB6A0abC80A7b0eF48C6A5A02b312; // Matic Mumbai
	address private constant configAddress421611 = 0xeD9062Bb8B80FAeF802E705191952Dc931f98F8d; // Arbitrum testnet


	address private constant configAddress1 = 0xC320E591c9AA1b0cE3eAf7c009209A19194cfC88; // Ethereum mainnet
	address private constant configAddress137 = 0x80f13794e532359A991bdcfe86d839837ef1908B; // Matic mainnet
	address private constant configAddress42161 = 0xC320E591c9AA1b0cE3eAf7c009209A19194cfC88; // Arbitrum mainnet

	function getConfigAddress() internal pure returns (address) {
		uint256 chainId = getChainId();
		// First check if there's a config address for this network
		if (chainId == 3) {
			return configAddress3;
		}
		if (chainId == 4) {
			return configAddress4;
		}
		if (chainId == 80001) {
			return configAddress80001;
		}
		if (chainId == 421611) {
			return configAddress421611;
		}
		if (chainId == 42161) {
			return configAddress42161;
		}
		if (chainId == 137) {
			return configAddress137;
		}
		if (chainId == 1) {
			return configAddress1;
		}
		return address(0); // Return empty address if no config is deployed in this network
	}

	function getChainId() internal pure returns (uint256 chainId) {
		assembly {
			chainId := chainid()
		}
	}
}
