import BettingInfo from "./BettingInfo";
import LotteryInfo from "./LotteryInfo";
import WalletBalance from "./WalletBalance";
import { useAccount, useNetwork } from "wagmi";

export default function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  if (address)
    return (
      <div className="flex items-center flex-col flex-grow">
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <LotteryInfo address={address as `0x${string}`}></LotteryInfo>
        <BettingInfo address={address as `0x${string}`}></BettingInfo>
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
