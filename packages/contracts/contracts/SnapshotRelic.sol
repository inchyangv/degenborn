// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SnapshotRelic
 * @notice Tradeable NFT that commemorates a major evolution milestone.
 *         Unlike Soul Core, Snapshot Relics ARE transferable.
 *         Each milestone type can be minted multiple times (one per event).
 *
 * Soul Core vs Snapshot Relic:
 *  - Soul Core: soulbound, 1/wallet, current identity
 *  - Snapshot Relic: tradeable, unlimited, historical moments
 */
contract SnapshotRelic is ERC721, Ownable {
    using Strings for uint256;

    // ─── Milestone Types ────────────────────────────────────────────────────

    enum MilestoneType {
        FIRST_CROWNED_WIN,    // first 3-win streak crown
        RUG_SURVIVOR,         // survived 3+ rug events
        SEVEN_DAY_RESURRECTION, // big loss → recovery within 7 days
        CHAOS_ASCENSION,      // reached corruption 80+
        DIAMOND_HANDS,        // held for 30+ days with profit
        GHOST_AWAKENING       // first entry into ghost mood and recovery
    }

    // ─── State ──────────────────────────────────────────────────────────────

    uint256 private _nextTokenId;

    /// @dev tokenId → metadata URI
    mapping(uint256 => string) private _tokenURIs;

    /// @dev tokenId → milestone type
    mapping(uint256 => MilestoneType) private _milestones;

    /// @dev tokenId → wallet that earned this relic (original earner)
    mapping(uint256 => address) private _earners;

    /// @dev wallet → milestone → count minted (cap: 1 per milestone type per wallet)
    mapping(address => mapping(MilestoneType => uint256)) private _walletMilestoneCount;

    // ─── Events ──────────────────────────────────────────────────────────────

    event RelicMinted(
        address indexed earner,
        uint256 indexed tokenId,
        MilestoneType indexed milestone,
        string tokenURI_
    );

    // ─── Errors ──────────────────────────────────────────────────────────────

    error MilestoneAlreadyEarned(address wallet, MilestoneType milestone);

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() ERC721("DegenBorn Snapshot Relic", "RELIC") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    // ─── Mint ─────────────────────────────────────────────────────────────────

    /**
     * @notice Mint a Snapshot Relic for a wallet that achieved a milestone.
     *         One relic per milestone type per wallet (enforced by backend).
     *         Callable only by contract owner (backend admin).
     *
     * @param to         Wallet that earned this relic
     * @param milestone  The milestone type achieved
     * @param tokenURI_  Metadata URI (IPFS / hosted)
     */
    function mint(
        address to,
        MilestoneType milestone,
        string calldata tokenURI_
    ) external onlyOwner returns (uint256 tokenId) {
        if (_walletMilestoneCount[to][milestone] > 0) {
            revert MilestoneAlreadyEarned(to, milestone);
        }

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _tokenURIs[tokenId] = tokenURI_;
        _milestones[tokenId] = milestone;
        _earners[tokenId] = to;
        _walletMilestoneCount[to][milestone]++;

        emit RelicMinted(to, tokenId, milestone, tokenURI_);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function milestoneOf(uint256 tokenId) external view returns (MilestoneType) {
        _requireOwned(tokenId);
        return _milestones[tokenId];
    }

    function earnerOf(uint256 tokenId) external view returns (address) {
        _requireOwned(tokenId);
        return _earners[tokenId];
    }

    function milestoneLabel(MilestoneType milestone) external pure returns (string memory) {
        if (milestone == MilestoneType.FIRST_CROWNED_WIN) return "First Crowned Win";
        if (milestone == MilestoneType.RUG_SURVIVOR) return "Rug Survivor";
        if (milestone == MilestoneType.SEVEN_DAY_RESURRECTION) return "Seven-Day Resurrection";
        if (milestone == MilestoneType.CHAOS_ASCENSION) return "Chaos Ascension";
        if (milestone == MilestoneType.DIAMOND_HANDS) return "Diamond Hands";
        if (milestone == MilestoneType.GHOST_AWAKENING) return "Ghost Awakening";
        return "Unknown";
    }

    function hasEarnedMilestone(address wallet, MilestoneType milestone) external view returns (bool) {
        return _walletMilestoneCount[wallet][milestone] > 0;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
