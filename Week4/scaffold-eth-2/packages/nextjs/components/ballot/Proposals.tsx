import { useEffect, useState } from "react";
import * as ballotJson from "../../assets/TokenizedBallot.json";
import { readContract } from "@wagmi/core";
import { ethers } from "ethers";
import { useContractRead, useContractWrite } from "wagmi";

type Proposal = {
  readonly name: string;
  readonly voteCount: string;
};

export default function Proposals() {
  const [proposals, setProposals] = useState([] as Proposal[]);
  const [voteProposal, setVoteProposal] = useState(-1);
  const [voteAmount, setVoteAmount] = useState(0);

  const { data: numOfProposalsData } = useContractRead({
    address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
    abi: ballotJson.abi,
    functionName: "getNumOfProposals",
  });

  const { isLoading: voting, write } = useContractWrite({
    address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
    abi: ballotJson.abi,
    functionName: "vote",
    args: [voteProposal, voteAmount.toString() === "" ? 0n : ethers.parseUnits(voteAmount.toString(), "ether")],
  });

  const numOfProposals = typeof numOfProposalsData === "bigint" ? numOfProposalsData : 0;

  useEffect(() => {
    const updatedProposals = [] as Proposal[];
    const fetchProposals = async () => {
      for (let i = 0; i < numOfProposals; i++) {
        const data = await readContract({
          address: "0xCe88d38863c8CBF39cc5Df3Ef9CE68574DdDcf59",
          abi: ballotJson.abi,
          functionName: "proposals",
          args: [i],
        });
        updatedProposals.push({
          name: ethers.decodeBytes32String(data[0]),
          voteCount: ethers.formatEther(data[1]),
        });
      }

      setProposals(updatedProposals);
    };

    fetchProposals();
  }, [numOfProposals, numOfProposalsData]);

  return (
    <div className="card max-w-full bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Proposals</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Proposal Name</th>
                <th>Vote Count</th>
                <th>Vote Now</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal, i) => {
                return (
                  <tr key={i}>
                    <th>{i + 1}</th>
                    <td>{proposal.name}</td>
                    <td>{proposal.voteCount.toString()}</td>
                    <td>
                      {/* <button className="btn btn-xs btn-outline btn-neutral" onClick={() => {
                                setVoteAmount()
                      }}>
                        Vote
                            </button> */}
                      <button
                        disabled={voting}
                        className="btn btn-xs btn-outline btn-neutral"
                        onClick={() => {
                          setVoteProposal(i);
                          document.getElementById(`vote_modal_${i}`).showModal();
                        }}
                      >
                        Vote
                      </button>
                      <dialog id={`vote_modal_${i}`} className="modal">
                        <div className="modal-box">
                          <h3 className="font-bold text-lg">Vote Amount</h3>
                          <input
                            type="number"
                            placeholder="i.e. 10000"
                            className="input input-bordered w-full max-w-xs"
                            value={voteAmount}
                            onChange={e => {
                              setVoteAmount(e.target.value);
                            }}
                          />
                          <div className="modal-action">
                            <form method="dialog">
                              {/* if there is a button in form, it will close the modal */}
                              <button className="btn" onClick={() => write()}>
                                Submit
                              </button>
                            </form>
                          </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                          <button>close</button>
                        </form>
                      </dialog>
                    </td>
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
