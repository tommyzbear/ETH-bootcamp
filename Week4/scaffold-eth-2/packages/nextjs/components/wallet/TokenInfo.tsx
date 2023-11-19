import * as tokenJson from "../../assets/AnyToken.json";
import { useContractRead, useContractWrite } from "wagmi";

export default function TokenInfo(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Voting Token Info</h2>
        <TokenName />
        <TokenBalance address={params.address} />
        <TokenVotes address={params.address} />
      </div>
    </div>
  );
}

function TokenName() {
  const { data, isError, isLoading } = useContractRead({
    address: "0x03944dCDe2742Eb652C98aD341c05f0CDFf9a08A",
    abi: tokenJson.abi,
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token name: {name}</div>;
}

function TokenBalance(params: { address: `${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: "0x03944dCDe2742Eb652C98aD341c05f0CDFf9a08A",
    abi: tokenJson.abi,
    functionName: "balanceOf",
    args: [params.address],
    watch: true,
  });

  const balance = typeof data === "bigint" ? data : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;

  return <div>Balance: {balance.toString()}</div>;
}

function TokenVotes(params: { address: `${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: "0x03944dCDe2742Eb652C98aD341c05f0CDFf9a08A",
    abi: tokenJson.abi,
    functionName: "getVotes",
    args: [params.address],
    watch: true,
  });

  const { data: balanceData } = useContractRead({
    address: "0x03944dCDe2742Eb652C98aD341c05f0CDFf9a08A",
    abi: tokenJson.abi,
    functionName: "balanceOf",
    args: [params.address],
    watch: true,
  });

  const { isLoading: delegateLoading, write } = useContractWrite({
    address: "0x03944dCDe2742Eb652C98aD341c05f0CDFf9a08A",
    abi: tokenJson.abi,
    functionName: "delegate",
    args: [params.address],
  });

  const votes = typeof data === "bigint" ? data : 0;
  const balance = typeof balanceData === "bigint" ? balanceData : 0;
  if (isLoading || delegateLoading) return <div>Fetching votes…</div>;
  if (isError) return <div>Error fetching votes</div>;

  if (!votes || votes < balance)
    return (
      <button className="btn btn-active btn-neutral" disabled={delegateLoading} onClick={() => write()}>
        {delegateLoading ? "Delegating...." : "Self-delegation"}
      </button>
    );

  return <div>Votes: {votes.toString()}</div>;
}
