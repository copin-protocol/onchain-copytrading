import { Contract } from "ethers";
import { Interface } from "ethers/lib/utils";
import multicallAbi from "./abis/multicallAbi";

export interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (example: balanceOf)
  params?: any[]; // Function params
}

export const multicall = async (abi: any[], calls: Call[], signer: any) => {
  const multi = new Contract(
    "0xcA11bde05977b3631167028862bE2a173976CA11",
    multicallAbi,
    signer
  );

  const itf = new Interface(abi);

  const calldata = calls.map((call) => ({
    target: call.address.toLowerCase(),
    callData: itf.encodeFunctionData(call.name, call.params),
  }));
  const { returnData } = await multi.aggregate(calldata);

  const res = returnData.map((call: any, i: number) =>
    itf.decodeFunctionResult(calls[i].name, call)
  );

  return res as any;
};
