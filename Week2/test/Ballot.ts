import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function deployContract() {
  const signers = await ethers.getSigners();

  const ballotFactory = await ethers.getContractFactory("Ballot");
  const byteCodes = PROPOSALS.map(ethers.encodeBytes32String);
  const ballotContract = await ballotFactory.deploy(byteCodes);
  await ballotContract.waitForDeployment();
  return { signers: signers, ballotContract: ballotContract };
}

describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);

      const proposals0 = await ballotContract.proposals(0);
      expect(PROPOSALS[0]).to.eq(ethers.decodeBytes32String(proposals0.name));
      const proposals1 = await ballotContract.proposals(1);
      expect(PROPOSALS[1]).to.eq(ethers.decodeBytes32String(proposals1.name));
      const proposals2 = await ballotContract.proposals(2);
      expect(PROPOSALS[2]).to.eq(ethers.decodeBytes32String(proposals2.name));
    });

    it("has zero votes for all proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);

      const votes0 = (await ballotContract.proposals(0)).voteCount;
      expect(votes0).to.eq(0);
      const votes1 = (await ballotContract.proposals(1)).voteCount;
      expect(votes1).to.eq(0);
      const votes2 = (await ballotContract.proposals(2)).voteCount;
      expect(votes2).to.eq(0);
    });

    it("sets the deployer address as chairperson", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      const deployerAddress = signers[0].address;
      const chairpersonAddress = await ballotContract.chairperson();
      expect(deployerAddress).to.eq(chairpersonAddress);
    });

    it("sets the voting weight for the chairperson as 1", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      const chairpersonvoter = await ballotContract.voters(signers[0].address);
      expect(chairpersonvoter.weight).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      const voterBefore = await ballotContract.voters(signers[1].address);
      expect(voterBefore.weight).to.eq(0);

      const tx = await ballotContract.giveRightToVote(signers[1].address);
      await tx.wait();
      const voter = await ballotContract.voters(signers[1].address);
      expect(voter.weight).to.eq(1);
    });

    it("can not give right to vote for someone that has voted", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      let tx = await ballotContract.giveRightToVote(signers[1].address);
      await tx.wait();

      await ballotContract.connect(signers[1]).vote(0);
      await expect(ballotContract.giveRightToVote(signers[1].address)).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      let tx = await ballotContract.giveRightToVote(signers[1].address);
      await tx.wait();

      await expect(ballotContract.giveRightToVote(signers[1].address)).to.be.reverted;
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      let proposal = await ballotContract.proposals(0);
      await expect(proposal.voteCount).to.eq(0);

      await ballotContract.connect(signers[0]).vote(0);
      proposal = await ballotContract.proposals(0);

      await expect(proposal.voteCount).to.eq(1);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      // delegate must have at least one vote
      let tx = await ballotContract.giveRightToVote(signers[1].address);
      await tx.wait();
      const voter1BeforeDelegation = await ballotContract.voters(signers[1].address);
      expect(voter1BeforeDelegation.weight).to.eq(1);

      await ballotContract.connect(signers[0]).delegate(signers[1].address);

      const voter1AfterDelegation = await ballotContract.voters(signers[1].address);
      expect(voter1AfterDelegation.weight).to.eq(2);
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      await expect(ballotContract.connect(signers[1]).giveRightToVote(signers[2].address)).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    it("should revert", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      await expect(ballotContract.connect(signers[1]).vote(0)).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    it("should revert", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      await expect(ballotContract.connect(signers[1]).delegate(signers[0].address)).to.be.revertedWith("You have no right to vote");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const result = await ballotContract.winningProposal();
      expect(result).to.eq(0);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      await ballotContract.vote(0);
      const result = await ballotContract.winningProposal();
      expect(result).to.eq(0);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const proposal = await ballotContract.winnerName();
      expect(PROPOSALS[0]).to.eq(ethers.decodeBytes32String(proposal));
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      await ballotContract.vote(0);
      const proposal = await ballotContract.winnerName();
      expect(PROPOSALS[0]).to.eq(ethers.decodeBytes32String(proposal));
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    it("should return the name of the winner proposal", async () => {
      const { signers, ballotContract } = await loadFixture(deployContract);
      let txs = await Promise.all([
        ballotContract.giveRightToVote(signers[1].address),
        ballotContract.giveRightToVote(signers[2].address),
        ballotContract.giveRightToVote(signers[3].address),
        ballotContract.giveRightToVote(signers[4].address)
      ]);

      await Promise.all([txs[0].wait(), txs[1].wait(), txs[2].wait(), txs[3].wait()]);

      await ballotContract.vote(1);
      await ballotContract.connect(signers[1]).vote(1);
      await ballotContract.connect(signers[2]).vote(1);
      await ballotContract.connect(signers[3]).vote(2);
      await ballotContract.connect(signers[4]).vote(2);

      const result = await ballotContract.winningProposal();
      expect(result).to.eq(1);

      const name = await ballotContract.winnerName();
      expect(PROPOSALS[1]).to.eq(ethers.decodeBytes32String(name));
    });
  });
});
