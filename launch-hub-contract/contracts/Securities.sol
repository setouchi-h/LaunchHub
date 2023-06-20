// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error Securities__NonTransferable();

contract Securities is ERC1155, Ownable {
    /* Variables */
    address[] private s_holders;
    mapping(address => bool) private s_isInArray;

    /* Events */
    event SbtMinted(address indexed to, uint256 id, uint256 amount);
    event SbtBurned(address indexed from, uint256 id, uint256 amount);

    /* Functions */
    constructor(string memory _uri) ERC1155(_uri) {}

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function mint(uint256 _amount, address _to) public onlyOwner {
        if (!s_isInArray[_to]) {
            s_holders.push(_to);
            s_isInArray[_to] = true;
        }
        _mint(_to, 0, _amount, "");
        emit SbtMinted(_to, 0, _amount);
    }

    function burn(address _addr, uint256 _amount) external onlyOwner {
        _burn(_addr, 0, _amount);
        emit SbtBurned(_addr, 0, _amount);
    }

    function balanceOfHolder(address account) public view returns (uint256) {
        return balanceOf(account, 0);
    }

    function balanceOfAll() external view returns (uint256) {
        uint256 balance = 0;
        for (uint256 holderIndex = 0; holderIndex < s_holders.length; holderIndex++) {
            address holder = s_holders[holderIndex];
            balance += balanceOfHolder(holder);
        }
        return balance;
    }

    // Non transferable

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public pure override {
        revert Securities__NonTransferable();
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public pure override {
        revert Securities__NonTransferable();
    }

    function setApprovalForAll(address operator, bool approved) public pure override(ERC1155) {
        revert Securities__NonTransferable();
    }

    // getter

    function getHolders() external view returns (address[] memory) {
        return s_holders;
    }
}
