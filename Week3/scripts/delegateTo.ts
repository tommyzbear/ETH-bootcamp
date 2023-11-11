import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { AnyToken, AnyToken__factory } from "../typechain-types";
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

  const parameters = process.argv.slice(2);
  console.log(parameters);
  if (!parameters || parameters.length < 1) throw new Error("Parameters not provided");
  const contractAddress = parameters[0];

  const contractFactory = new AnyToken__factory(wallet);
  const contract = (await contractFactory.attach(contractAddress)) as AnyToken;

  console.log(process.env.WALLET_ADDRESS_2);

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
