import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Lottery__factory } from "../typechain-types";
dotenv.config();

const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 10000n;

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
  if (balance < 0.001) {
    throw new Error("Not enough ether");
  }
  console.log(TOKEN_RATIO);
  const contractFactory = new Lottery__factory(wallet);
  const contract = await contractFactory.deploy("LotteryToken", "LT4", TOKEN_RATIO, ethers.parseUnits(BET_PRICE.toFixed(18)), ethers.parseUnits(BET_FEE.toFixed(18)));
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Lottery contract deployed at ${contractAddress}\n`);
  const tokenAddress = await contract.paymentToken();
  console.log(`Token address is ${tokenAddress}`);
  console.log(ethers.encodeBytes32String("LotteryToken"));
  console.log(ethers.encodeBytes32String("LT4"));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
