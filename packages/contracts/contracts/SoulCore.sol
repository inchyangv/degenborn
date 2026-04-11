// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SoulCore
 * @notice Soul Core NFT — wallet-bound, one per wallet, non-transferable.
 *         Stores a hash of the current character state on-chain.
 *         Metadata is served off-chain via tokenURI (IPFS / hosted API).
 *
 * Key rules:
 *  - One token per wallet address (minted at the wallet that holds it)
 *  - Transfer is permanently blocked (Soulbound Token / SBT pattern)
 *  - The contract owner (backend admin) can update tokenURI and state hash
 */
contract SoulCore is ERC721, Ownable {
    using Strings for uint256;

    // ─── State ──────────────────────────────────────────────────────────────

    uint256 private _nextTokenId;

    /// @dev wallet_address → tokenId (0 = not minted)
    mapping(address => uint256) private _walletToToken;

    /// @dev tokenId → current IPFS / API metadata URI
    mapping(uint256 => string) private _tokenURIs;

    /// @dev tokenId → keccak256 hash of current off-chain character state JSON
    mapping(uint256 => bytes32) private _stateHashes;

    /// @dev tokenId → archetype string (e.g. "rug_necromancer")
    mapping(uint256 => string) private _archetypes;

    /// @dev tokenId → keccak256 hash of the Persona DNA at genesis
    mapping(uint256 => bytes32) private _dnaHashes;

    // ─── Events ──────────────────────────────────────────────────────────────

    event SoulCoreCreated(address indexed wallet, uint256 indexed tokenId, string archetype);
    event SoulCoreUpdated(uint256 indexed tokenId, bytes32 newStateHash, string newTokenURI);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error AlreadyMinted();
    error TransferForbidden();
    error NotOwner();
    error ArchetypeImmutable();

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() ERC721("DegenBorn Soul Core", "SOUL") Ownable(msg.sender) {
        _nextTokenId = 1; // start at 1 so 0 = unminted sentinel
    }

    // ─── Mint ─────────────────────────────────────────────────────────────────

    /**
     * @notice Mint a Soul Core for a wallet.
     *         Callable only by the contract owner (backend admin).
     *         One per wallet — reverts if wallet already has a Soul Core.
     *
     * @param to          Wallet address to receive the token
     * @param archetype   Archetype string ("rug_necromancer", "mad_gambler", …)
     * @param dnaHash     keccak256 hash of the Persona DNA JSON
     * @param stateHash   keccak256 hash of the initial character state JSON
     * @param tokenURI_   Metadata URI (IPFS CID or hosted URL)
     */
    function mint(
        address to,
        string calldata archetype,
        bytes32 dnaHash,
        bytes32 stateHash,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        if (_walletToToken[to] != 0) revert AlreadyMinted();

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _walletToToken[to] = tokenId;
        _archetypes[tokenId] = archetype;
        _dnaHashes[tokenId] = dnaHash;
        _stateHashes[tokenId] = stateHash;
        _tokenURIs[tokenId] = tokenURI_;

        emit SoulCoreCreated(to, tokenId, archetype);
    }

    // ─── Update (admin only) ─────────────────────────────────────────────────

    /**
     * @notice Update the character state hash and metadata URI after evolution.
     *         Only the contract owner can call this.
     *         The archetype field is permanently set at mint and cannot be changed here.
     *
     * @param tokenId       Token to update
     * @param newStateHash  keccak256 of the new off-chain character state JSON
     * @param newTokenURI   New metadata URI (IPFS CID or hosted URL)
     */
    function updateState(
        uint256 tokenId,
        bytes32 newStateHash,
        string calldata newTokenURI
    ) external onlyOwner {
        _requireOwned(tokenId);
        // NOTE: archetype (_archetypes[tokenId]) is set at mint and must not change.
        // Any attempt to change it should call the archetype-gated function below,
        // which will always revert (archetype is immutable by design).
        _stateHashes[tokenId] = newStateHash;
        _tokenURIs[tokenId] = newTokenURI;
        emit SoulCoreUpdated(tokenId, newStateHash, newTokenURI);
    }

    /**
     * @notice Guard: archetype cannot be updated after mint.
     *         Reverts always — provided as an explicit signal that this is intentional.
     */
    function updateArchetype(uint256 /* tokenId */, string calldata /* newArchetype */) external pure {
        revert ArchetypeImmutable();
    }

    // ─── Transfer guard (Soulbound) ───────────────────────────────────────────

    /**
     * @dev Override _update to block all transfers except mint (from == address(0))
     *      and burn (to == address(0)).
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            // Neither mint nor burn — block it
            revert TransferForbidden();
        }
        // Clear wallet mapping on burn
        if (to == address(0) && from != address(0)) {
            delete _walletToToken[from];
        }
        return super._update(to, tokenId, auth);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function tokenOfWallet(address wallet) external view returns (uint256) {
        return _walletToToken[wallet];
    }

    function hasSoulCore(address wallet) external view returns (bool) {
        return _walletToToken[wallet] != 0;
    }

    function archetypeOf(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return _archetypes[tokenId];
    }

    function dnaHashOf(uint256 tokenId) external view returns (bytes32) {
        _requireOwned(tokenId);
        return _dnaHashes[tokenId];
    }

    function stateHashOf(uint256 tokenId) external view returns (bytes32) {
        _requireOwned(tokenId);
        return _stateHashes[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
