# Scripts

- scripts/DeployWithHardhat.ts
- scripts/InteractWithBallotContract.ts

## How to run

```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> <operation-name> <optional-param>
```

### Valid operations

#### Vote for a proposal
```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> vote <proposal-number>
```

#### Give right to vote
```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> give_right_to_vote <address>
```

#### Delegate
```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> delegate <address>
```

#### Read proposals
```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> read_proposals
```

#### Winning proposals
```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> winning_proposals
```

#### Winning proposals
```
npx ts-node ./scripts/InteractWithBallotContract.ts <contract-address> winner_name
```

## Contract Deployments

### Transaction Hash: https://sepolia.etherscan.io/tx/0xe949369a5d7dbbedc781c0c2f774166132195c3f7fefb0a4cc0e9abe13bad14a

### Contract Address: https://sepolia.etherscan.io/address/0x1864fc0124a5a853246be76897ab38c3c9ca6188

![Screenshot](screenshots/deploy_contract.png)

## Read Proposals

![Screenshot](screenshots/read_proposal_names.png)

## Give Voting Right

### Transaction Hash1: https://sepolia.etherscan.io/tx/0x8f8bfa44833dc58523725623d51b70afb1a5d291320fe4a0795c3a1e35b7ea49

### Transaction Hash2: https://sepolia.etherscan.io/tx/0x65662b7bb5dc60444782554a851682dc127668226f0789481d56a9cdfadf8c22

![Screenshot](screenshots/give_voting_right.png)

## Reverted Delegation

Delegation to self is reverted with reason `Self-delegation is disallowed.`
![Screenshot](screenshots/reverted_delegation.png)

## Delegate Voting Right

Delegate voting right to another address

### Transaction Hash1: https://sepolia.etherscan.io/tx/0xda3e9c6e6a52a6ef68bb376f2ea49cc12e492977bb934fab773a5a653dad1bb9

## Vote for Proposal

Vote for a proposal

### Transaction Hash: https://sepolia.etherscan.io/tx/0x15a4ab2a2dc7675882447e55c38a85f5a0832a40e62fed72108ae3b89665d45e

![Screenshot](screenshots/vote_for_proposal.png)

## Check votes on etherscan

Proposal should receive 2 votes, since the wallet that initiate the transaction has 1 delegation

![Screenshot](screenshots/vote_check.png)

## Vote for Proposal

### Transaction Hash: https://sepolia.etherscan.io/tx/0x0cabb590acf7981656a7e2cf80fcf32f2f897c71eee61a98bf40d3fae55cb7b6

## Reverted giving voting rights

Reverted because I am not the chairman
![Screenshot](screenshots/reverted_give_voting_right.png)

## Check votes on etherscan

Now the proposal has 3 votes

![Screenshot](screenshots/read_proposals.png)

## Check winning proposals

![Screenshot](screenshots/winning_proposal.png)

## Check winner name

![Screenshot](screenshots/winning_proposal.png)