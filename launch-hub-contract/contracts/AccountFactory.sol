// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Account.sol";

contract AccountFactory {
    event AccountDeployed(address _accountAddr);

    function deploy(address _adminAddr, address _securitiesAddr, uint256 _share) external {
        Account newAccount = new Account(_adminAddr, _securitiesAddr, _share);

        emit AccountDeployed(address(newAccount));

        // transfer ownership
        newAccount.transferOwnership(msg.sender);
    }
}
