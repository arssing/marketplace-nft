import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

task("market-mint", "mint NFT by market")
    .addParam("contract","smart contract address")
    .addParam("uri","uri for NFT")
    .addParam("owner","owner for NFT")
    .setAction (async (taskArgs, hre) => {
    
    const marketFactory = await hre.ethers.getContractFactory("NFTMarket");
    const accounts = await hre.ethers.getSigners();

    const marketContract = new hre.ethers.Contract(
        taskArgs.contract,
        marketFactory.interface,
        accounts[0]
    );

    const tx = await marketContract.createItem(taskArgs.uri, taskArgs.owner);

    console.log(
        `tx hash: ${tx.hash}`
    );
});