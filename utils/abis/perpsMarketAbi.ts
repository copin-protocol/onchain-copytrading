export default [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "which",
        type: "bytes32",
      },
    ],
    name: "FeatureUnavailable",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "InvalidAccountId",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
    ],
    name: "InvalidPermission",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "origin",
        type: "address",
      },
    ],
    name: "OnlyAccountTokenProxy",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "PermissionDenied",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "PermissionNotGranted",
    type: "error",
  },
  {
    inputs: [],
    name: "PositionOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "ValueAlreadyInSet",
    type: "error",
  },
  {
    inputs: [],
    name: "ValueNotInSet",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "AccountCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "PermissionGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "PermissionRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "createAccount",
    outputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getAccountLastInteraction",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getAccountOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getAccountPermissions",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "bytes32[]",
            name: "permissions",
            type: "bytes32[]",
          },
        ],
        internalType: "struct IAccountModule.AccountPermissions[]",
        name: "accountPerms",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAccountTokenAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "grantPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasPermission",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isAuthorized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "notifyAccountTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
    ],
    name: "renouncePermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "permission",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "revokePermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "expected",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "actual",
        type: "bytes32",
      },
    ],
    name: "MismatchAssociatedSystemKind",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "MissingAssociatedSystem",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "Unauthorized",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "kind",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "impl",
        type: "address",
      },
    ],
    name: "AssociatedSystemSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "getAssociatedSystem",
    outputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "kind",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
      {
        internalType: "address",
        name: "impl",
        type: "address",
      },
    ],
    name: "initOrUpgradeNft",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "impl",
        type: "address",
      },
    ],
    name: "initOrUpgradeToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "endpoint",
        type: "address",
      },
    ],
    name: "registerUnmanagedSystem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "ImplementationIsSterile",
    type: "error",
  },
  {
    inputs: [],
    name: "NoChange",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contr",
        type: "address",
      },
    ],
    name: "NotAContract",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "NotNominated",
    type: "error",
  },
  {
    inputs: [],
    name: "UpgradeSimulationFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerNominated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "self",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newNominatedOwner",
        type: "address",
      },
    ],
    name: "nominateNewOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nominatedOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceNomination",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "simulateUpgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "InvalidMarket",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "parameter",
        type: "string",
      },
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "InvalidParameter",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowInt256ToUint256",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowUint256ToInt256",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowUint256ToUint128",
    type: "error",
  },
  {
    inputs: [],
    name: "PerpsMarketAlreadyInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "PerpsMarketNotInitialized",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint128",
        name: "globalPerpsMarketId",
        type: "uint128",
      },
    ],
    name: "FactoryInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "perpsMarketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "string",
        name: "marketName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "marketSymbol",
        type: "string",
      },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "requestedMarketId",
        type: "uint128",
      },
      {
        internalType: "string",
        name: "marketName",
        type: "string",
      },
      {
        internalType: "string",
        name: "marketSymbol",
        type: "string",
      },
    ],
    name: "createMarket",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ISynthetixSystem",
        name: "synthetix",
        type: "address",
      },
      {
        internalType: "contract ISpotMarketSystem",
        name: "spotMarket",
        type: "address",
      },
      {
        internalType: "string",
        name: "marketName",
        type: "string",
      },
    ],
    name: "initializeFactory",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "perpsMarketId",
        type: "uint128",
      },
    ],
    name: "minimumCredit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "perpsMarketId",
        type: "uint128",
      },
    ],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "perpsMarketId",
        type: "uint128",
      },
    ],
    name: "reportedDebt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "marketName",
        type: "string",
      },
    ],
    name: "setPerpsMarketName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "AccountLiquidatable",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "AccountNotFound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
    ],
    name: "InsufficientCollateral",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "availableUsdDenominated",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredUsdDenominated",
        type: "uint256",
      },
    ],
    name: "InsufficientCollateralAvailableForWithdraw",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
    ],
    name: "InsufficientSynthCollateral",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "amountDelta",
        type: "int256",
      },
    ],
    name: "InvalidAmountDelta",
    type: "error",
  },
  {
    inputs: [],
    name: "KeeperCostsNotSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "maxAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
    ],
    name: "MaxCollateralExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "maxCollateralsPerAccount",
        type: "uint128",
      },
    ],
    name: "MaxCollateralsPerAccountReached",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowUint128ToInt128",
    type: "error",
  },
  {
    inputs: [],
    name: "PendingOrderExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "PriceFeedNotSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
    ],
    name: "SynthNotEnabledForCollateral",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "amountDelta",
        type: "int256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "CollateralModified",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getAccountCollateralIds",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getAccountOpenPositions",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getAvailableMargin",
    outputs: [
      {
        internalType: "int256",
        name: "availableMargin",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
    ],
    name: "getCollateralAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getOpenPosition",
    outputs: [
      {
        internalType: "int256",
        name: "totalPnl",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "accruedFunding",
        type: "int256",
      },
      {
        internalType: "int128",
        name: "positionSize",
        type: "int128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getRequiredMargins",
    outputs: [
      {
        internalType: "uint256",
        name: "requiredInitialMargin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredMaintenanceMargin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLiquidationReward",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getWithdrawableMargin",
    outputs: [
      {
        internalType: "int256",
        name: "withdrawableMargin",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        internalType: "int256",
        name: "amountDelta",
        type: "int256",
      },
    ],
    name: "modifyCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "totalAccountOpenInterest",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "totalCollateralValue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "currentFundingRate",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "currentFundingVelocity",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "int128",
        name: "orderSize",
        type: "int128",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "fillPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getMarketSummary",
    outputs: [
      {
        components: [
          {
            internalType: "int256",
            name: "skew",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "size",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxOpenInterest",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "currentFundingRate",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "currentFundingVelocity",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "indexPrice",
            type: "uint256",
          },
        ],
        internalType: "struct IPerpsMarketModule.MarketSummary",
        name: "summary",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "indexPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "maxOpenInterest",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "metadata",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "size",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "skew",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fillPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
    ],
    name: "AcceptablePriceExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "availableMargin",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "minMargin",
        type: "uint256",
      },
    ],
    name: "InsufficientMargin",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "settlementStrategyId",
        type: "uint256",
      },
    ],
    name: "InvalidSettlementStrategy",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "maxMarketSize",
        type: "uint256",
      },
      {
        internalType: "int256",
        name: "newSideSize",
        type: "int256",
      },
    ],
    name: "MaxOpenInterestReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "maxPositionsPerAccount",
        type: "uint128",
      },
    ],
    name: "MaxPositionsPerAccountReached",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowInt256ToInt128",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroSizeOrder",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "enum SettlementStrategy.Type",
        name: "orderType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "sizeDelta",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "commitmentTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expectedPriceTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "settlementTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expirationTime",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "trackingCode",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "OrderCommitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "sizeDelta",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "commitmentTime",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "trackingCode",
        type: "bytes32",
      },
    ],
    name: "PreviousOrderExpired",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint128",
            name: "marketId",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "accountId",
            type: "uint128",
          },
          {
            internalType: "int128",
            name: "sizeDelta",
            type: "int128",
          },
          {
            internalType: "uint128",
            name: "settlementStrategyId",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "acceptablePrice",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "trackingCode",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "referrer",
            type: "address",
          },
        ],
        internalType: "struct AsyncOrder.OrderCommitmentRequest",
        name: "commitment",
        type: "tuple",
      },
    ],
    name: "commitOrder",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "commitmentTime",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint128",
                name: "marketId",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "accountId",
                type: "uint128",
              },
              {
                internalType: "int128",
                name: "sizeDelta",
                type: "int128",
              },
              {
                internalType: "uint128",
                name: "settlementStrategyId",
                type: "uint128",
              },
              {
                internalType: "uint256",
                name: "acceptablePrice",
                type: "uint256",
              },
              {
                internalType: "bytes32",
                name: "trackingCode",
                type: "bytes32",
              },
              {
                internalType: "address",
                name: "referrer",
                type: "address",
              },
            ],
            internalType: "struct AsyncOrder.OrderCommitmentRequest",
            name: "request",
            type: "tuple",
          },
        ],
        internalType: "struct AsyncOrder.Data",
        name: "retOrder",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "fees",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "int128",
        name: "sizeDelta",
        type: "int128",
      },
    ],
    name: "computeOrderFees",
    outputs: [
      {
        internalType: "uint256",
        name: "orderFees",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fillPrice",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "getOrder",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "commitmentTime",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint128",
                name: "marketId",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "accountId",
                type: "uint128",
              },
              {
                internalType: "int128",
                name: "sizeDelta",
                type: "int128",
              },
              {
                internalType: "uint128",
                name: "settlementStrategyId",
                type: "uint128",
              },
              {
                internalType: "uint256",
                name: "acceptablePrice",
                type: "uint256",
              },
              {
                internalType: "bytes32",
                name: "trackingCode",
                type: "bytes32",
              },
              {
                internalType: "address",
                name: "referrer",
                type: "address",
              },
            ],
            internalType: "struct AsyncOrder.OrderCommitmentRequest",
            name: "request",
            type: "tuple",
          },
        ],
        internalType: "struct AsyncOrder.Data",
        name: "order",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "int128",
        name: "sizeDelta",
        type: "int128",
      },
    ],
    name: "requiredMarginForOrder",
    outputs: [
      {
        internalType: "uint256",
        name: "requiredMargin",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "leftover",
        type: "uint256",
      },
    ],
    name: "InsufficientAccountMargin",
    type: "error",
  },
  {
    inputs: [],
    name: "OrderNotValid",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowInt128ToUint128",
    type: "error",
  },
  {
    inputs: [],
    name: "OverflowUint256ToUint64",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "enum SettlementStrategy.Type",
        name: "strategyType",
        type: "uint8",
      },
    ],
    name: "SettlementStrategyNotFound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "settlementTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "settlementExpiration",
        type: "uint256",
      },
    ],
    name: "SettlementWindowExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "settlementTime",
        type: "uint256",
      },
    ],
    name: "SettlementWindowNotOpen",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "account",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "CollateralDeducted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "skew",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "sizeDelta",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "currentFundingRate",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "currentFundingVelocity",
        type: "int256",
      },
    ],
    name: "MarketUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fillPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "pnl",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "accruedFunding",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "sizeDelta",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "newSize",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "referralFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collectedFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "settlementReward",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "trackingCode",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "settler",
        type: "address",
      },
    ],
    name: "OrderSettled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "settleOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fillPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
    ],
    name: "AcceptablePriceNotExceeded",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "desiredPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fillPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "sizeDelta",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "settlementReward",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "trackingCode",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "settler",
        type: "address",
      },
    ],
    name: "OrderCancelled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowAll",
        type: "bool",
      },
    ],
    name: "FeatureFlagAllowAllSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "FeatureFlagAllowlistAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "FeatureFlagAllowlistRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "deniers",
        type: "address[]",
      },
    ],
    name: "FeatureFlagDeniersReset",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "denyAll",
        type: "bool",
      },
    ],
    name: "FeatureFlagDenyAllSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "addToFeatureFlagAllowlist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
    ],
    name: "getDeniers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
    ],
    name: "getFeatureFlagAllowAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
    ],
    name: "getFeatureFlagAllowlist",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
    ],
    name: "getFeatureFlagDenyAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isFeatureAllowed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "removeFromFeatureFlagAllowlist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        internalType: "address[]",
        name: "deniers",
        type: "address[]",
      },
    ],
    name: "setDeniers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "allowAll",
        type: "bool",
      },
    ],
    name: "setFeatureFlagAllowAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "feature",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "denyAll",
        type: "bool",
      },
    ],
    name: "setFeatureFlagDenyAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "NotEligibleForLiquidation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "fullLiquidation",
        type: "bool",
      },
    ],
    name: "AccountLiquidationAttempt",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountLiquidated",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "currentPositionSize",
        type: "int128",
      },
    ],
    name: "PositionLiquidated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "canLiquidate",
    outputs: [
      {
        internalType: "bool",
        name: "isEligible",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "flaggedAccounts",
    outputs: [
      {
        internalType: "uint256[]",
        name: "accountIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "accountId",
        type: "uint128",
      },
    ],
    name: "liquidate",
    outputs: [
      {
        internalType: "uint256",
        name: "liquidationReward",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxNumberOfAccounts",
        type: "uint256",
      },
    ],
    name: "liquidateFlagged",
    outputs: [
      {
        internalType: "uint256",
        name: "liquidationReward",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128[]",
        name: "accountIds",
        type: "uint128[]",
      },
    ],
    name: "liquidateFlaggedAccounts",
    outputs: [
      {
        internalType: "uint256",
        name: "liquidationReward",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "liquidationCapacity",
    outputs: [
      {
        internalType: "uint256",
        name: "capacity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLiquidationInWindow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "latestLiquidationTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
    ],
    name: "InvalidSettlementWindowDuration",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "skewScale",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxFundingVelocity",
        type: "uint256",
      },
    ],
    name: "FundingParametersSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "initialMarginRatioD18",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maintenanceMarginRatioD18",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minimumInitialMarginRatioD18",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "flagRewardRatioD18",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minimumPositionMargin",
        type: "uint256",
      },
    ],
    name: "LiquidationParametersSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lockedOiRatioD18",
        type: "uint256",
      },
    ],
    name: "LockedOiRatioSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "feedId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "strictStalenessTolerance",
        type: "uint256",
      },
    ],
    name: "MarketPriceDataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxLiquidationLimitAccumulationMultiplier",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxSecondsInLiquidationWindow",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxLiquidationPd",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "endorsedLiquidator",
        type: "address",
      },
    ],
    name: "MaxLiquidationParametersSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxMarketSize",
        type: "uint256",
      },
    ],
    name: "MaxMarketSizeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "makerFeeRatio",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "takerFeeRatio",
        type: "uint256",
      },
    ],
    name: "OrderFeesSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        components: [
          {
            internalType: "enum SettlementStrategy.Type",
            name: "strategyType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "settlementDelay",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "settlementWindowDuration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "priceVerificationContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "feedId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "settlementReward",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "disabled",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "commitmentPriceDelay",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct SettlementStrategy.Data",
        name: "strategy",
        type: "tuple",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "strategyId",
        type: "uint256",
      },
    ],
    name: "SettlementStrategyAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "strategyId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "enum SettlementStrategy.Type",
            name: "strategyType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "settlementDelay",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "settlementWindowDuration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "priceVerificationContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "feedId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "settlementReward",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "disabled",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "commitmentPriceDelay",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct SettlementStrategy.Data",
        name: "strategy",
        type: "tuple",
      },
    ],
    name: "SettlementStrategySet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        components: [
          {
            internalType: "enum SettlementStrategy.Type",
            name: "strategyType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "settlementDelay",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "settlementWindowDuration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "priceVerificationContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "feedId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "settlementReward",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "disabled",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "commitmentPriceDelay",
            type: "uint256",
          },
        ],
        internalType: "struct SettlementStrategy.Data",
        name: "strategy",
        type: "tuple",
      },
    ],
    name: "addSettlementStrategy",
    outputs: [
      {
        internalType: "uint256",
        name: "strategyId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getFundingParameters",
    outputs: [
      {
        internalType: "uint256",
        name: "skewScale",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxFundingVelocity",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getLiquidationParameters",
    outputs: [
      {
        internalType: "uint256",
        name: "initialMarginRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumInitialMarginRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maintenanceMarginScalarD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "flagRewardRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumPositionMargin",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getLockedOiRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getMaxLiquidationParameters",
    outputs: [
      {
        internalType: "uint256",
        name: "maxLiquidationLimitAccumulationMultiplier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxSecondsInLiquidationWindow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLiquidationPd",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "endorsedLiquidator",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getMaxMarketSize",
    outputs: [
      {
        internalType: "uint256",
        name: "maxMarketSize",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
    ],
    name: "getOrderFees",
    outputs: [
      {
        internalType: "uint256",
        name: "makerFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "takerFee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "perpsMarketId",
        type: "uint128",
      },
    ],
    name: "getPriceData",
    outputs: [
      {
        internalType: "bytes32",
        name: "feedId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "strictStalenessTolerance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "strategyId",
        type: "uint256",
      },
    ],
    name: "getSettlementStrategy",
    outputs: [
      {
        components: [
          {
            internalType: "enum SettlementStrategy.Type",
            name: "strategyType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "settlementDelay",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "settlementWindowDuration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "priceVerificationContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "feedId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "settlementReward",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "disabled",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "commitmentPriceDelay",
            type: "uint256",
          },
        ],
        internalType: "struct SettlementStrategy.Data",
        name: "settlementStrategy",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "skewScale",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxFundingVelocity",
        type: "uint256",
      },
    ],
    name: "setFundingParameters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "initialMarginRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumInitialMarginRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maintenanceMarginScalarD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "flagRewardRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumPositionMargin",
        type: "uint256",
      },
    ],
    name: "setLiquidationParameters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "lockedOiRatioD18",
        type: "uint256",
      },
    ],
    name: "setLockedOiRatio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "maxLiquidationLimitAccumulationMultiplier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxSecondsInLiquidationWindow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxLiquidationPd",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "endorsedLiquidator",
        type: "address",
      },
    ],
    name: "setMaxLiquidationParameters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "maxMarketSize",
        type: "uint256",
      },
    ],
    name: "setMaxMarketSize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "makerFeeRatio",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "takerFeeRatio",
        type: "uint256",
      },
    ],
    name: "setOrderFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "strategyId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "enum SettlementStrategy.Type",
            name: "strategyType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "settlementDelay",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "settlementWindowDuration",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "priceVerificationContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "feedId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "settlementReward",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "disabled",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "commitmentPriceDelay",
            type: "uint256",
          },
        ],
        internalType: "struct SettlementStrategy.Data",
        name: "strategy",
        type: "tuple",
      },
    ],
    name: "setSettlementStrategy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "marketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "strategyId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "setSettlementStrategyEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "perpsMarketId",
        type: "uint128",
      },
      {
        internalType: "bytes32",
        name: "feedId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "strictStalenessTolerance",
        type: "uint256",
      },
    ],
    name: "updatePriceData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "invalidFeeCollector",
        type: "address",
      },
    ],
    name: "InvalidFeeCollectorInterface",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "shareRatioD18",
        type: "uint256",
      },
    ],
    name: "InvalidReferrerShareRatio",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxCollateralAmount",
        type: "uint256",
      },
    ],
    name: "CollateralConfigurationSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "feeCollector",
        type: "address",
      },
    ],
    name: "FeeCollectorSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "keeperCostNodeId",
        type: "bytes32",
      },
    ],
    name: "KeeperCostNodeIdUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "minKeeperRewardUsd",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minKeeperProfitRatioD18",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxKeeperRewardUsd",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxKeeperScalingRatioD18",
        type: "uint256",
      },
    ],
    name: "KeeperRewardGuardsSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint128",
        name: "maxPositionsPerAccount",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "maxCollateralsPerAccount",
        type: "uint128",
      },
    ],
    name: "PerAccountCapsSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shareRatioD18",
        type: "uint256",
      },
    ],
    name: "ReferrerShareUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint128[]",
        name: "newSynthDeductionPriority",
        type: "uint128[]",
      },
    ],
    name: "SynthDeductionPrioritySet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
    ],
    name: "getCollateralConfiguration",
    outputs: [
      {
        internalType: "uint256",
        name: "maxCollateralAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFeeCollector",
    outputs: [
      {
        internalType: "address",
        name: "feeCollector",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getKeeperCostNodeId",
    outputs: [
      {
        internalType: "bytes32",
        name: "keeperCostNodeId",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getKeeperRewardGuards",
    outputs: [
      {
        internalType: "uint256",
        name: "minKeeperRewardUsd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minKeeperProfitRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxKeeperRewardUsd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxKeeperScalingRatioD18",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMarkets",
    outputs: [
      {
        internalType: "uint256[]",
        name: "marketIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPerAccountCaps",
    outputs: [
      {
        internalType: "uint128",
        name: "maxPositionsPerAccount",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "maxCollateralsPerAccount",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "referrer",
        type: "address",
      },
    ],
    name: "getReferrerShare",
    outputs: [
      {
        internalType: "uint256",
        name: "shareRatioD18",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSupportedCollaterals",
    outputs: [
      {
        internalType: "uint256[]",
        name: "supportedCollaterals",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSynthDeductionPriority",
    outputs: [
      {
        internalType: "uint128[]",
        name: "",
        type: "uint128[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "synthMarketId",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "maxCollateralAmount",
        type: "uint256",
      },
    ],
    name: "setCollateralConfiguration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "feeCollector",
        type: "address",
      },
    ],
    name: "setFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minKeeperRewardUsd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minKeeperProfitRatioD18",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxKeeperRewardUsd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxKeeperScalingRatioD18",
        type: "uint256",
      },
    ],
    name: "setKeeperRewardGuards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "maxPositionsPerAccount",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "maxCollateralsPerAccount",
        type: "uint128",
      },
    ],
    name: "setPerAccountCaps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128[]",
        name: "newSynthDeductionPriority",
        type: "uint128[]",
      },
    ],
    name: "setSynthDeductionPriority",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalGlobalCollateralValue",
    outputs: [
      {
        internalType: "uint256",
        name: "totalCollateralValue",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "keeperCostNodeId",
        type: "bytes32",
      },
    ],
    name: "updateKeeperCostNodeId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "shareRatioD18",
        type: "uint256",
      },
    ],
    name: "updateReferrerShare",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
