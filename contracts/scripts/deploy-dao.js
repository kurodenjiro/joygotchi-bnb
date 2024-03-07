const {
  Contract,
  ContractFactory,
  utils,
  BigNumber,
  constants,
  getSigners,
} = require("ethers");
const { ethers } = require("hardhat");


async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TREASURY_ADDRESS = '';
  const GOV_TOKEN = '';
  const MIN_THRESHOLD_VALUE = 0;

  const DAO = await ethers.getContractFactory("DAO");
  const dao = await DAO.deploy(
    TREASURY_ADDRESS,
    GOV_TOKEN,
    MIN_THRESHOLD_VALUE,
  );

  await dao.waitForDeployment();

  console.log("DAO:", dao.target);

  // note grant DAO as owner of NFT
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
