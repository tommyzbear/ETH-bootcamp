import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot, Ballot__factory } from "../typechain-types";

dotenv.config();

async function main() {
  // Receiving parameters
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error("contractAddress and operation not provided");
  const contractAddress = parameters[0];
  const op = parameters[1];

  // create a provider
  // const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const provider = new ethers.AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
  
  const lastBlock = await provider.getBlock("latest");
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(`Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`);

  // create a wallet
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC ?? "", provider);

  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = ballotFactory.attach(contractAddress) as Ballot;

  switch (op) {
    case "vote":
      if (parameters.length < 3)
        throw new Error("proposalNumber not provided");
      const proposalNumber = parameters[2];
      const voteTx = await ballotContract.vote(proposalNumber);
      const voteReceipt = await voteTx.wait();
      console.log(`Vote transaction completed ${voteReceipt?.hash}`)
      break;
    case "give_right_to_vote":
      if (parameters.length < 3)
        throw new Error("giveRightAddress not provided");
      const giveRightAddress = parameters[2];
      const giveRigthTx = await ballotContract.giveRightToVote(giveRightAddress);
      const giveRightReceipt = await giveRigthTx.wait();
      console.log(`Give right transaction completed ${giveRightReceipt?.hash}`)
      break;
    case "delegate":
      if (parameters.length < 3)
        throw new Error("toAddress not provided");
      const toAddress = parameters[2];
      const delegateTx = await ballotContract.delegate(toAddress);
      const delegateReceipt = await delegateTx.wait();
      console.log(`Delegate transaction completed ${delegateReceipt?.hash}`)
      break;
    case "read_proposals":
      for (let index = 0; index < 3; index++) {
        const proposal = await ballotContract.proposals(index);
        const name = await ethers.decodeBytes32String(proposal.name);
        console.log({ index, name, proposal });
      }
      break;
    case "winning_proposal":
      const winnerIndex = await ballotContract.winningProposal()
      console.log(`Winning proposal is #${winnerIndex}`)
      break;
    case "winner_name":
      const winnerNameBytes = await ballotContract.winnerName()
      const decodedWinnerName = await ethers.decodeBytes32String(winnerNameBytes)
      console.log(`Winner name is ${decodedWinnerName}`)
      break;
    default:
      console.log(`Invalid operation ${op}, valid ops are: vote, give_right_to_vote, delegate, read_proposals, winning_proposals, winner_name`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});