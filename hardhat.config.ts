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
    arbitrum: {
      url: process.env.ARB_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        RELAYER_API_KEY: process.env.RELAYER_API_KEY!,
        RELAYER_API_SECRET: process.env.RELAYER_API_SECRET!,
        USD_ASSET: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "0xdD5918bA45A94A05965c7A8b63BE7CEA1460ABb3",
        FACTORY_ADDRESS: "0x6aCD1Ac7eeEa7783E805a1c4E31c85A4535d682B",
        EVENTS_ADDRESS: "0xeb452323b4bFb289867D21cAa524535F443a5904",
        CONFIGS_ADDRESS: "0x81Ed045eaB09B9164657A2EC76442f1337A38D0e",
        TASK_CREATOR_ADDRESS: "0x2Fe95465616F6252636fC101400147C0a1e64F6C",
        IMPLEMENTATION_ADDRESS: "0x6aFa95bCC134c91460521CF0c46340c936E0acA5",
        SMART_WALLET_ADDRESS: "0x1362011668ad0b665618b3cc0651F4aD7C36c147",
        ROUTER: "0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064",
        POSITION_ROUTER: "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868",
        VAULT: "0x489ee077994B6658eAfA855C308275EAd8097C4A",
        WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      },
    },
    opSepolia: {
      url: process.env.OP_SEPOLIA_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        RELAYER_API_KEY: process.env.RELAYER_API_KEY!,
        RELAYER_API_SECRET: process.env.RELAYER_API_SECRET!,
        USD_ASSET: "0xD7D674d80e79CF3A3b67D6a510AC1B0493dF47cF",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "0xdDAf82aD2ceF6dDAB6170C46111398d7622eE829",
        FACTORY_ADDRESS: "0x2559b0052e7f0ec230397Be9a28A9FaB268466b2",
        EVENTS_ADDRESS: "0x6bB8aE99C1188084C9060390DB540A9993875A25",
        CONFIGS_ADDRESS: "0x4bb75ad1D6068dA358D9AEe6D64fe080C9f8F832",
        TASK_CREATOR_ADDRESS: "",
        IMPLEMENTATION_ADDRESS: "0xf46Bd2e3a9339Ee6488dB1bc2929b93dB44B8a29",
        SMART_WALLET_ADDRESS: "0x52FEbD1248926f887Cf6de0ed004cB8371126282",
        ETH_MARKET_KEY:
          "0x7345544850455250000000000000000000000000000000000000000000000000",
        SNX_EXCHANGE_RATE: "0xBDA9863eFC244692816814E686Bd3A94aEc604Ad",
        SNX_MARKET_MANAGER: "0x00D79DBB8e9fC344C015ADD2D4135E5181b61e66",
        SNX_SYSTEM_STATUS: "0x247814db4369f8E952F60A6409C16A928672dcc6",
      },
      // gasPrice: 60,
    },
    op: {
      url: process.env.OP_NODE_URL,
      accounts: [
        process.env.PRIVATE_KEY_1!,
        process.env.PRIVATE_KEY_2!,
        process.env.PRIVATE_KEY_3!,
      ],
      ...{
        RELAYER_API_KEY: process.env.RELAYER_API_KEY!,
        RELAYER_API_SECRET: process.env.RELAYER_API_SECRET!,
        USD_ASSET: "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9",
        AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0",
        EXECUTOR: "0x76Ea7951214A0a3b8D132fb7C80c174dbeD62bcf",
        FACTORY_ADDRESS: "0xB27A14Fa98608A95d81C22023F09648f2Cb714C2",
        EVENTS_ADDRESS: "0x88680E90D1Bcb8Bf1AD5cd0F65f99851803F9A04",
        CONFIGS_ADDRESS: "0xf608A4c1BADd8367C0D7A186923fe07AC2C018Fb",
        TASK_CREATOR_ADDRESS: "0x6c0D18C82E5AACAc466889bF433f766cd54281e1",
        IMPLEMENTATION_ADDRESS: "0xa29314DB1D3b8705B74482775210a2f702a9f970",
        SMART_WALLET_ADDRESS: "",
        ETH_MARKET_KEY:
          "0x7345544850455250000000000000000000000000000000000000000000000000",

        SNX_EXCHANGE_RATE: "0x2C15259D4886e2C0946f9aB7a5E389c86b3c3b04",
        SNX_MARKET_MANAGER: "0xd30bdFd7e7a65fE109D5dE1D4e95F3B800FB7463",
        SNX_SYSTEM_STATUS: "0xE8c41bE1A167314ABAF2423b72Bf8da826943FFD",
      },
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
      arbitrumOne: process.env.ARBISCAN_API_KEY!,
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
        network: "arbitrumOne",
        chainId: 421613,
        urls: {
          apiURL: "https://api-testnet.arbiscan.io/api",
          browserURL: "https://testnet.arbiscan.io",
        },
      },
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
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimism.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io",
        },
      },
    ],
  },
};

export default config;
