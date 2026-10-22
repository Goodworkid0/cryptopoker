// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PokerVault
 * @notice Deposit/Withdraw contract for CryptoPoker platform
 * @dev Users deposit PKC to play, backend tracks in-game balance
 * 
 * Flow:
 * 1. User deposits PKC → tokens locked in vault
 * 2. Backend credits user's in-game balance
 * 3. User plays poker (all game logic off-chain)
 * 4. User requests withdrawal → backend verifies → tokens released
 */
contract PokerVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // PKC Token contract
    IERC20 public immutable pkcToken;
    
    // Backend signer address (verifies withdrawals)
    address public backendSigner;
    
    // Minimum and maximum deposit amounts
    uint256 public minDeposit = 100 * 10**18;      // 100 PKC minimum
    uint256 public maxDeposit = 1_000_000 * 10**18; // 1M PKC maximum
    
    // User deposits tracking
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userWithdrawals;
    
    // Withdrawal nonces (prevent replay attacks)
    mapping(address => uint256) public withdrawalNonces;
    
    // Total stats
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    
    // Events
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 nonce, uint256 timestamp);
    event BackendSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event LimitsUpdated(uint256 minDeposit, uint256 maxDeposit);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    
    // Errors
    error InvalidAmount();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error SignatureExpired();
    error ZeroAddress();
    
    /**
     * @notice Constructor
     * @param _pkcToken Address of PKC token contract
     * @param _backendSigner Address that signs withdrawal approvals
     */
    constructor(address _pkcToken, address _backendSigner) Ownable(msg.sender) {
        if (_pkcToken == address(0) || _backendSigner == address(0)) revert ZeroAddress();
        
        pkcToken = IERC20(_pkcToken);
        backendSigner = _backendSigner;
    }
    
    /**
     * @notice Deposit PKC tokens to play poker
     * @param amount Amount of PKC to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        if (amount < minDeposit || amount > maxDeposit) revert InvalidAmount();
        
        // Transfer tokens from user to vault
        pkcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update tracking
        userDeposits[msg.sender] += amount;
        totalDeposited += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Withdraw PKC tokens (requires backend signature)
     * @param amount Amount of PKC to withdraw
     * @param nonce Unique nonce for this withdrawal
     * @param expiry Signature expiry timestamp
     * @param signature Backend signature authorizing withdrawal
     */
    function withdraw(
        uint256 amount,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        // Check expiry
        if (block.timestamp > expiry) revert SignatureExpired();
        
        // Check nonce
        if (nonce <= withdrawalNonces[msg.sender]) revert NonceAlreadyUsed();
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            nonce,
            expiry,
            address(this),
            block.chainid
        ));
        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        address signer = recoverSigner(ethSignedHash, signature);
        if (signer != backendSigner) revert InvalidSignature();
        
        // Update nonce
        withdrawalNonces[msg.sender] = nonce;
        
        // Update tracking
        userWithdrawals[msg.sender] += amount;
        totalWithdrawn += amount;
        
        // Transfer tokens to user
        pkcToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount, nonce, block.timestamp);
    }
    
    /**
     * @notice Recover signer from signature
     */
    function recoverSigner(bytes32 _ethSignedHash, bytes memory _signature) internal pure returns (address) {
        require(_signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        
        if (v < 27) v += 27;
        
        return ecrecover(_ethSignedHash, v, r, s);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update backend signer address
     */
    function setBackendSigner(address _newSigner) external onlyOwner {
        if (_newSigner == address(0)) revert ZeroAddress();
        
        address oldSigner = backendSigner;
        backendSigner = _newSigner;
        
        emit BackendSignerUpdated(oldSigner, _newSigner);
    }
    
    /**
     * @notice Update deposit limits
     */
    function setLimits(uint256 _minDeposit, uint256 _maxDeposit) external onlyOwner {
        require(_minDeposit < _maxDeposit, "Invalid limits");
        
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        
        emit LimitsUpdated(_minDeposit, _maxDeposit);
    }
    
    /**
     * @notice Pause deposits and withdrawals
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause deposits and withdrawals
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw (only owner, only when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdraw(token, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user stats
     */
    function getUserStats(address user) external view returns (
        uint256 deposited,
        uint256 withdrawn,
        uint256 currentNonce
    ) {
        return (
            userDeposits[user],
            userWithdrawals[user],
            withdrawalNonces[user]
        );
    }
    
    /**
     * @notice Get vault balance
     */
    function vaultBalance() external view returns (uint256) {
        return pkcToken.balanceOf(address(this));
    }
}
