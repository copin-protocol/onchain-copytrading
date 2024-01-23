const DATA = [
  {
    price: 2417.584823928358,
    size: 0.33089750625896086,
    totalCollateral: 80,
    totalSize: 0.33089750625896086,
    fee: 1.399987139961152,
    isLong: true,
    isIncrease: true,
    protocol: "KWENTA",
    txHash:
      "0x17ed45bba1d0436fb418852712da6bf842e0dea3a1a0c31729ca5325237369fd",
    submitTxHash:
      "0xdd4e54232e456675ca8acc4ef97483be3cde17864801c1821d50c67f052e19de",
    settleTxHash:
      "0x07e468de99481f0c17f8168841d32b824a75a4222ff063214a39c2f2cc4fc67b",
    createdAt: "2024-01-19T17:09:01.007Z",
  },
  {
    price: 2418.235273817707,
    size: 0.08628045031394084,
    totalCollateral: 100.82627473872846,
    totalSize: 0.41717795657290174,
    fee: 1.104323953892457,
    isLong: true,
    isIncrease: true,
    protocol: "KWENTA",
    txHash:
      "0x113c2e035bdd94531a0e765474aceb63857a964734f666c46e102493aaf4097d",
    submitTxHash:
      "0x8cd05690ab10b349c396aed73123920b26854ea772e2776111b36a8c0044c204",
    settleTxHash:
      "0xf22e0f7ca3e9ce5bbceecfd180239049fbbb1ad2ac2fd83cef6ea7dc917f1f73",
    createdAt: "2024-01-19T17:11:23.249Z",
  },
  {
    price: 2434.1919473009443,
    size: 0.03496325438000101,
    totalCollateral: 110.04557387526404,
    totalSize: 0.4521412109529027,
    fee: 1.0425543928605785,
    isLong: true,
    isIncrease: true,
    protocol: "KWENTA",
    txHash:
      "0xd5c096fcc3548587cf3985cb5cb2ceea25ec72169e45db14a067ac08cfe9e58d",
    submitTxHash:
      "0xd3010ecae11c071acefdf0f747fd2f937038444dcee2d0c02bebbd7ba7a2247d",
    settleTxHash:
      "0xc7ca48668f0f2cb7ebfed8753dcc8790d63b80938ea51d497e6f89744f593258",
    createdAt: "2024-01-19T17:15:50.056Z",
  },
  {
    price: 2436.1956704959175,
    size: 0.023321588035365083,
    totalCollateral: 115.7890432413203,
    totalSize: 0.4754627989882678,
    fee: 1.028408739022767,
    isLong: true,
    isIncrease: true,
    protocol: "KWENTA",
    txHash:
      "0xbb8a4e3ed27b9b5070cfce28317bf7759e9ab9bc2dd6660617201b99fc587ed8",
    submitTxHash:
      "0x3469b4da251a2b7539fcb2d7c829095e9ce94d1b36e60aae9d521e95084a595d",
    settleTxHash:
      "0x7c5233d43be3f202d4ed34dc493bb7ded3783140fe4c98608ee10fcca78ea314",
    createdAt: "2024-01-19T17:16:33.736Z",
  },
  {
    price: 2435.43341094122,
    size: 0.005833422143130791,
    totalCollateral: 117.24973420429691,
    totalSize: 0.48129622113139864,
    fee: 1.0071042189729664,
    isLong: true,
    isIncrease: true,
    protocol: "KWENTA",
    txHash:
      "0x0418958a850f348095349be343bcfc97cd8b0df646d10d44168d02954dcfed62",
    submitTxHash:
      "0xbff825299a5b63559171b69e7673bd4c7a3cdc3b89c8902efcba6bf4fc9c01a4",
    settleTxHash:
      "0x5312fc44cc50981119c61b8f031249272b0b3ee88e40d4e8a60a6a678fd29eee",
    createdAt: "2024-01-19T17:16:59.436Z",
  },
  {
    price: 2434.327562109647,
    size: 0.011666228852870431,
    totalCollateral: 120.08691846965237,
    totalSize: 0.492962449984269,
    fee: 1.0142004771483333,
    isLong: true,
    isIncrease: true,
    protocol: "KWENTA",
    txHash:
      "0x3ef09983c7c9486b0060ccba005779aabbc30c4b8e744df64add6d7c482eca4a",
    submitTxHash:
      "0x353ed17df582681cb53e563d1e343222702b9ffe8b2e354cd09e1d1f7c677c94",
    settleTxHash:
      "0x4dde34a6a67381539d1716e216438ded8e9409ea525ba0e4c1af505590d1a99b",
    createdAt: "2024-01-19T17:17:29.666Z",
  },
  {
    price: 2441.7288888931657,
    size: 0.492962449984269,
    totalCollateral: 93.13965785703252,
    totalSize: 0.492962449984269,
    fee: 1.601841084308941,
    isLong: true,
    isIncrease: false,
    protocol: "KWENTA",
    txHash:
      "0xbda1d14a81eb95a1cbceae0752d0b2221d2f829fd1f5dd0ae9842cacf88be2ea",
    submitTxHash:
      "0xe7ea66cb01694e5d2f2c2e96eae8f527fb8ed621e757728f7d7fb5f867aa5c9b",
    settleTxHash:
      "0x9aadc03c562f5f03ca15bbd48923f22d6f6ea35d0ece6d3e1eea34e4203ce1ed",
    createdAt: "2024-01-22T01:20:49.724Z",
  },
];

const FEES = DATA.reduce((prev, cur) => (prev += cur.fee), 0);
