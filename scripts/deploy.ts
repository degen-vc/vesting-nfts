import { Deployer } from "./helpers/deployer";
import { ethers, network } from "hardhat";
import { Contract } from "ethers";
import { DateTime__factory } from "../typechain-types";

const { SGV_TOKEN } = process.env;

async function main() {
  const deployer = new Deployer();
  const signers = await ethers.getSigners();
  const owner = signers[0];

  let log: string;
  let logResult = "";
  let vestingNFT: Contract;
  let dateTime: Contract;

  [dateTime, log] = await deployer.deployAndVerify(
    "contracts/utils/DateTime.sol:DateTime"
  );
  logResult += log;

  [vestingNFT, log] = await deployer.deployAndVerify(
    "contracts/WoolPouch.sol:WoolPouch",
    SGV_TOKEN,
    dateTime.address
  );
  logResult += log;

  console.log(logResult);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
