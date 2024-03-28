import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { CONFIG, Command, PROTOCOL_FEE } from "./constants";
import { formatEther } from "@ethersproject/units";
import perpsV2MarketAbi from "./abis/perpsV2MarketAbi";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { Call, multicall } from "./multicall";
import { calculateAcceptablePrice } from "./calculate";

const abi = ethers.utils.defaultAbiCoder;

export const MARKET_SYNTHETIX: {
  [key: string]: {
    mainnet: string;
    testnet: string;
    decimals: number;
    priceFeedId: string;
  };
} = {
  "1INCH": {
    mainnet: "0xd5fAaa459e5B3c118fD85Fc0fD67f56310b1618D",
    testnet: "0x5463B99CdB8e0392F1cf381079De910Ab2ED762D",
    decimals: 18,
    priceFeedId:
      "0x63f341689d98a12ef60a5cff1d7f85c70a9e17bf1575f0e7c0b2512d48b1c8b3",
  },
  AAVE: {
    mainnet: "0x5374761526175B59f1E583246E20639909E189cE",
    testnet: "0xa89402D83DeD4C71639Cf0Ca1f5FCc25EE4eB1A8",
    decimals: 18,
    priceFeedId:
      "0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445",
  },
  ADA: {
    mainnet: "0xF9DD29D2Fd9B38Cd90E390C797F1B7E0523f43A9",
    testnet: "0x2805E91bdf139E68EFfC79117f39b4C34e71B0Bb",
    decimals: 18,
    priceFeedId:
      "0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d",
  },
  ALGO: {
    mainnet: "0x96f2842007021a4C5f06Bcc72961701D66Ff8465",
    testnet: "0xf3D4f959edb11594a5fEB13Fc11a74F096603779",
    decimals: 18,
    priceFeedId:
      "0xfa17ceaf30d19ba51112fdcc750cc83454776f47fb0112e4af07f15f4bb1ebc0",
  },
  APE: {
    mainnet: "0x5B6BeB79E959Aac2659bEE60fE0D0885468BF886",
    testnet: "0x00e793B4ad1eCf68e660BB798c16a2Ea438C0A29",
    decimals: 18,
    priceFeedId:
      "0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864",
  },
  APT: {
    mainnet: "0x9615B6BfFf240c44D3E33d0cd9A11f563a2e8D8B",
    testnet: "0xC1D3237719867905F42B492030b5CBc8E24c8dA1",
    decimals: 18,
    priceFeedId:
      "0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5",
  },
  ARB: {
    mainnet: "0x509072A5aE4a87AC89Fc8D64D94aDCb44Bd4b88e",
    testnet: "0x1821b0d66d72E4a0a85B5B2a2941E76f237552Ba",
    decimals: 18,
    priceFeedId:
      "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
  },
  ATOM: {
    mainnet: "0xbB16C7B3244DFA1a6BF83Fcce3EE4560837763CD",
    testnet: "0xbFC138dFf9Ae45F3e4ae9Bf3aCB47CA8223196E4",
    decimals: 18,
    priceFeedId:
      "0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
  },
  AVAX: {
    mainnet: "0xc203A12F298CE73E44F7d45A4f59a43DBfFe204D",
    testnet: "0x10e79fe757eD1d18536B2E509AF61235BceD69e0",
    decimals: 18,
    priceFeedId:
      "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
  },
  AXS: {
    mainnet: "0x3a52b21816168dfe35bE99b7C5fc209f17a0aDb1",
    testnet: "0x2e11a3638F12A37263b1B4226b61412f6BBB277c",
    decimals: 18,
    priceFeedId:
      "0xb7e3904c08ddd9c0c10c6d207d390fd19e87eb6aab96304f571ed94caebdefa0",
  },
  BAL: {
    mainnet: "0x71f42cA320b3e9A8e4816e26De70c9b69eAf9d24",
    testnet: "0x91DfFf9A9E4fE4F3BBD2F83c60A7fE335bbc316a",
    decimals: 18,
    priceFeedId:
      "0x07ad7b4a7662d19a6bc675f6b467172d2f3947fa653ca97555a9b20236406628",
  },
  BCH: {
    mainnet: "0x96690aAe7CB7c4A9b5Be5695E94d72827DeCC33f",
    testnet: "0x01F226F3FB083165401c9e50FDE718b6a2b266A9",
    decimals: 18,
    priceFeedId:
      "0x3dd2b63686a450ec7290df3a1e0b583c0481f651351edfa7636f39aed55cf8a3",
  },
  BLUR: {
    mainnet: "0xa1Ace9ce6862e865937939005b1a6c5aC938A11F",
    testnet: "0x867D147fDe1e29C37B6cFbA35A266C7A758489Ee",
    decimals: 18,
    priceFeedId:
      "0x856aac602516addee497edf6f50d39e8c95ae5fb0da1ed434a8c2ab9c3e877e9",
  },
  BNB: {
    mainnet: "0x0940B0A96C5e1ba33AEE331a9f950Bb2a6F2Fb25",
    testnet: "0x58ed75617f2701Ec1Be85709dAB27cEcab327C04",
    decimals: 18,
    priceFeedId:
      "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f",
  },
  BTC: {
    mainnet: "0x59b007E9ea8F89b069c43F8f45834d30853e3699",
    testnet: "0xcA3988389C58F9C46245abbD6e3549744d516531",
    decimals: 8,
    priceFeedId:
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  },
  CELO: {
    mainnet: "0x2292865b2b6C837B7406E819200CE61c1c4F8d43",
    testnet: "0xc50E64e2E980a67BbD85B68A3Ad96aCB1c037921",
    decimals: 18,
    priceFeedId:
      "0x7d669ddcdd23d9ef1fa9a9cc022ba055ec900e91c4cb960f3c20429d4447a411",
  },
  COMP: {
    mainnet: "0xb7059Ed9950f2D9fDc0155fC0D79e63d4441e806",
    testnet: "0x0d407B6B9261558249c3B7e68f2E237bC2aA1F02",
    decimals: 18,
    priceFeedId:
      "0x4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478",
  },
  CRV: {
    mainnet: "0xD5fBf7136B86021eF9d0BE5d798f948DcE9C0deA",
    testnet: "0x1120e7DDB511493040F41Add9bBe3F9c53b967E0",
    decimals: 18,
    priceFeedId:
      "0xa19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8",
  },
  DOGE: {
    mainnet: "0x98cCbC721cc05E28a125943D69039B39BE6A21e9",
    testnet: "0x0E9628026e53f4c805073d85554A87dBd2011268",
    decimals: 18,
    priceFeedId:
      "0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c",
  },
  DOT: {
    mainnet: "0x8B9B5f94aac2316f048025B3cBe442386E85984b",
    testnet: "0x9Ef3B803ed63A7E2f6cA1C46e313d8db642AA864",
    decimals: 18,
    priceFeedId:
      "0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b",
  },
  DYDX: {
    mainnet: "0x139F94E4f0e1101c1464a321CBA815c34d58B5D9",
    testnet: "0x5D6e4263a203A1677Da38f175d95759adA27e6F9",
    decimals: 18,
    priceFeedId:
      "0x6489800bb8974169adfe35937bf6736507097d13c190d760c557108c7e93a81b",
  },
  ENJ: {
    mainnet: "0x88C8316E5CCCCE2E27e5BFcDAC99f1251246196a",
    testnet: "0x4EA91e75335Fa05182a7c8BD9D54A1f1ff6Ed29E",
    decimals: 18,
    priceFeedId:
      "0x5cc254b7cb9532df39952aee2a6d5497b42ec2d2330c7b76147f695138dbd9f3",
  },
  EOS: {
    mainnet: "0x50a40d947726ac1373DC438e7aaDEde9b237564d",
    testnet: "0x08808c5B37e731bCcCd0Ae59f5681d0040022Af3",
    decimals: 18,
    priceFeedId:
      "0x06ade621dbc31ed0fc9255caaab984a468abe84164fb2ccc76f02a4636d97e31",
  },
  ETC: {
    mainnet: "0x4bF3C1Af0FaA689e3A808e6Ad7a8d89d07BB9EC7",
    testnet: "0xBF1B83321d97734D11399Eabb38684dB33d8B3D6",
    decimals: 18,
    priceFeedId:
      "0x7f5cc8d963fc5b3d2ae41fe5685ada89fd4f14b435f8050f28c7fd409f40c2d8",
  },
  ETH: {
    mainnet: "0x2B3bb4c683BFc5239B029131EEf3B1d214478d93",
    testnet: "0xCa1Da01A412150b00cAD52b426d65dAB38Ab3830",
    decimals: 18,
    priceFeedId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  },
  FIL: {
    mainnet: "0x2C5E2148bF3409659967FE3684fd999A76171235",
    testnet: "0xF60D392b73E4333ff7fb100235D235c0922cF9a4",
    decimals: 18,
    priceFeedId:
      "0x150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e",
  },
  FLOKI: {
    mainnet: "0x5ed8D0946b59d015f5A60039922b870537d43689",
    testnet: "0xDDc8EcC1Fe191e5a156cb1e7cd00fE572bb272E5",
    decimals: 18,
    priceFeedId:
      "0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293",
  },
  FLOW: {
    mainnet: "0x27665271210aCff4Fab08AD9Bb657E91866471F0",
    testnet: "0xe14F12246A6965aB2E8ea52A1Be39B8f731bc4a4",
    decimals: 18,
    priceFeedId:
      "0x2fb245b9a84554a0f15aa123cbb5f64cd263b59e9a87d80148cbffab50c69f30",
  },
  FTM: {
    mainnet: "0xC18f85A6DD3Bcd0516a1CA08d3B1f0A4E191A2C4",
    testnet: "0x14fA3376E2ffa41708A0636009A35CAE8D8E2bc7",
    decimals: 18,
    priceFeedId:
      "0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c",
  },
  FXS: {
    mainnet: "0x2fD9a39ACF071Aa61f92F3D7A98332c68d6B6602",
    testnet: "0x18433f795e05E8FF387C0633aF4140e72cdd5A94",
    decimals: 18,
    priceFeedId:
      "0x735f591e4fed988cd38df74d8fcedecf2fe8d9111664e0fd500db9aa78b316b1",
  },
  GMX: {
    mainnet: "0x33d4613639603c845e61A02cd3D2A78BE7d513dc",
    testnet: "0x6ee09cF4B660975D8Fdb041AE257BAc34f4aA589",
    decimals: 18,
    priceFeedId:
      "0xb962539d0fcb272a494d65ea56f94851c2bcf8823935da05bd628916e2e9edbf",
  },
  ICP: {
    mainnet: "0x105f7F2986A2414B4007958b836904100a53d1AD",
    testnet: "0xeA4662804B884EB6ed4DAe4323Ea20e04c07626d",
    decimals: 18,
    priceFeedId:
      "0xc9907d786c5821547777780a1e4f89484f3417cb14dd244f2b0a34ea7a554d67",
  },
  INJ: {
    mainnet: "0x852210F0616aC226A486ad3387DBF990e690116A",
    testnet: "0x3a47Ec548435A4478B2042Cbdc56F94cB62c435F",
    decimals: 18,
    priceFeedId:
      "0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592",
  },
  KNC: {
    mainnet: "0x152Da6a8F32F25B56A32ef5559d4A2A96D09148b",
    testnet: "0xFFa9181926d4C6003213cAb599963D0614b0cA61",
    decimals: 18,
    priceFeedId:
      "0xb9ccc817bfeded3926af791f09f76c5ffbc9b789cac6e9699ec333a79cacbe2a",
  },
  LDO: {
    mainnet: "0xaa94C874b91ef16C8B56A1c5B2F34E39366bD484",
    testnet: "0x041013BCB3637778B5056Bf5595318415EC21C0d",
    decimals: 18,
    priceFeedId:
      "0xc63e2a7f37a04e5e614c07238bedb25dcc38927fba8fe890597a593c0b2fa4ad",
  },
  LINK: {
    mainnet: "0x31A1659Ca00F617E86Dc765B6494Afe70a5A9c1A",
    testnet: "0x5fc12B9E0284545b6d979b77436D3BaA3b0F612d",
    decimals: 18,
    priceFeedId:
      "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
  },
  LTC: {
    mainnet: "0xB25529266D9677E9171BEaf333a0deA506c5F99A",
    testnet: "0xE97AE65AB0108DDc4dF34b6Aff7B17D911C39931",
    decimals: 18,
    priceFeedId:
      "0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54",
  },
  MATIC: {
    mainnet: "0x074B8F19fc91d6B2eb51143E1f186Ca0DDB88042",
    testnet: "0x928B8C670D244ee09b8b57Cac7b6F042e6FC4306",
    decimals: 18,
    priceFeedId:
      "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52",
  },
  MAV: {
    mainnet: "0x572F816F21F56D47e4c4fA577837bd3f58088676",
    testnet: "0xFf1AA6A6B8a8CDD82a7B275A65D9EF7fa5EcE2e6",
    decimals: 18,
    priceFeedId:
      "0x5b131ede5d017511cf5280b9ebf20708af299266a033752b64180c4201363b11",
  },
  MKR: {
    mainnet: "0xf7d9Bd13F877171f6C7f93F71bdf8e380335dc12",
    testnet: "0x52a35CaED46a6c20B5c43a0D6BEDc4990800E492",
    decimals: 18,
    priceFeedId:
      "0x9375299e31c0deb9c6bc378e6329aab44cb48ec655552a70d4b9050346a30378",
  },
  NEAR: {
    mainnet: "0xC8fCd6fB4D15dD7C455373297dEF375a08942eCe",
    testnet: "0x227F3d73Cf5618640fe3a0eF8404929aa99532c8",
    decimals: 18,
    priceFeedId:
      "0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750",
  },
  ONE: {
    mainnet: "0x86BbB4E38Ffa64F263E84A0820138c5d938BA86E",
    testnet: "0x3A2F7083C1617e4371bA723Bc27dED8A1Bd6AD90",
    decimals: 18,
    priceFeedId:
      "0xc572690504b42b57a3f7aed6bd4aae08cbeeebdadcf130646a692fe73ec1e009",
  },
  OP: {
    mainnet: "0x442b69937a0daf9D46439a71567fABE6Cb69FBaf",
    testnet: "0x524c0B136F54941529b8c11214A05f958a89A6A6",
    decimals: 18,
    priceFeedId:
      "0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf",
  },
  PEPE: {
    mainnet: "0x3D3f34416f60f77A0a6cC8e32abe45D32A7497cb",
    testnet: "0x8262BaDdD5644b02f317eA1AD4E5cBC52B9bfd0b",
    decimals: 18,
    priceFeedId:
      "0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4",
  },
  PERP: {
    mainnet: "0xaF2E4c337B038eaFA1dE23b44C163D0008e49EaD",
    testnet: "0x9763510E1E0057bE624Ded90e1916130cBe920df",
    decimals: 18,
    priceFeedId:
      "0x944f2f908c5166e0732ea5b610599116cd8e1c41f47452697c1e84138b7184d6",
  },
  RNDR: {
    mainnet: "0x91cc4a83d026e5171525aFCAEd020123A653c2C9",
    testnet: "0x9c898362025AF668067947fA55500081B13fdC7e",
    decimals: 18,
    priceFeedId:
      "0xab7347771135fc733f8f38db462ba085ed3309955f42554a14fa13e855ac0e2f",
  },
  RPL: {
    mainnet: "0xfAD0835dAD2985b25ddab17eace356237589E5C7",
    testnet: "0x4398715c8742732F9A4e21664249D120b5436725",
    decimals: 18,
    priceFeedId:
      "0x24f94ac0fd8638e3fc41aab2e4df933e63f763351b640bf336a6ec70651c4503",
  },
  RUNE: {
    mainnet: "0xEAf0191bCa9DD417202cEf2B18B7515ABff1E196",
    testnet: "0xa35575182f5985d6caA1E4e435e7EaF986232ef8",
    decimals: 18,
    priceFeedId:
      "0x5fcf71143bb70d41af4fa9aa1287e2efd3c5911cee59f909f915c9f61baacb1e",
  },
  SEI: {
    mainnet: "0x66fc48720f09Ac386608FB65ede53Bb220D0D5Bc",
    testnet: "0xD0dedf5199616297063C9Ad820F65ecB9d36851E",
    decimals: 18,
    priceFeedId:
      "0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb",
  },
  SHIB: {
    mainnet: "0x69F5F465a46f324Fb7bf3fD7c0D5c00f7165C7Ea",
    testnet: "0x06775cce8ec277b54aD2a85A74Dc4273330dd445",
    decimals: 18,
    priceFeedId:
      "0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a",
  },
  SOL: {
    mainnet: "0x0EA09D97b4084d859328ec4bF8eBCF9ecCA26F1D",
    testnet: "0x537E59ddb03a95cD127870Ef95d87446f0E76A92",
    decimals: 18,
    priceFeedId:
      "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  },
  SUI: {
    mainnet: "0x09F9d7aaa6Bef9598c3b676c0E19C9786Aa566a8",
    testnet: "0x345b046a097C937162116716e6a8449d0D1EFA88",
    decimals: 18,
    priceFeedId:
      "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
  },
  SUSHI: {
    mainnet: "0xdcCDa0cFBEE25B33Ff4Ccca64467E89512511bf6",
    testnet: "0x99CC961612B627C535a82819Ea291800D9E69783",
    decimals: 18,
    priceFeedId:
      "0x26e4f737fde0263a9eea10ae63ac36dcedab2aaf629261a994e1eeb6ee0afe53",
  },
  TRX: {
    mainnet: "0x031A448F59111000b96F016c37e9c71e57845096",
    testnet: "0xA5a6887a19c99D6Cf087B1c8e71539a519b7bFe6",
    decimals: 18,
    priceFeedId:
      "0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b",
  },
  UMA: {
    mainnet: "0xb815Eb8D3a9dA3EdDD926225c0FBD3A566e8C749",
    testnet: "0xC49A8F98B4D7E033bF99008387D2C3fE0Ccc532c",
    decimals: 18,
    priceFeedId:
      "0x4b78d251770732f6304b1f41e9bebaabc3b256985ef18988f6de8d6562dd254c",
  },
  UNI: {
    mainnet: "0x4308427C463CAEAaB50FFf98a9deC569C31E4E87",
    testnet: "0x16665311Ea294747F10380a91f25193D8A9612A4",
    decimals: 18,
    priceFeedId:
      "0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501",
  },
  WLD: {
    mainnet: "0x77DA808032dCdd48077FA7c57afbF088713E09aD",
    testnet: "0xaaEe25Fef392266cC85Ef110Aa098a1A3238E5A5",
    decimals: 18,
    priceFeedId:
      "0xd6835ad1f773de4a378115eb6824bd0c0e42d84d1c84d9750e853fb6b6c7794a",
  },
  XLM: {
    mainnet: "0xfbbBFA96Af2980aE4014d5D5A2eF14bD79B2a299",
    testnet: "0x01d6792DD0456b5bE831c4BD1F107eF524f89495",
    decimals: 18,
    priceFeedId:
      "0xb7a8eba68a997cd0210c2e1e4ee811ad2d174b3611c22d9ebf16f4cb7e9ba850",
  },
  XMR: {
    mainnet: "0x2ea06E73083f1b3314Fa090eaE4a5F70eb058F2e",
    testnet: "0x393650685eE7f9b7aeB01E1b6881540af0d71ffF",
    decimals: 18,
    priceFeedId:
      "0x46b8cc9347f04391764a0361e0b17c3ba394b001e7c304f7650f6376e37c321d",
  },
  XRP: {
    mainnet: "0x6110DF298B411a46d6edce72f5CAca9Ad826C1De",
    testnet: "0x09be72F8DC6E5D327A116087A2b33e0DeC49CDC6",
    decimals: 18,
    priceFeedId:
      "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8",
  },
  XTZ: {
    mainnet: "0xC645A757DD81C69641e010aDD2Da894b4b7Bc921",
    testnet: "0x3707CF43F93fDDE90aC0A06e6c7C052a8e8F335A",
    decimals: 18,
    priceFeedId:
      "0x0affd4b8ad136a21d79bc82450a325ee12ff55a235abc242666e423b8bcffd03",
  },
  YFI: {
    mainnet: "0x6940e7C6125a177b052C662189bb27692E88E9Cb",
    testnet: "0x0A0e4917e67054CdD06d07d12D4a8f623D2d7269",
    decimals: 18,
    priceFeedId:
      "0x425f4b198ab2504936886c1e93511bb6720fbcf2045a4f3c0723bb213846022f",
  },
  ZEC: {
    mainnet: "0xf8aB6B9008f2290965426d3076bC9d2EA835575e",
    testnet: "0xc3beea442B907465C3632Fa7F3C9ee9E2b997994",
    decimals: 18,
    priceFeedId:
      "0xbe9b59d178f0d6a97ab4c343bff2aa69caa1eaae3e9048a65788c529b125bb24",
  },
  ZIL: {
    mainnet: "0x01a43786C2279dC417e7901d45B917afa51ceb9a",
    testnet: "0x96ffa60CA169e648b098aFADCCEec4b8eE455ec4",
    decimals: 18,
    priceFeedId:
      "0x609722f3b6dc10fee07907fe86781d55eb9121cd0705b480954c00695d78f0cb",
  },
  ZRX: {
    mainnet: "0x76BB1Edf0C55eC68f4C8C7fb3C076b811b1a9b9f",
    testnet: "0x92BcE39eC30453b9b1f3FF14207653230e74cDC2",
    decimals: 18,
    priceFeedId:
      "0x7d17b9fe4ea7103be16b6836984fabbc889386d700ca5e5b3d34b7f92e449268",
  },
  PYTH: {
    mainnet: "0x296286ae0b5c066CBcFe46cc4Ffb375bCCAFE640",
    testnet: "0x0d9Ec064105A1B0A95F4C75c56E617CCa6b1931b",
    decimals: 18,
    priceFeedId:
      "0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff",
  },
  FET: {
    mainnet: "0x4272b356e7E406Eeef15E47692f7f4dE86370634",
    testnet: "0x01683A14CC451e46dBDf02050B96735C5FBcf9d3",
    decimals: 18,
    priceFeedId:
      "0xb98e7ae8af2d298d2651eb21ab5b8b5738212e13efb43bd0dfbce7a74ba4b5d0",
  },
  BONK: {
    mainnet: "0xB3422e49dB926f7C5F5d7DaF5F1069Abf1b7E894",
    testnet: "0xBbB5b6C8BaDd8b3B70B6816C65D94e4277614741",
    decimals: 18,
    priceFeedId:
      "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
  },
  TRB: {
    mainnet: "0xbdb26bfb6A229d7f254FAf1B2c744887ec5F1f31",
    testnet: "0xff72A63fAb428545Ee7a6a7bd30323cc1Cc0b30c",
    decimals: 18,
    priceFeedId:
      "0xddcd037c2de8dbf2a0f6eebf1c039924baf7ebf0e7eb3b44bf421af69cc1b06d",
  },
  TIA: {
    mainnet: "0x35B0ed8473e7943d31Ee1eeeAd06C8767034Ce39",
    testnet: "0xd3870Aa7A0950Fa181Ad7b8c244Db390C7c37F1B",
    decimals: 18,
    priceFeedId:
      "0x09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723",
  },
  IMX: {
    mainnet: "0xBBd74c2c8c89D45B822e08fCe400F4DDE99e600b",
    testnet: "0xcE6f7404668089A1d61788BA3d4Bec6480f66aF4",
    decimals: 18,
    priceFeedId:
      "0x941320a8989414874de5aa2fc340a75d5ed91fdff1613dd55f83844d52ea63a2",
  },
  MEME: {
    mainnet: "0x48BeadAB5781aF9C4Fec27AC6c8E0F402F2Cc3D6",
    testnet: "0xa98AA8febE4B61038Df2bc843C7F902faA7Faf8B",
    decimals: 18,
    priceFeedId:
      "0xcd2cee36951a571e035db0dfad138e6ecdb06b517cc3373cd7db5d3609b7927c",
  },
  GRT: {
    mainnet: "0x3f957DF3AB99ff502eE09071dd353bf4352BBEfE",
    testnet: "0x846195Ecd35B602F82429670b7C251C142E8F148",
    decimals: 18,
    priceFeedId:
      "0x4d1f8dae0d96236fb98e8f47471a366ec3b1732b47041781934ca3a9bb2f35e7",
  },
  ANKR: {
    mainnet: "0x90c9B9D7399323FfFe63819788EeD7Cde1e6A78C",
    testnet: "0x33073dCE3717383c157191E3dC3A881C5c51b12d",
    decimals: 18,
    priceFeedId:
      "0x89a58e1cab821118133d6831f5018fba5b354afb78b2d18f575b3cbf69a4f652",
  },
};

const a = [
  {
    name: "DelayedOrderSubmitted",
    inputs: [
      {
        name: "account",
        type: "address",
      },
      { name: "isOffchain", type: "bool" },
      {
        name: "sizeDelta",
        type: "int256",
      },
      {
        name: "targetRoundId",
        type: "uint256",
      },
      {
        name: "intentionTime",
        type: "uint256",
      },
      {
        name: "executableAtTime",
        type: "uint256",
      },
      {
        name: "commitDeposit",
        type: "uint256",
      },
      {
        name: "keeperDeposit",
        type: "uint256",
      },
      {
        name: "trackingCode",
        type: "bytes32",
      },
    ],
  },
];

export const MARKETS = Object.values(MARKET_SYNTHETIX);

export const DEFAULT_AMOUNT = ethers.utils.parseEther("60");

export async function placeOrder({
  account,
  source,
  market,
  signer,
  amount = DEFAULT_AMOUNT,
  leverage = 2,
  isLong = true,
  increase = true,
  chain = "testnet",
}: {
  account: Contract;
  source: string;
  market: string;
  signer: any;
  amount?: BigNumber;
  leverage?: number;
  isLong?: boolean;
  increase?: boolean;
  chain?: "testnet" | "mainnet";
}) {
  const ONE = BigNumber.from(10).pow(18);

  const sign = isLong === increase ? 1 : -1;
  // const executorFee = await account.executorUsdFee(
  //   ethers.utils.parseEther("1").div(5000)
  // );
  // const protocolFee = PROTOCOL_FEE;
  const [priceInfo, { marginRemaining }, { marginAccessible }, position] =
    await multicall(
      perpsV2MarketAbi,
      [
        {
          address: market,
          name: "assetPrice",
          params: [],
        },
        {
          address: market,
          name: "remainingMargin",
          params: [account.address],
        },
        {
          address: market,
          name: "accessibleMargin",
          params: [account.address],
        },
        {
          address: market,
          name: "positions",
          params: [account.address],
        },
      ],
      signer
    );

  // sizeDelta positive
  const acceptablePrice = calculateAcceptablePrice(
    priceInfo.price,
    Number(ethers.utils.formatEther(amount)) / sign > 0
  );

  console.log("price", ethers.utils.formatEther(priceInfo.price));
  console.log("acceptablePrice", ethers.utils.formatEther(acceptablePrice));

  const sizeDelta = amount
    .mul(leverage)
    .mul(ONE)
    .div(priceInfo.price)
    .mul(sign);

  // console.log("availableMargin", ethers.utils.formatEther(availableMargin));
  // console.log("accessibleMargin", ethers.utils.formatEther(marginAccessible));

  const commands = [];
  const inputs = [];

  console.log("account", account.address);

  const markets = Object.values(MARKET_SYNTHETIX).filter((m) => !!m[chain]);

  const openingCalls: Call[] = markets.map((market) => ({
    address: market[chain],
    name: "delayedOrders",
    params: [account.address],
  }));

  const delayedOrders: { sizeDelta: BigNumber }[] = await multicall(
    perpsV2MarketAbi,
    openingCalls,
    signer
  );

  delayedOrders.forEach((delayedOrder, i) => {
    console.log(markets[i][chain], delayedOrder.sizeDelta.toString());
    if (!delayedOrder.sizeDelta.eq(0)) {
      commands.push(Command.PERP_CANCEL_ORDER);
      inputs.push(abi.encode(["address"], [markets[i][chain]]));
    }
  });

  // console.log(delayedOrder.sizeDelta);

  let totalAmount = amount;

  if (!position.size.eq(0)) {
    totalAmount = (position.size as BigNumber)
      .add(sizeDelta)
      .div(leverage)
      .mul(priceInfo.price)
      .div(ONE)
      .abs();
  }

  if (totalAmount.lte(0)) {
    throw Error("Skipped due to insufficient margin for reduction");
  }

  let totalAccessibleMargin = BigNumber.from(0);
  const inputMarkets: string[] = [];
  const calls: Call[] = markets.map((market) => ({
    address: market[chain],
    name: "accessibleMargin",
    params: [account.address],
  }));

  console.log("calls", calls);

  const accessibleMargins: { marginAccessible: BigNumber }[] = await multicall(
    perpsV2MarketAbi,
    calls,
    signer
  );

  accessibleMargins.forEach((m, i) => {
    if (!m.marginAccessible.isZero() && markets[i][chain] !== market) {
      console.log(m.marginAccessible);
      totalAccessibleMargin = totalAccessibleMargin.add(m.marginAccessible);
      inputMarkets.push(markets[i][chain]);
    }
  });

  if (inputMarkets.length) {
    commands.push(Command.PERP_WITHDRAW_ALL_MARGIN);
    inputs.push(
      abi.encode(
        inputMarkets.map((m) => "address"),
        inputMarkets
      )
    );
  }

  console.log("totalAmount", formatEther(totalAmount));
  console.log("marginAccesible", formatEther(marginAccessible));
  console.log("marginRemaining", formatEther(marginRemaining));
  console.log("inputMarkets", inputMarkets);
  console.log("totalAccessibleMargin", formatEther(totalAccessibleMargin));

  const diff = marginRemaining.sub(totalAmount).abs().mul(ONE).div(totalAmount);

  if (diff.gt(ONE.div(100))) {
    const diffAmount = totalAmount.sub(marginRemaining);
    console.log("diffAmount", formatEther(diffAmount));

    let modifyAmount: BigNumber = BigNumber.from(0);
    if (diffAmount.gt(0)) {
      modifyAmount = diffAmount;
    } else if (marginAccessible.gt(0)) {
      modifyAmount = marginAccessible.gt(diffAmount.abs())
        ? diffAmount
        : marginAccessible.mul(-1);
    }
    if (!modifyAmount.eq(0)) {
      if (modifyAmount.gt(0)) {
        // TODO handle decimals
        const availableFund = await account.availableFund();

        console.log("availableFund", formatEther(availableFund));

        if (availableFund.add(totalAccessibleMargin).lt(modifyAmount)) {
          throw Error(
            "The copyWallet fund is insufficient for executing the order"
          );
        }
      }
      commands.push(Command.PERP_MODIFY_COLLATERAL);
      inputs.push(abi.encode(["address", "int256"], [market, modifyAmount]));
    }
    console.log("modifyAmount", formatEther(modifyAmount));
  }

  console.log("sizeDelta", sizeDelta.toString());
  console.log("acceptablePrice", acceptablePrice.toString());
  console.log("market.address", market);

  commands.push(Command.PERP_PLACE_ORDER);
  inputs.push(
    abi.encode(
      ["address", "address", "int256", "uint256"],
      [source, market, sizeDelta, acceptablePrice]
    )
  );
  // if (!increase) {
  //   commands.push(AccountCommand.PERP_MODIFY_MARGIN);
  //   inputs.push(
  //     abi.encode(["address", "int256"], [market.address, amount.mul(-1)])
  //   );
  // }
  return {
    commands,
    inputs,
    sizeDelta,
    price: priceInfo.price,
    acceptablePrice,
  };
}

export async function executeOrder(
  market: Contract,
  chain: "testnet" | "mainnet"
) {
  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  ); // See Hermes endpoints section below for other endpoints

  const priceFeedId =
    MARKETS.find((m) => m[chain] === market.address)?.priceFeedId || "";

  const priceIds = [
    // You can find the ids of prices at https://pyth.network/developers/price-feed-ids#pyth-evm-stable
    // "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD price id
    // "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD price id
    priceFeedId,
  ];

  // In order to use Pyth prices in your protocol you need to submit the price update data to Pyth contract in your target
  // chain. `getPriceFeedsUpdateData` creates the update data which can be submitted to your contract. Then your contract should
  // call the Pyth Contract with this data.
  const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIds);

  // If the user is paying the price update fee, you need to fetch it from the Pyth contract.
  // Please refer to https://docs.pyth.network/documentation/pythnet-price-feeds/on-demand#fees for more information.
  //
  // `pythContract` below is a web3.js contract; if you wish to use ethers, you need to change it accordingly.
  // You can find the Pyth interface ABI in @pythnetwork/pyth-sdk-solidity npm package.
  // const updateFee = await pythContract.methods
  //   .getUpdateFee(priceUpdateData)
  //   .call();

  const tx = await market.executeOffchainDelayedOrder(
    // CONFIG.SMART_WALLET_ADDRESS,
    "0xe3142E19bEaB8b69B3F1267D3C9A91E14C8ead0b",
    priceUpdateData,
    {
      value: 1,
    }
  );
  console.log("executeTx", tx);
}

export async function closeOrder({
  account,
  source,
  market,
  signer,
}: {
  account: Contract;
  source: string;
  market: string;
  signer: any;
}) {
  const [priceInfo, delayedOrder, position] = await multicall(
    perpsV2MarketAbi,
    [
      {
        address: market,
        name: "assetPrice",
        params: [],
      },
      {
        address: market,
        name: "delayedOrders",
        params: [account.address],
      },
      {
        address: market,
        name: "positions",
        params: [account.address],
      },
    ],
    signer
  );

  if (position.size.isZero()) throw Error("No opening position");

  // const price = priceInfo.price

  // sizeDelta negative
  const desiredFillPrice = calculateAcceptablePrice(
    priceInfo.price,
    position.size.gt(0) ? false : true
  );

  const commands = [];
  const inputs = [];

  if (!delayedOrder.sizeDelta.isZero()) {
    commands.push(Command.PERP_CANCEL_ORDER);
    inputs.push(abi.encode(["address"], [market]));
  }

  // console.log("positions", positions.size);

  // const { marginAccessible } = await market.accessibleMargin(account.address);

  // console.log(
  //   "accessibleMargin close",
  //   ethers.utils.formatEther(marginAccessible)
  // );

  // if (marginAccessible.gt(0)) {
  //   commands.push(Command.PERP_WITHDRAW_ALL_MARGIN);
  //   inputs.push(abi.encode(["address"], [market.address]));
  // }

  commands.push(Command.PERP_CLOSE_ORDER);
  inputs.push(
    abi.encode(
      ["address", "address", "uint256"],
      [source, market, desiredFillPrice]
    )
  );
  return {
    commands,
    inputs,
    sizeDelta: position.size.mul(-1),
    desiredFillPrice,
    price: priceInfo.price,
  };
}

