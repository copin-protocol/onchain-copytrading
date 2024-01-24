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
    testnet: {
      url: process.env.TESTNET_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        // USD_ASSET: "0x4967d1987930b2CD183dAB4B6C40B8745DD2eba1",
        // AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        // EXECUTOR: "0x70F5CB11f15C7e1632BAf03fa150044aC0453DF6",
        // SNX_PERPS_MARKET: "0x75c43165ea38cB857C45216a37C5405A7656673c",
        // SNX_SPOT_MARKET: "0x26f3EcFa0Aa924649cfd4b74C57637e910A983a4",
        // SNX_SUSDC: "0x367fed42283febc9d8a6d78c5ab62f78b6022e27",
        // SNX_SUSD: "0xa89163A087fe38022690C313b5D4BBF12574637f",
        USD_ASSET: "0x69980C3296416820623b3e3b30703A74e2320bC8",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "0xaC1c99F09A788c863334c364eB9474Ab2360AB18",
        SNX_PERPS_MARKET: "0xE6C5f05C415126E6b81FCc3619f65Db2fCAd58D0",
        SNX_SPOT_MARKET: "0xA4fE63F8ea9657990eA8E05Ebfa5C19a7D4d7337",
        SNX_SUSDC: "0x434Aa3FDb11798EDaB506D4a5e48F70845a66219",
        SNX_SUSD: "0xa89163A087fe38022690C313b5D4BBF12574637f",
      },
    },
    mainnet: {
      url: process.env.MAINNET_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        USD_ASSET: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "",
        SNX_PERPS_MARKET: "0x0A2AF931eFFd34b81ebcc57E3d3c9B1E1dE1C9Ce",
        SNX_SPOT_MARKET: "0x18141523403e2595D31b22604AcB8Fc06a4CaA61",
        SNX_SUSDC: "0xc74ea762cf06c9151ce074e6a569a5945b6302e7",
        SNX_SUSD: "0x09d51516F38980035153a554c26Df3C6f51a23C3",
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
      optimisticEthereum: process.env.OPSCAN_API_KEY!,
      base: process.env.BASESCAN_API_KEY!,
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
        network: "base",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "optimisticEthereum",
        chainId: 420,
        urls: {
          apiURL: "https://api-goerli-optimism.etherscan.io/api",
          browserURL: "https://goerli-optimism.etherscan.io",
        },
      },
    ],
  },
};

export default config;
