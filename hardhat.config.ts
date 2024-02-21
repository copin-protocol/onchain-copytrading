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
    polygon: {
      url: process.env.POLYGON_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        RELAYER_API_KEY: process.env.RELAYER_API_KEY!,
        RELAYER_API_SECRET: process.env.RELAYER_API_SECRET!,
        USD_ASSET: "0x69980C3296416820623b3e3b30703A74e2320bC8",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "0xaC1c99F09A788c863334c364eB9474Ab2360AB18",
        FACTORY_ADDRESS: "0xEA727dB6083449F669dEaB043c37D051A06CBb2a",
        EVENTS_ADDRESS: "0x3E884Bd4a9D21E98863EFfD5b1671AD5090C0058",
        CONFIGS_ADDRESS: "0x630048E2A43Ac238a9100e88dB943aedEeeeA11a",
        TASK_CREATOR_ADDRESS: "0xE9D1E94E8A933b2fDcc8415D9D697e5070c4c421",
        IMPLEMENTATION_ADDRESS: "0x9Ed7d7F2363daD9D722462B0891539D6F6Ca4df2",
        SMART_WALLET_ADDRESS: "0x742abF5387e737b5cE6087d8648CEbA2A573D96c",
        SNX_PERPS_MARKET: "0xE6C5f05C415126E6b81FCc3619f65Db2fCAd58D0",
        SNX_SPOT_MARKET: "0xA4fE63F8ea9657990eA8E05Ebfa5C19a7D4d7337",
        SNX_SUSDC: "0x434Aa3FDb11798EDaB506D4a5e48F70845a66219",
        SNX_SUSD: "0xa89163A087fe38022690C313b5D4BBF12574637f",
      },
    },
    base: {
      url: process.env.BASE_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        RELAYER_API_KEY: process.env.RELAYER_API_KEY!,
        RELAYER_API_SECRET: process.env.RELAYER_API_SECRET!,
        USD_ASSET: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "0xC5417a77f8b0649c47d00363370D9D4A25e7d1Ef",
        FACTORY_ADDRESS: "0xfC9339f4CE0Cb840C64f9F7cBbcdf16C4eD008a0",
        EVENTS_ADDRESS: "0x2Fe95465616F6252636fC101400147C0a1e64F6C",
        CONFIGS_ADDRESS: "0x8DA098F5eA19050FC058c70bcE078eea9fC4e43D",
        TASK_CREATOR_ADDRESS: "0x346923f800A8DB39d89cD21e367d46af916F73B5",
        IMPLEMENTATION_ADDRESS: "0x31D191100D3bBE0815a1cA82b52B49454e4A514d",
        SMART_WALLET_ADDRESS: "",
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
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
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
