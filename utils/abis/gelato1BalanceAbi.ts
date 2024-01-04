export default [
  {
    inputs: [{ internalType: "address", name: "_sponsor", type: "address" }],
    name: "depositNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sponsor", type: "address" },
      { internalType: "contract IERC20", name: "_token", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "depositToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
