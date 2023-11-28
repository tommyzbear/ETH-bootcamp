import { useState } from "react";
import * as lotteryJson from "../../assets/Lottery.json";
import * as tokenJson from "../../assets/LotteryToken.json";
import { ethers } from "ethers";
import { useContractRead, useContractWrite } from "wagmi";

export default function BettingInfo(params: { address: `0x${string}` }) {
  const { data: symbol } = useContractRead({
    address: "0x8505f923505095792b2b954471C05527C09825D9",
    abi: tokenJson.abi,
    functionName: "symbol",
  });

  const { data: prize } = useContractRead({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "prize",
    args: [params.address],
    watch: true,
  });

  return (
    <div className="card w-full bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Betting Info</h2>
        <Lottery prize={prize} />
        <TokenSwap symbol={symbol} address={params.address} />
        <PlaceBet symbol={symbol} address={params.address} prize={prize} />
      </div>
    </div>
  );
}

function TokenSwap(params: { symbol: string; address: `0x${string}` }) {
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);

  const { data: purchaseRatio } = useContractRead({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "purchaseRatio",
  });

  const { isLoading: buying, write: buyToken } = useContractWrite({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "purchaseTokens",
    value: buyAmount.toString() === "" ? 0n : ethers.parseUnits((buyAmount / Number(purchaseRatio)).toString()),
  });

  console.log((buyAmount / Number(purchaseRatio)).toString());

  const { isLoading: selling, write: sellToken } = useContractWrite({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "returnTokens",
    args: [sellAmount.toString() === "" ? 0n : ethers.parseUnits(sellAmount.toString())],
  });

  const { write: approve } = useContractWrite({
    address: "0x8505f923505095792b2b954471C05527C09825D9",
    abi: tokenJson.abi,
    functionName: "approve",
    args: [
      "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
      sellAmount.toString() === "" ? 0n : ethers.parseUnits(sellAmount.toString()),
    ],
  });

  const { data: allowance } = useContractRead({
    address: "0x8505f923505095792b2b954471C05527C09825D9",
    abi: tokenJson.abi,
    functionName: "allowance",
    args: [params.address, "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5"],
  });

  return (
    <div>
      <div className="grid grid-cols-2">
        <div>
          <button
            className="btn btn-active btn-neutral"
            disabled={buying}
            onClick={() => {
              document.getElementById(`open_buy_modal`).showModal();
            }}
          >
            Buy Token
          </button>
          <dialog id={`open_buy_modal`} className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                Buy token (1 ETH : {Number(purchaseRatio)} {params.symbol})
              </h3>
              <input
                type="number"
                placeholder="i.e. 1200"
                className="input input-bordered w-full max-w-xs"
                value={buyAmount}
                onChange={e => {
                  setBuyAmount(e.target.value);
                  console.log(buyAmount);
                }}
              />
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn" onClick={() => buyToken()}>
                    Submit
                  </button>
                </form>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
        <div className="grid justify-items-end">
          <button
            className="btn btn-active btn-neutral"
            disabled={selling}
            onClick={() => {
              document.getElementById(`open_sell_modal`).showModal();
            }}
          >
            Redeem ETH
          </button>
          <dialog id={`open_sell_modal`} className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                Sell token (1 / {Number(purchaseRatio)} ETH : 1 {params.symbol})
              </h3>
              <input
                type="number"
                placeholder="i.e. 1200"
                className="input input-bordered w-full max-w-xs"
                value={sellAmount}
                onChange={e => {
                  setSellAmount(e.target.value);
                }}
              />
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button
                    className="btn"
                    onClick={() => {
                      if (allowance >= ethers.parseUnits(sellAmount.toString())) {
                        sellToken();
                      } else {
                        approve();
                      }
                    }}
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
  );
}

function PlaceBet(params: { symbol: string; address: `0x${string}`; prize: bigint }) {
  const [betNumber, setBetNumber] = useState(0);
  const { data: betPrice } = useContractRead({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "betPrice",
  });

  const { isLoading: betting, write: placeBet } = useContractWrite({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "betMany",
    args: [betNumber.toString() === "" ? 0n : ethers.parseUnits(betNumber.toString())],
  });

  const { write: redeemPrize } = useContractWrite({
    address: "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
    abi: lotteryJson.abi,
    functionName: "prizeWithdraw",
    args: [params.prize],
  });

  const { data: allowance } = useContractRead({
    address: "0x8505f923505095792b2b954471C05527C09825D9",
    abi: tokenJson.abi,
    functionName: "allowance",
    args: [params.address, "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5"],
  });

  const { write: approve } = useContractWrite({
    address: "0x8505f923505095792b2b954471C05527C09825D9",
    abi: tokenJson.abi,
    functionName: "approve",
    args: [
      "0x010ed4a2AB1206124b4aD22ED940e2F57B5642B5",
      betNumber.toString() === "" ? 0n : ethers.parseUnits(betNumber.toFixed(0)),
    ],
  });

  return (
    <div className="grid grid-cols-2">
      <div>
        <button
          className="btn btn-active btn-neutral"
          disabled={betting}
          onClick={() => {
            document.getElementById(`place_bet_modal`).showModal();
          }}
        >
          Place Bet
        </button>
        <dialog id={`place_bet_modal`} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {ethers.formatEther(betPrice)} {params.symbol} per bet
            </h3>
            <input
              type="number"
              placeholder="i.e. 1200"
              className="input input-bordered w-full max-w-xs"
              value={betNumber}
              onChange={e => {
                setBetNumber(e.target.value);
              }}
            />
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button
                  className="btn"
                  onClick={() => {
                    if (allowance >= ethers.parseUnits(betNumber.toString())) {
                      placeBet();
                    } else {
                      approve();
                    }
                  }}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>

      <div className="grid justify-items-end">
        <button className="btn btn-active btn-accent" disabled={!(params.prize > 0)} onClick={() => redeemPrize()}>
          Redeem Prize
        </button>
      </div>
    </div>
  );
}

function Lottery(params: { prize: bigint }) {
  return <>{params.prize > 0 ? <p>Congratulations! You have won the prize!</p> : <></>}</>;
}
