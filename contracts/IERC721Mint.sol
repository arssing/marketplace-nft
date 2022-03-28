// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

interface IERC721Mint is IERC721Enumerable, IAccessControl {
    function mint(address _recipient, string memory _tokenURI) external returns (uint);
    function addMinter(address minter) external;
}