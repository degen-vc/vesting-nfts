import { Contract } from "ethers";
import { ethers, run, network } from "hardhat";

export class Deployer {
  async deployAndVerify(
    location: string,
    ...constructorArgs: any[]
  ): Promise<[Contract, string]> {
    const Factory = await ethers.getContractFactory(location);
    const contract = await Factory.deploy(...constructorArgs);
    await contract.deployed();
    const name = location.substring(location.indexOf(":") + 1);
    let logResult: string;
    try {
      console.log(
        "Waiting 60 seconds for Etherscan update before verification request..."
      );
      await new Promise((resolve) => setTimeout(resolve, 60000)); // pause for Etherscan update
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: [...constructorArgs],
        contract: location,
      });
      logResult =
        `${name} deployed and verified to: ` + contract.address + `\n`;
    } catch (err) {
      logResult = `Error during verifying ${name}, please try to verify manually: \n`;
      const constructorArgsList = [...constructorArgs];
      logResult += `npx hardhat verify --network ${network.name} --contract ${location} ${contract.address} ${constructorArgsList}\n`;
    }
    return [contract, logResult];
  }
}
