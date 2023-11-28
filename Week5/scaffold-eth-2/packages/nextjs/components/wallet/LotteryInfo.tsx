import { useEffect, useState } from "react";
import * as lotteryJson from "../../assets/Lottery.json";
import * as tokenJson from "../../assets/LotteryToken.json";
import { ethers } from "ethers";
import { useBlockNumber, useContractRead, useContractWrite } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";

export default function LotteryInfo(params: { address: `0x${string}` }) {
  const { data: ownerAddress } = useContractRead({
    address: "0x58B710aA0CA08D1B42db5e7e73D7CA4CCD07A997",
    abi: lotteryJson.abi,
    functionName: "owner",
    watch: true,
  });

  return (
    <div className="card w-full bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Lottery Info</h2>
        <TokenName />
        <TokenBalance address={params.address} />
        <Lottery address={params.address} ownerAddress={ownerAddress} />
        <WithdrawFee address={params.address} ownerAddress={ownerAddress} />
      </div>
    </div>
  );
}

function TokenName() {
  const { data, isError, isLoading } = useContractRead({
    address: "0xB7E6098f1CB1d8DdC2cD0c5454dE829Bf7271E96",
    abi: tokenJson.abi,
    functionName: "symbol",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token: {name}</div>;
}

function TokenBalance(params: { address: `${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: "0xB7E6098f1CB1d8DdC2cD0c5454dE829Bf7271E96",
    abi: tokenJson.abi,
    functionName: "balanceOf",
    args: [params.address],
    watch: true,
  });

  const balance = typeof data === "bigint" ? data : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;

  return <div>Balance: {ethers.formatEther(balance)}</div>;
}

function Lottery(params: { address: `0x${string}`; ownerAddress: string }) {
  const provider = new ethers.AlchemyProvider("sepolia", scaffoldConfig.alchemyApiKey);
  const lotteryAddress = "0x58B710aA0CA08D1B42db5e7e73D7CA4CCD07A997";
  const [closingDate, setClosingDate] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [duration, setDuration] = useState(0);
  const [blockTimestamp, setBlockTimestamp] = useState(0);
  const { data: isBetsOpen } = useContractRead({
    address: lotteryAddress,
    abi: lotteryJson.abi,
    functionName: "betsOpen",
    watch: true,
  });

  const { data: closingBlockTime } = useContractRead({
    address: lotteryAddress,
    abi: lotteryJson.abi,
    functionName: "betsClosingTime",
    watch: true,
  });

  const { isLoading: opening, write: openBets } = useContractWrite({
    address: lotteryAddress,
    abi: lotteryJson.abi,
    functionName: "openBets",
    args: [Number(blockTimestamp) + Number(duration)],
  });

  const { isLoading: closing, write: closeLottery } = useContractWrite({
    address: lotteryAddress,
    abi: lotteryJson.abi,
    functionName: "closeLottery",
  });

  const { data: blockNumber } = useBlockNumber();

  useEffect(() => {
    const end = new Date(Number(closingBlockTime));
    console.log(closingBlockTime);
    setClosingDate(end.toLocaleDateString());
    setClosingTime(end.toLocaleTimeString());
  }, [closingTime]);

  useEffect(() => {
    const getBlockTimestamp = async () => {
      const timestamp = (await provider.getBlock(blockNumber))?.timestamp;
      console.log(timestamp);
      setBlockTimestamp(timestamp);
    };

    getBlockTimestamp();
  }, [blockNumber]);

  return (
    <>
      <div>{`Lottery Contract: ${lotteryAddress}`}</div>
      <>Lottery State: {isBetsOpen ? "Open" : "Closed"}</>
      {isBetsOpen ? (
        <>
          Lottery should close at {closingDate} : {closingTime}
        </>
      ) : (
        <></>
      )}
      {!isBetsOpen && params.address === params.ownerAddress ? (
        <button
          className="btn btn-active btn-neutral"
          disabled={opening}
          onClick={() => {
            document.getElementById(`open_bet_modal`).showModal();
          }}
        >
          Open Bet
        </button>
      ) : (
        <></>
      )}
      {isBetsOpen &&
      Math.floor(Date.now() / 1000) > Number(closingBlockTime) &&
      params.address === params.ownerAddress ? (
        <button className="btn btn-active btn-warning" onClick={() => closeLottery()} disabled={closing}>
          Close Bet
        </button>
      ) : (
        <></>
      )}

      <dialog id={`open_bet_modal`} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Bet Duration (s)</h3>
          <input
            type="number"
            placeholder="i.e. 1200"
            className="input input-bordered w-full max-w-xs"
            value={duration}
            onChange={e => {
              setDuration(e.target.value);
            }}
          />
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn" onClick={() => openBets()}>
                Submit
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}

function WithdrawFee(params: { address: `0x${string}`; ownerAddress: string }) {
  const { data: fees } = useContractRead({
    address: "0x58B710aA0CA08D1B42db5e7e73D7CA4CCD07A997",
    abi: lotteryJson.abi,
    functionName: "ownerPool",
    watch: true,
  });

  const { write: withdrawFee } = useContractWrite({
    address: "0x58B710aA0CA08D1B42db5e7e73D7CA4CCD07A997",
    abi: lotteryJson.abi,
    functionName: "ownerWithdraw",
    args: [fees],
  });

  return (
    <>
      {params.address === params.ownerAddress ? (
        <button className="btn btn-active btn-accent" onClick={() => withdrawFee()} disabled={fees <= 0}>
          Redeem Fees
        </button>
      ) : (
        <></>
      )}
    </>
  );
}
