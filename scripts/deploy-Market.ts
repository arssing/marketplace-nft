import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("NFTMarket");
  let contract = await factory.deploy("0xe53Af206Da6C8c2675778077595EA429aEc456e9","0xd86c499D3c284E80558f343Aa1b87E0E18c77d66", 20, 2);

  await contract.deployed();
  console.log(`Contract address: ${contract.address}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });