require("dotenv").config();
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
// import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
      viaIR: true,
      metadata: {
        bytecodeHash: "none",
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: process.env.GOERLI_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
    },
    polygon: {
      url: process.env.POLYGON_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
    },
    arbitrumSepolia: {
      url: process.env.ARB_SEPOLIA_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        USD_ASSET: "0x4cC7EbEeD5EA3adf3978F19833d2E1f3e8980cD6",
        FACTORY_ADDRESS: "0xc463f0e7fA432900b092653f914Fbd8559D7DB10",
        EVENTS_ADDRESS: "0xc711ad2753232bb2e1b48a63B944CE12a78fbBaf",
        CONFIGS_ADDRESS: "0x944c7626b5074F423F4C00aa54b520c4d985578d",
        IMPLEMENTATION_ADDRESS: "0x329b3599e51B992879349C0388D29a5B06861B0B",
        SMART_WALLET_ADDRESS: "0x4c771f04038a485E20e8BA7352356AcE3641529F",
        GAINS_TRADING: "0xd659a15812064C79E189fd950A189b15c75d3186",
      },
    },
    arbitrum: {
      url: process.env.ARB_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        USD_ASSET: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        FACTORY_ADDRESS: "",
        EVENTS_ADDRESS: "",
        CONFIGS_ADDRESS: "",
        IMPLEMENTATION_ADDRESS: "",
        SMART_WALLET_ADDRESS: "",
        GAINS_TRADING: "",
      },
    },
  },
  gasReporter: {
    currency: "USD",
    token: "ETH",
    gasPrice: 22,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY!,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY!,
    },
    customChains: [
      // {
      //   network: "base",
      //   chainId: 84531,
      //   urls: {
      //     apiURL: "https://api-goerli.basescan.org/api",
      //     browserURL: "https://goerli.basescan.org",
      //   },
      // },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
};

export default config;
