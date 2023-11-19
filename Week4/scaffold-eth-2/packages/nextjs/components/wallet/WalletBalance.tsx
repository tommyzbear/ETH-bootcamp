import { ethers } from "ethers";
import { useBalance } from "wagmi";

export default function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Wallet balance</h2>
        Balance: {ethers.data?.formatted} {data?.symbol}
      </div>
    </div>
  );
}
