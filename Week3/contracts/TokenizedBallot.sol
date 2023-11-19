// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}
contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    struct VoteRecord {
        address voter;
        uint voteCount;
        bytes32 proposal;
        uint blockNumber;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;
    mapping(address => uint256) public votedAmount; // Mapping to track how much each address has voted
    VoteRecord[] public voteHistory;

    constructor(
        bytes32[] memory _proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;

        require(block.number > targetBlockNumber, "Target block must be in the past");

        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function getNumOfProposals() public view returns(uint length) {
        return proposals.length;
    }

    function getNumOfVoteRecords() public view returns(uint length) {
        return voteHistory.length;
    }

    function vote(uint256 proposal, uint256 amount) external {
        // Get the sender's past votes
        uint256 pastVotes = tokenContract.getPastVotes(msg.sender, targetBlockNumber);
        // Ensure the sender has enough tokens to vote
        require(votedAmount[msg.sender] + amount <= pastVotes, "Voter does not have enough voting power");
        votedAmount[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
        voteHistory.push(VoteRecord({voter: msg.sender, voteCount: amount, proposal: proposals[proposal].name, blockNumber: block.number}));
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}