import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("NFT721");
  let contract = await factory.deploy("KozinakToken","KOT");

  await contract.deployed();
  console.log(`Contract address: ${contract.address}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });