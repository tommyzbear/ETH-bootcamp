import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot, Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  // const provider = ethers.getDefaultProvider("sepolia");
  const provider = new ethers.AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
  const lastBlock = await provider.getBlock("latest");
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(`Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2) throw new Error("Parameters not provided");
  const contractAddress = parameters[0];
  // const address1 = parameters[1];
  // const address2 = parameters[2];
  const proposalToVote = parameters[1];

  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = (await ballotFactory.attach(contractAddress)) as Ballot;

  // Read proposals
  //   for (let index = 0; index < 3; index++) {
  //     const proposal = await ballotContract.proposals(index);
  //     const name = await ethers.decodeBytes32String(proposal.name);
  //     console.log({ index, name, proposal });
  //   }

  // Give right to vote
  // const tx1 = await ballotContract.giveRightToVote(address1);
  // const receipt1 = await tx1.wait();
  // console.log(`Give right to vote for address1 transaction completed ${receipt1?.hash}`);

  // Delegate vote to other user
  // const tx = await ballotContract.delegate(address1);
  // const receipt = await tx.wait(5);
  // console.log(`Delegate voting right to address ${address1}, tx: ${receipt?.hash}`);

  // Vote for proposal
  const tx = await ballotContract.vote(proposalToVote);
  const receipt = await tx.wait(2);
  console.log(`Vote for proposal, tx: ${receipt?.hash}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
