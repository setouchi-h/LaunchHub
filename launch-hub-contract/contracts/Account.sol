// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Securities.sol";

/* Errors */
error Account__NotAuthorized();
error Account__PercentageMustBeBetween0To99();
error Account__NotDuePayment();
error Account__NotZeroAddress();

// calc shares when withdrawing

contract Account is Ownable, ReentrancyGuard, Pausable {
    /* State Variables */
    uint256 private founderGainPercentage;
    uint256 private constant ADMIN_GAIN_PERCENTAGE = 1;
    Securities private immutable i_securities;
    address private immutable i_adminAddress;
    uint256 private s_totalReleased;

    // payer address -> amount of payed eth
    mapping(address => uint256) private s_addressToAmountPayed;
    // receiver address -> amount of released eth
    mapping(address => uint256) private s_addressToReleasedEth;
    // erc20 -> amount of released erc20
    mapping(IERC20 => uint256) private s_erc20ToTotalReleased;
    // erc20 -> receiver address -> amount of released erc20
    mapping(IERC20 => mapping(address => uint256)) private s_addressToReleasedToken;

    /* Events */
    event EthReceived(address indexed payer, uint256 amount);
    event EthWithdrawn(address indexed payer, uint256 amount);
    event TokenWithdrawn(IERC20 indexed token, address indexed receiver, uint256 amount);
    event FounderGainPercentageSet(uint256 percentage);

    /* Modifiers */
    modifier conditionOfPercentage(uint256 _value) {
        if (_value > 99 || _value < 0) {
            revert Account__PercentageMustBeBetween0To99();
        }
        _;
    }

    modifier onlyAuthorized() {
        if (
            msg.sender != i_adminAddress &&
            msg.sender != owner() &&
            i_securities.balanceOfHolder(msg.sender) <= 0
        ) {
            revert Account__NotAuthorized();
        }
        _;
    }

    /* Functions */
    constructor(address _adminAddr, address _tokenAddr, uint256 _share) {
        if (_adminAddr == address(0)) {
            revert Account__NotZeroAddress();
        }
        i_adminAddress = _adminAddr;
        i_securities = Securities(_tokenAddr);
        setFounderGainPercentage(_share);
    }

    receive() external payable {
        pay();
    }

    fallback() external payable {
        pay();
    }

    // pay eth
    function pay() public payable {
        s_addressToAmountPayed[msg.sender] += msg.value;
        emit EthReceived(msg.sender, msg.value);
    }

    function withdrawEth() external payable onlyAuthorized nonReentrant whenNotPaused {
        uint256 amount = releasableEth(msg.sender);

        if (amount <= 0) {
            revert Account__NotDuePayment();
        }

        // s_totalReleased is the sum of all values in s_addressToReleasedEth.
        // If "s_totalReleased += amount" does not overflow, then "s_addressToReleasedEth[account] += amount" cannot overflow.
        s_totalReleased += amount;
        unchecked {
            s_addressToReleasedEth[msg.sender] += amount;
        }

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success);

        emit EthWithdrawn(msg.sender, amount);
    }

    function withdrawToken(address _tokenAddr) external onlyAuthorized nonReentrant whenNotPaused {
        IERC20 token = IERC20(_tokenAddr);

        uint256 amount = releasableToken(token, msg.sender);

        if (amount <= 0) {
            revert Account__NotDuePayment();
        }

        // s_erc20ToTotalReleased[token] is the sum of all values in s_addressToReleasedToken[token].
        // If "s_erc20TotalReleased[token] += amount" does not overflow, then "s_addressToReleasedToken[token][account] += amount"
        // cannot overflow.
        s_erc20ToTotalReleased[token] += amount;
        unchecked {
            s_addressToReleasedToken[token][msg.sender] += amount;
        }

        SafeERC20.safeTransfer(token, msg.sender, amount);

        emit TokenWithdrawn(token, msg.sender, amount);
    }

    function releasableEth(address _addr) public view returns (uint256) {
        uint256 totalReceived = address(this).balance + getTotalReleasedEth();
        return _calcShare(_addr, totalReceived, getAddressToReleasedEth(_addr));
    }

    function releasableToken(IERC20 _token, address _addr) public view returns (uint256) {
        uint256 totalReceived = _token.balanceOf(address(this)) + getTotalReleasedToken(_token);
        return _calcShare(_addr, totalReceived, getAddressToReleasedToken(_token, _addr));
    }

    function _calcShare(
        address _addr,
        uint256 _totalReceived,
        uint256 _released
    ) internal view returns (uint256) {
        uint256 balanceOfAll = i_securities.balanceOfAll();
        uint256 balanceOfHolder = i_securities.balanceOfHolder(_addr);
        uint256 releasableAmount = 0;

        // 1. share of admin (1%)
        if (_addr == i_adminAddress) {
            releasableAmount += _pendingPayment(
                _totalReceived,
                ADMIN_GAIN_PERCENTAGE,
                100,
                _released
            );
        }

        // 2. share of founder
        if (_addr == owner()) {
            releasableAmount += _pendingPayment(
                _totalReceived,
                founderGainPercentage,
                100,
                _released
            );
        }

        // 3. share of rest members
        if (balanceOfAll == 0) {
            return releasableAmount;
        }
        uint256 releasableWeight = (100 - 1 - founderGainPercentage) * balanceOfHolder;
        releasableAmount += _pendingPayment(
            _totalReceived,
            releasableWeight,
            balanceOfAll * 100,
            _released
        );

        return releasableAmount;
    }

    function _pendingPayment(
        uint256 _totalReceived,
        uint256 _share,
        uint256 _population,
        uint256 _aleadyReleased
    ) internal pure returns (uint256) {
        int256 payment = int256((_totalReceived * _share) / _population) - int256(_aleadyReleased);
        return payment > 0 ? uint256(payment) : 0;
    }

    // set paused or unpaused
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // set share of founder
    function setFounderGainPercentage(
        uint256 _share
    ) public onlyOwner whenNotPaused conditionOfPercentage(_share) {
        founderGainPercentage = _share;
        emit FounderGainPercentageSet(_share);
    }

    // Getter

    function getTotalReleasedEth() public view returns (uint256) {
        return s_totalReleased;
    }

    function getTotalReleasedToken(IERC20 _token) public view returns (uint256) {
        return s_erc20ToTotalReleased[_token];
    }

    function getAddressToReleasedEth(address _addr) public view returns (uint256) {
        return s_addressToReleasedEth[_addr];
    }

    function getAddressToReleasedToken(IERC20 _token, address _addr) public view returns (uint256) {
        return s_addressToReleasedToken[_token][_addr];
    }

    function getAdminAddress() external view returns (address) {
        return i_adminAddress;
    }

    function getAdminGainPercentage() external pure returns (uint256) {
        return ADMIN_GAIN_PERCENTAGE;
    }

    function getFounderGainPercentage() external view returns (uint256) {
        return founderGainPercentage;
    }

    function getSecurities() external view returns (Securities) {
        return i_securities;
    }

    function getAddressToAmountPayed(address payer) external view returns (uint256) {
        return s_addressToAmountPayed[payer];
    }
}
