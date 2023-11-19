import { useEffect, useState } from "react";
import * as ballotJson from "../../assets/TokenizedBallot.json";
import { readContract } from "@wagmi/core";
import { ethers } from "ethers";
import { Address, useContractRead } from "wagmi";

type VoteRecord = {
  readonly address: Address;
  readonly voteCount: string;
  readonly proposal: string;
  readonly blockNumber: string;
};

export default function VoteHistory() {
  const [records, setRecords] = useState([] as VoteRecord[]);

  const { data: numOfVoteRecordsData } = useContractRead({
    address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
    abi: ballotJson.abi,
    functionName: "getNumOfVoteRecords",
  });

  const numOfVoteRecords = typeof numOfVoteRecordsData === "bigint" ? numOfVoteRecordsData : 0;

  useEffect(() => {
    const updatedRecords = [] as VoteRecord[];
    const fetchRecords = async () => {
      for (let i = numOfVoteRecords - 1n; i >= 0; i--) {
        const data = await readContract({
          address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
          abi: ballotJson.abi,
          functionName: "voteHistory",
          args: [i],
        });

        updatedRecords.push({
          address: data[0],
          voteCount: ethers.formatEther(data[1]),
          proposal: ethers.decodeBytes32String(data[2]),
          blockNumber: data[3].toString(),
        });
      }

      setRecords(updatedRecords);
    };

    fetchRecords();
  }, [numOfVoteRecords, numOfVoteRecordsData]);

  return (
    <div className="card max-w-full bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Vote History</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Voter</th>
                <th>Vote Count</th>
                <th>Proposal</th>
                <th>Block</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, i) => {
                return (
                  <tr key={i}>
                    <th>{i + 1}</th>
                    <td>{record.address}</td>
                    <td>{record.voteCount.toString()}</td>
                    <td>{record.proposal}</td>
                    <td>{record.blockNumber}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
