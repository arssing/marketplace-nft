//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "./IERC721Mint.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTMarket is IERC721Receiver {

    event NFTCreated(address indexed _owner, uint _tokenId);
    event ListItem(address indexed _owner, uint _tokenId, uint _price);
    event Cancelled(address indexed _owner, uint _tokenId);
    event BuyItem(address indexed _seller, address indexed _buyer, uint _tokenId, uint _tokenPrice);
    event ListOnAuction(address indexed _owner, uint _tokenId, uint _minPrice);
    event MakeBid(address indexed _bidder, uint _tokenId, uint _newPrice);
    event FinishAuction(address indexed _seller, uint _tokenId, uint _price, bool _success);

    enum OrderStatus {
        unknown,
        onSale,
        cancelled,
        sold
    }

    enum AuctionStatus {
        unknown,
        onAuction,
        finished
    }

    struct Order {
        address seller;
        OrderStatus status;
        uint price;
    }

    struct Auction {
        address seller;
        address lastBidder;
        uint32 numBids;
        AuctionStatus status;
        uint minPrice;
        uint startTime;
    }

    address NFT;
    address token;
    uint32 minBids;
    uint minAuctionTime;

    mapping(uint => Order) public orders;
    mapping(uint => Auction) public auctions;

    constructor (address _NFTContract, address _ERC20Contract, uint _minAuctionTime, uint32 _minBids) {
        NFT = _NFTContract;
        token = _ERC20Contract;
        minAuctionTime = _minAuctionTime;
        minBids = _minBids;
    }

    function createItem(string memory _tokenURI, address _owner) public {
        uint tokenId = IERC721Mint(NFT).mint(_owner, _tokenURI);
        emit NFTCreated(_owner, tokenId);
    }

    function listItem(uint tokenId, uint price) public {
        IERC721Mint(NFT).safeTransferFrom(msg.sender, address(this), tokenId);
        
        orders[tokenId].seller = msg.sender;
        orders[tokenId].status = OrderStatus.onSale;
        orders[tokenId].price = price;

        emit ListItem(msg.sender, tokenId, price);
    }

    function cancel(uint tokenId) public {
        require(orders[tokenId].status == OrderStatus.onSale, "NFTMarket::cancel:token not onSale");
        require(orders[tokenId].seller == msg.sender, "NFTMarket::cancel:you are not a seller");
        
        IERC721Mint(NFT).safeTransferFrom(address(this), msg.sender, tokenId);
        orders[tokenId].status = OrderStatus.cancelled;

        emit Cancelled(msg.sender, tokenId);
    }

    function buyItem(uint tokenId) public {
        require(orders[tokenId].status == OrderStatus.onSale, "NFTMarket::cancel:token not onSale");

        IERC20(token).transferFrom(msg.sender, orders[tokenId].seller, orders[tokenId].price);
        IERC721Mint(NFT).safeTransferFrom(address(this), msg.sender, tokenId);
        orders[tokenId].status = OrderStatus.sold;

        emit BuyItem(orders[tokenId].seller, msg.sender, tokenId, orders[tokenId].price);
    }

    function listItemOnAuction(uint tokenId, uint minPrice) public {
        IERC721Mint(NFT).safeTransferFrom(msg.sender, address(this), tokenId);

        auctions[tokenId].seller = msg.sender;
        auctions[tokenId].minPrice = minPrice;
        auctions[tokenId].startTime = block.timestamp;
        auctions[tokenId].status = AuctionStatus.onAuction;

        emit ListOnAuction(msg.sender, tokenId, minPrice);
    }

    function makeBid(uint tokenId, uint price) public {
        require(auctions[tokenId].status == AuctionStatus.onAuction, "NFTMarket::makeBid:token not onAuction");
        require(auctions[tokenId].minPrice < price, "NFTMarket::makeBid:your bid is too small");

        IERC20(token).transferFrom(msg.sender, address(this), price);

        if (auctions[tokenId].numBids != 0) {
            IERC20(token).transfer(auctions[tokenId].lastBidder, auctions[tokenId].minPrice);
        }

        auctions[tokenId].lastBidder = msg.sender;
        auctions[tokenId].minPrice = price;
        auctions[tokenId].numBids += 1;

        emit MakeBid(msg.sender, tokenId, price);
    }

    function finishAuction(uint tokenId) public {
        require(auctions[tokenId].status == AuctionStatus.onAuction, "NFTMarket::finishAuction:token not onAuction");
        require(block.timestamp - auctions[tokenId].startTime > minAuctionTime, "NFTMarket::finishAuction:auction time is not over");
        
        bool success;

        if (auctions[tokenId].numBids < minBids) {
            success = false;
            IERC721Mint(NFT).safeTransferFrom(address(this), auctions[tokenId].seller, tokenId);

            if (auctions[tokenId].numBids != 0) {
                IERC20(token).transfer(auctions[tokenId].lastBidder, auctions[tokenId].minPrice);
            }

        } else {
            success = true;
            IERC721Mint(NFT).safeTransferFrom(address(this), auctions[tokenId].lastBidder, tokenId);
            IERC20(token).transfer(auctions[tokenId].seller, auctions[tokenId].minPrice);
        }

        auctions[tokenId].numBids = 0;
        auctions[tokenId].status = AuctionStatus.finished;
        
        emit FinishAuction(auctions[tokenId].seller, tokenId, auctions[tokenId].minPrice, success);
    }

    function onERC721Received(address,address,uint256,bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
