import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["WAGMI", "MOON", "BOOTCAMP"];
const TOKEN_CONTRACT = "0x67FC0d694A9503d87BCb8fd7B79d3933C02AD155";

async function main() {
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
  const contractFactory = new TokenizedBallot__factory(wallet);
  const targetBlock = (lastBlock?.number as number) - 1;

  const contract = await contractFactory.deploy(PROPOSALS.map(ethers.encodeBytes32String), TOKEN_CONTRACT, targetBlock);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Ballot contract deployed at ${contractAddress}\n`);
  console.log(`Ballot proposals: ${PROPOSALS}, with voter tokens: ${TOKEN_CONTRACT} and target block ${targetBlock}`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
