import * as lotteryJson from "../../assets/Lottery.json";
import BettingInfo from "./BettingInfo";
import LotteryInfo from "./LotteryInfo";
import WalletBalance from "./WalletBalance";
import { useAccount, useContractRead, useNetwork } from "wagmi";

export default function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { data: isBetsOpen } = useContractRead({
    address: "0x58B710aA0CA08D1B42db5e7e73D7CA4CCD07A997",
    abi: lotteryJson.abi,
    functionName: "betsOpen",
    watch: true,
  });

  if (address)
    return (
      <div className="flex items-center flex-col flex-grow">
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletBalance address={address as `0x${string}`} />
        <LotteryInfo address={address as `0x${string}`} />
        {isBetsOpen ? <BettingInfo address={address as `0x${string}`} /> : <></>}
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}
