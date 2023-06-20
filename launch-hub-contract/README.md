# launch-hub-contract

## The role of smart contract

In order to use our project, each project must deploy and own its own two contracts. 
1. Securities contract: This contract is responsible for minting and managing project sbt. A founder distributes SBT to members based on their contribution. Project members will receive compensation from the revenue based on their ownership percentage in SBT.
2. Account contract: This contract is responsible for calcurating and withdrawing project members' reward. Proceeds in Crypto is distributed based on SBT allocation.　Each member of a project has right to withdraw their own reward.

For project founders to deploy their own sbt contract and account contract, we provide factory contracts. This contract is deployed by us and is responsible for deploying sbt contract and account contract.
