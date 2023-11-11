import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { AnyToken__factory } from "../typechain-types";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("1000000");

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

  const contractFactory = new AnyToken__factory(wallet);
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}\n`);

  const mintTx = await contract.mint(wallet.address, MINT_VALUE);
  await mintTx.wait();
  console.log(`Minted ${MINT_VALUE.toString()} decimal units to account ${wallet.address}\n`);
  const balanceAT = await contract.balanceOf(wallet.address);
  console.log(`Account ${wallet.address} has ${balanceAT.toString()} decimal units of MyToken\n`);

  const votes = await contract.getVotes(wallet.address);
  console.log(`Account ${wallet.address} has ${votes.toString()} units of voting power before self delegating\n`);

  const delegateTx = await contract.connect(wallet).delegate(wallet.address);
  await delegateTx.wait();
  const votesAfter = await contract.getVotes(wallet.address);
  console.log(`Account ${wallet.address} has ${votesAfter.toString()} units of voting power after self delegating\n`);

  const transferTx = await contract.connect(wallet).transfer(process.env.WALLET_ADDRESS_2 as string, MINT_VALUE / 2n);
  await transferTx.wait();
  const votes1AfterTransfer = await contract.getVotes(wallet.address);
  console.log(`Account ${wallet.address} has ${votes1AfterTransfer.toString()} units of voting power after transferring\n`);
  const votes2AfterTransfer = await contract.getVotes(process.env.WALLET_ADDRESS_2 as string);
  console.log(`Account ${process.env.WALLET_ADDRESS_2} has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
