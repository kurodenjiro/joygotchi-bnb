// SimpleOwnerContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleOwnerContract {
    address public owner;
    uint public value;

    event ValueSet(address indexed owner, uint newValue);
    event ChangeOwner(address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
        emit ChangeOwner(_newOwner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setValue(uint _newValue) public onlyOwner {
        value = _newValue;
        emit ValueSet(owner, _newValue);
    }

    function getValue() public view returns (uint) {
        return value;
    }
}