export async function withdrawAllFunds({
  account,
  signer,
  chain = "testnet",
}: {
  account: Contract;
  signer: any;
  chain: "testnet" | "mainnet";
}) {
  const availableMargin = await account.availableMargin();
  const commands = [];
  const inputs = [];
  const marketInputs: string[] = [];

  const totalAccessible: BigNumber = BigNumber.from(0);

  const markets = Object.values(MARKET_SYNTHETIX)
    .filter((m) => !!m[chain])
    .map((market) => new Contract(market[chain], perpsV2MarketAbi, signer));

  markets.forEach(async (market) => {
    const { marginAccessible } = await market.accessibleMargin(account.address);
    if (marginAccessible.gt(0)) {
      marketInputs.push(market.address);
      totalAccessible.add(marginAccessible);
    }
  });

  if (marketInputs.length) {
    commands.push(Command.PERP_WITHDRAW_ALL_MARGIN);
    inputs.push(
      abi.encode(
        marketInputs.map((m) => "address"),
        marketInputs
      )
    );
  }

  // console.log("availableMargin", ethers.utils.formatEther(availableMargin));
  // console.log("accessibleMargin", ethers.utils.formatEther(marginAccessible));

  const funds = availableMargin.add(totalAccessible).mul(-1);

  commands.push(Command.OWNER_MODIFY_FUND);
  inputs.push(abi.encode(["int256"], [funds]));

  return {
    commands,
    inputs,
  };
}
