// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Securities.sol";

contract SecuritiesFactory {
    event SecuritiesDeployed(address _securitiesAddr);

    function deploy(string memory _uri) external {
        Securities newSecurities = new Securities(_uri);

        emit SecuritiesDeployed(address(newSecurities));

        // transfer ownership
        newSecurities.transferOwnership(msg.sender);
    }
}
