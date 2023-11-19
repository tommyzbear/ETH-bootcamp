import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/AnyToken.json';
import { BytesLike, TransactionReceipt, ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  contract: ethers.Contract;
  provider: ethers.Provider;
  wallet: ethers.Wallet;
  minterRole: BytesLike;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.AlchemyProvider(
      'sepolia',
      this.configService.get<string>('ALCHEMY_API_KEY'),
    );
    this.wallet = new ethers.Wallet(
      this.configService.get<string>('PRIVATE_KEY'),
      this.provider,
    );
    this.contract = new ethers.Contract(
      this.configService.get<string>('TOKEN_ADDRESS'),
      tokenJson.abi,
      this.provider,
    );
    this.minterRole = this.configService.get<BytesLike>('MINTER_ROLE');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getContractAddress(): Promise<string> {
    return await this.contract.getAddress();
  }

  async getTokenName(): Promise<string> {
    const name = await this.contract.name();
    return name;
  }

  async getTotalSupply() {
    const supply = await this.contract.totalSupply();
    return ethers.formatUnits(supply);
  }

  async getTokenBalance(address) {
    const balance = await this.contract.balanceOf(address);
    return ethers.formatUnits(balance);
  }

  async getTransactionReceipt(hash): Promise<TransactionReceipt> {
    const receipt = await this.provider.getTransactionReceipt(hash);
    return receipt;
  }

  getServerWalletAddress(): string {
    console.log(this.wallet);
    return this.wallet.address;
  }

  async checkMinterRole(address): Promise<string> {
    const isMinter = await this.contract.hasRole(this.minterRole, address);
    return isMinter;
  }

  async mintTokens(address, signature): Promise<any> {
    if (signature === 'ABC') {
      // const signer = this.provider.getS;
      const receipt = await (this.contract as any)
        .connect(this.wallet)
        .mint(address, ethers.parseUnits('100000', 'ether'));
      return (receipt as TransactionReceipt).hash;
    }
    return 'Signature not recognised';
  }
}
