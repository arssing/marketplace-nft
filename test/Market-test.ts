import { expect } from "chai";
import { ethers } from "hardhat";
import {ERC20, ERC20__factory, NFT721, NFT721__factory, NFTMarket, NFTMarket__factory} from "../typechain";

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

describe("NFTMarket-tests", function () {

  let NFT: NFT721;
  let token: ERC20;
  let market: NFTMarket;

  beforeEach(async () => {
    const [owner, user1, user2] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("ERC20",owner) as ERC20__factory;
    const NFTFactory = await ethers.getContractFactory("NFT721",owner) as NFT721__factory;
    const marketFactory = await ethers.getContractFactory("NFTMarket",owner) as NFTMarket__factory;
    const toMint = ethers.utils.parseEther("1");

    token = await tokenFactory.deploy("TestToken","STT");
    NFT = await NFTFactory.deploy("NFTTest","NFTT");
    await token.deployed();
    await NFT.deployed();

    market = await marketFactory.deploy(NFT.address, token.address, 6, 2);
    await NFT.connect(owner).addMinter(market.address);

    await token.connect(owner).mint(user1.address, toMint);
    await token.connect(owner).mint(user2.address, toMint);
    await token.connect(user1).approve(market.address, toMint);
    await token.connect(user2).approve(market.address, toMint);
  });

  it("createItem, listItem, buyItem, cancel", async function () {
    const [owner, user1] = await ethers.getSigners();
    const price = ethers.utils.parseEther("0.1");

    await market.connect(owner).createItem("URI", owner.address);
    await NFT.connect(owner).approve(market.address, 1);
    await market.connect(owner).listItem(1, price);

    await expect(
      market.connect(user1).cancel(2)
    ).to.be.revertedWith("NFTMarket::cancel:token not onSale");

    await expect(
      market.connect(user1).cancel(1)
    ).to.be.revertedWith("NFTMarket::cancel:you are not a seller");

    await market.connect(owner).cancel(1);

    expect(await NFT.ownerOf(1)).to.equal(owner.address);

    await expect(
      market.connect(user1).buyItem(1)
    ).to.be.revertedWith("NFTMarket::cancel:token not onSale");

    await NFT.connect(owner).approve(market.address, 1);
    await market.connect(owner).listItem(1, price);

    await market.connect(user1).buyItem(1);

    expect(await NFT.ownerOf(1)).to.equal(user1.address);
    expect(await token.balanceOf(owner.address)).to.equal(price);
  });

  it("listItemOnAuction, makeBid, finishAuction", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const startBalance = ethers.utils.parseEther("1");
    const minPrice = ethers.utils.parseEther("0.1");
    const bid1 = ethers.utils.parseEther("0.11");
    const bid2 = ethers.utils.parseEther("0.12");
    const bid3 = ethers.utils.parseEther("0.13");
    const checkBalance = ethers.utils.parseEther("0.88");

    await market.connect(owner).createItem("URI", owner.address);
    await NFT.connect(owner).approve(market.address, 1);
    await market.connect(owner).listItemOnAuction(1, minPrice);

    await expect(
      market.connect(user1).makeBid(2, ethers.utils.parseEther("0.01"))
    ).to.be.revertedWith("NFTMarket::makeBid:token not onAuction");

    await expect(
      market.connect(user1).makeBid(1, ethers.utils.parseEther("0.01"))
    ).to.be.revertedWith("NFTMarket::makeBid:your bid is too small");

    //bids > min
    await market.connect(user1).makeBid(1, bid1);
    await market.connect(user2).makeBid(1, bid2);

    expect(await token.balanceOf(user1.address)).to.equal(startBalance);
    expect(await token.balanceOf(user2.address)).to.equal(checkBalance);

    await market.connect(user1).makeBid(1, bid3);

    await expect(
      market.connect(user1).finishAuction(1)
    ).to.be.revertedWith("NFTMarket::finishAuction:auction time is not over");

    await delay(2000);

    await market.connect(user1).finishAuction(1);

    expect(await token.balanceOf(owner.address)).to.equal(bid3);
    expect(await NFT.ownerOf(1)).to.equal(user1.address);

    await expect(
      market.connect(user1).finishAuction(1)
    ).to.be.revertedWith("NFTMarket::finishAuction:token not onAuction");

    //bids == 0
    await NFT.connect(user1).approve(market.address, 1);
    await market.connect(user1).listItemOnAuction(1, minPrice);
    
    await delay(7000);

    await market.connect(user1).finishAuction(1);
    expect(await NFT.ownerOf(1)).to.equal(user1.address);

    //bids < min
    await NFT.connect(user1).approve(market.address, 1);
    await market.connect(user1).listItemOnAuction(1, minPrice);
    await market.connect(user2).makeBid(1, bid2);

    expect(await token.balanceOf(user2.address)).to.equal(checkBalance);
    await delay(6000);

    await market.connect(user1).finishAuction(1);

    expect(await token.balanceOf(user2.address)).to.equal(startBalance);
    expect(await NFT.ownerOf(1)).to.equal(user1.address);
  });
  

});
