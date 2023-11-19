import RequestTokens from "./RequestTokens";
import TokenAddressFromApi from "./TokenAddressFromApi";

export default function ApiData(params: { address: `0x${string}` }) {
  console.log(params.address);
  return (
    <div className="card max-w-full bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Mint token to wallet</h2>
        <TokenAddressFromApi />
        <RequestTokens address={params.address} />
      </div>
    </div>
  );
}
