// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const { items } = require("../src/items.json")
const { ethers } = require("hardhat")


const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

  // setup account
  const [deployer] = await ethers.getSigners();

  // deployer dappazon
  const Dappazon = await ethers.getContractFactory("Dappazon")
  const dappazon = await Dappazon.deploy()
  await dappazon.deployed()

  console.log(`Deploye dappazon address at : ${dappazon.address}\n`);
  
  // listing items 

  for ( let i = 0; i < items.length; i++){
    const transaction = await dappazon.connect(deployer).list(
      items[i].id,
      items[i].name,
      items[i].category,
      items[i].image,
      tokens(items[i].price),
      items[i].rating,
      items[i].stock,
      
    )
    await transaction.wait();
    console.log(`listed item ${items[i].id} ${items[i].name}:`);    
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
