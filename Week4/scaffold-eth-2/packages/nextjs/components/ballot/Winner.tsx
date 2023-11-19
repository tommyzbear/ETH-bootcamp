import { useEffect, useState } from "react";
import * as ballotJson from "../../assets/TokenizedBallot.json";
import { readContract } from "@wagmi/core";
import { ethers } from "ethers";
import { Address, useContractRead } from "wagmi";

type Proposal = {
  readonly name: string;
  readonly voteCount: string;
};

export default function Winner() {
  const [proposal, setProposal] = useState({} as Proposal);
  const { data: winnerIndexData } = useContractRead({
    address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
    abi: ballotJson.abi,
    functionName: "winningProposal",
  });

  const winnerIndex = typeof winnerIndexData === "bigint" ? winnerIndexData : 0;

  const { data: winner } = useContractRead({
    address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
    abi: ballotJson.abi,
    functionName: "proposals",
    args: [winnerIndex],
  });

  useEffect(() => {
    if (winner !== undefined) {
      const p = { name: ethers.decodeBytes32String(winner[0]), voteCount: ethers.formatEther(winner[1]) };
      setProposal(p);
    }
  }, [winnerIndexData, winner]);
  return (
    <div className="card max-w-full bg-primary text-primary-content mt-4">
      <div className="card-body">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Winner Proposal</div>
            <div className="stat-value text-primary">{proposal?.name}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Vote Counts</div>
            <div className="stat-value text-secondary">{proposal?.voteCount.toString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
