import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";


import "./tasks/marketMint";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity:"0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      },
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 100000
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    gasPrice: 21,
    currency: "USD",
  },
  
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  
};

export default config;
