//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "./IERC721Mint.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFT721 is ERC721Enumerable, AccessControl {
    mapping (uint => string) tokenURIs;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor (
        string memory _name, 
        string memory _symbol
    ) 
    ERC721(_name, _symbol) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function mint(address _recipient, string memory _tokenURI) public returns (uint) {
        require(hasRole(MINTER_ROLE, msg.sender), "NFT721::mint:Caller is not a minter");

        uint256 newTokenId = totalSupply() + 1;
        _safeMint(_recipient, newTokenId);
        tokenURIs[newTokenId] = _tokenURI;

        return newTokenId;
    }

    function tokenURI(uint _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "NFT721::tokenURI:nonexistent token");
        return tokenURIs[_tokenId];
    }

    function addMinter(address minter) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "NFT721::addMinter:Caller is not a admin");
        _setupRole(MINTER_ROLE, minter);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, AccessControl) returns (bool) {
        return 
                interfaceId == type(IERC721Mint).interfaceId || 
                super.supportsInterface(interfaceId);
    }
}