// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {LotteryToken} from "./LotteryToken.sol";

/// @title A very simple lottery contract
/// @author Matheus Pagani
/// @notice You can use this contract for running a very simple lottery
/// @dev This contract implements a relatively weak randomness source, since there is no cliff period between the randao reveal and the actual usage in this contract
/// @custom:teaching This is a contract meant for teaching only
contract Lottery is Ownable {
    using SafeMath for uint;
    /// @notice Address of the token used as payment for the bets
    LotteryToken public paymentToken;
    /// @notice Amount of tokens given per ETH paid
    uint256 public purchaseRatio;
    /// @notice Amount of tokens required for placing a bet that goes for the prize pool
    uint256 public betPrice;
    /// @notice Amount of tokens required for placing a bet that goes for the owner pool
    uint256 public betFee;
    /// @notice prize pool
    uint256 public prizePool;
    /// @notice fees for owner
    uint256 public ownerPool;

    /// @notice indicate whether the lottery is open for bets or not
    bool public betsOpen;
    uint256 public betsClosingTime;
    mapping(address => uint256) public prize;

    address[] _slots;

    /// @notice Constructor function
    /// @param tokenName Name of the token used for payment
    /// @param tokenSymbol Symbol of the token used for payment
    /// @param _purchaseRatio Amount of tokens given per ETH paid
    /// @param _betPrice Amount of tokens required for placing a bet that goes for the prize pool
    /// @param _betFee Amount of tokens required for placing a bet that goes for the owner pool
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 _purchaseRatio,
        uint256 _betPrice,
        uint256 _betFee
    ) {
        purchaseRatio = _purchaseRatio;
        betPrice = _betPrice;
        betFee = _betFee;
        paymentToken = new LotteryToken(tokenName, tokenSymbol);
    }

    modifier isBetsClosed() {
        require(!betsOpen, "Lottery is open");
        _;
    }

    modifier isBetsOpen() {
        require(betsOpen && block.timestamp < betsClosingTime, "Lottery is closed");
        _;
    }

    /// @notice Opens the lottery for receiving bets
    function openBets(uint256 closingTime) external onlyOwner isBetsClosed {
        require(closingTime > block.timestamp, "Closing time must be in the future");
        betsClosingTime = closingTime;
        betsOpen = true;
    }

    /// @notice Gives tokens based on the amount of ETH sent and the purchase ratio
    /// @dev This implementation is prone to rounding problems
    function purchaseTokens() external payable {
        paymentToken.mint(msg.sender, msg.value.mul(purchaseRatio));
    }

    /// @notice Charges the bet price and creates a new bet slot with the sender's address
    function bet() public isBetsOpen {
        paymentToken.transferFrom(msg.sender, address(this), betPrice.add(betFee));
        ownerPool += betFee;
        prizePool += betPrice;
        _slots.push(msg.sender);
    }

    /// @notice Calls the bet function `times` times
    function betMany(uint256 times) external {
        require(times > 0);
        uint256 totalBetPrice = betPrice.mul(times);
        uint256 totalFees = betFee.mul(times);
        paymentToken.transferFrom(msg.sender, address(this), totalBetPrice.add(totalFees));

        ownerPool += totalFees;
        prizePool += totalBetPrice;

        while (times > 0) {
            _slots.push(msg.sender);
            times--;
        }
    }

    /// @notice Closes the lottery and calculates the prize, if any
    /// @dev Anyone can call this function at any time after the closing time
    function closeLottery() external {
        require(block.timestamp >= betsClosingTime, "Too soon to close");
        require(betsOpen, "Already closed");  
        if (_slots.length > 0) {
            uint256 winnerIndex = getRandomNumber() % _slots.length;
            address winner = _slots[winnerIndex];
            prize[winner] += prizePool;
            prizePool = 0;
            delete(_slots);
        }

        betsOpen = false;
    }

    /// @notice Returns a random number calculated from the previous block randao
    /// @dev This only works after The Merge
    function getRandomNumber() internal view returns (uint256 randomNumber) {
        return block.prevrandao;
    }

    /// @notice Withdraws `amount` from that accounts's prize pool
    function prizeWithdraw(uint256 amount) external {
        require(prize[msg.sender] >= amount, "There is no prize for you");
        paymentToken.transferFrom(address(this), msg.sender, amount);
        paymentToken.transfer(msg.sender, amount);
        prize[msg.sender] -= amount;
    }

    /// @notice Withdraws `amount` from the owner's pool
    function ownerWithdraw(uint256 amount) external onlyOwner {
        require(ownerPool >= amount, "No fee for withdrawal");
        paymentToken.transfer(msg.sender, amount);
        ownerPool -= amount;
    }

    /// @notice Burns `amount` tokens and give the equivalent ETH back to user
    function returnTokens(uint256 amount) external payable {
        paymentToken.burnFrom(msg.sender, amount);
        (bool success, ) = msg.sender.call{value: amount.div(purchaseRatio), gas: 2300}("");
    }
}