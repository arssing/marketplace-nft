import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("NFTMarket");
  let contract = await factory.deploy("0x92465fFA714Bf4370C6d9Af96D7B14483E6Ba1a8","0x72e835E9896A6327202983DFb5499Bf310600f59", 20, 2);

  await contract.deployed();
  console.log(`Contract address: ${contract.address}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });