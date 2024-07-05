// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Donation {
    uint public donations;
    uint256[] public history; 

    event Deposit(uint256 amount);

    constructor() {
        donations = 0;
    }

    function getBalance() public view returns(uint256) {
        return donations;
    }

    function deposit(uint value) public payable {
        require(value > 0, "Donation must be greater than 0");
        donations+=value;
        history.push(value);
        emit Deposit(value);
    }

    function getHistory() public view returns(uint256[] memory) {
        return history;
    }
        
}