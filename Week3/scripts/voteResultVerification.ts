import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

const BALLOT_CONTRACT = "0x196B1b2c6ED79BE59c559646553849983Bf99161";

async function main() {
  const provider = new ethers.AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  const contractFactory = new TokenizedBallot__factory(wallet);
  const contract = (await contractFactory.attach(BALLOT_CONTRACT)) as TokenizedBallot;

  const proposal0 = await contract.proposals(0);
  console.log(`Proposal 0 data: \n ${ethers.decodeBytes32String(proposal0[0])} has ${proposal0[1]} votes`);

  const proposal1 = await contract.proposals(1);
  console.log(`Proposal 1 data: \n ${ethers.decodeBytes32String(proposal1[0])} has ${proposal1[1]} votes`);

  const proposal2 = await contract.proposals(2);
  console.log(`Proposal 2 data: \n ${ethers.decodeBytes32String(proposal2[0])} has ${proposal2[1]} votes`);

  const winner = await contract.winnerName();
  console.log(`Winner is proposal ${ethers.decodeBytes32String(winner)}`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
