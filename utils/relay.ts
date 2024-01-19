import { Defender } from "@openzeppelin/defender-sdk";
import { RELAYER_API_KEY, RELAYER_API_SECRET } from "./constants";

export const getRelaySigner = () => {
  const credentials = {
    relayerApiKey: RELAYER_API_KEY,
    relayerApiSecret: RELAYER_API_SECRET,
  };
  const client = new Defender(credentials);
  const provider = client.relaySigner.getProvider();
  const signer = client.relaySigner.getSigner(provider, {
    speed: "fast",
    validForSeconds: 120,
  });
  return signer;
};
