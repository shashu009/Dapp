// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(address => uint256) public userPoints;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event PointsEarned(address indexed user, uint256 pointsEarned);
    event PointsRedeemed(address indexed user, uint256 pointsRedeemed);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }
error InsufficientBalance(uint256 balance, uint256 withdrawAmount);
    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        emit Deposit(_amount);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        emit Withdraw(_withdrawAmount);
    }

    function addPoints(address _user, uint256 _inputUnits) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 pointsEarned = _inputUnits * 10;
        userPoints[_user] += pointsEarned;
        emit PointsEarned(_user, pointsEarned);
    }

    function redeemPoints(uint256 _pointsToRedeem) public {
        require(userPoints[msg.sender] >= _pointsToRedeem, "Insufficient points balance");
        userPoints[msg.sender] -= _pointsToRedeem;
        emit PointsRedeemed(msg.sender, _pointsToRedeem);
    }
}
