// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PKC Faucet
 * @notice Dispenses test PKC tokens to new users
 * @dev One claim per address every 24 hours
 */
contract Faucet is Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable pkcToken;
    
    uint256 public claimAmount = 10_000 * 10**18; // 10,000 PKC per claim
    uint256 public cooldownPeriod = 24 hours;
    
    mapping(address => uint256) public lastClaimTime;
    
    event Claimed(address indexed user, uint256 amount, uint256 timestamp);
    event ClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event FaucetFunded(address indexed funder, uint256 amount);
    
    error CooldownActive(uint256 timeRemaining);
    error InsufficientFaucetBalance();
    
    constructor(address _pkcToken) Ownable(msg.sender) {
        pkcToken = IERC20(_pkcToken);
    }
    
    /**
     * @notice Claim free PKC tokens
     */
    function claim() external {
        uint256 lastClaim = lastClaimTime[msg.sender];
        
        if (lastClaim != 0) {
            uint256 timeSinceClaim = block.timestamp - lastClaim;
            if (timeSinceClaim < cooldownPeriod) {
                revert CooldownActive(cooldownPeriod - timeSinceClaim);
            }
        }
        
        uint256 balance = pkcToken.balanceOf(address(this));
        if (balance < claimAmount) revert InsufficientFaucetBalance();
        
        lastClaimTime[msg.sender] = block.timestamp;
        pkcToken.safeTransfer(msg.sender, claimAmount);
        
        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }
    
    /**
     * @notice Check if user can claim
     */
    function canClaim(address user) external view returns (bool, uint256 timeRemaining) {
        uint256 lastClaim = lastClaimTime[user];
        
        if (lastClaim == 0) {
            return (true, 0);
        }
        
        uint256 timeSinceClaim = block.timestamp - lastClaim;
        if (timeSinceClaim >= cooldownPeriod) {
            return (true, 0);
        }
        
        return (false, cooldownPeriod - timeSinceClaim);
    }
    
    /**
     * @notice Get faucet balance
     */
    function faucetBalance() external view returns (uint256) {
        return pkcToken.balanceOf(address(this));
    }
    
    // Admin functions
    
    function setClaimAmount(uint256 _amount) external onlyOwner {
        uint256 oldAmount = claimAmount;
        claimAmount = _amount;
        emit ClaimAmountUpdated(oldAmount, _amount);
    }
    
    function setCooldownPeriod(uint256 _period) external onlyOwner {
        uint256 oldCooldown = cooldownPeriod;
        cooldownPeriod = _period;
        emit CooldownUpdated(oldCooldown, _period);
    }
    
    function withdrawTokens(uint256 amount) external onlyOwner {
        pkcToken.safeTransfer(owner(), amount);
    }
}
