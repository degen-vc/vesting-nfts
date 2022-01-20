import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ERC20Mock__factory } from "../../typechain-types";

describe("ERC20Mock", () => {
  it("Successful Deploy", async () => {
    const deployer: string = await (await ethers.getSigners())[0].getAddress();
    const initSupply: BigNumber = parseEther("100000000");
    const token = await new ERC20Mock__factory(
      (
        await ethers.getSigners()
      )[0]
    ).deploy("Mock ERC20 Token", "MCK", deployer, initSupply);

    expect(await token.balanceOf(deployer))
      .to.eq(await token.totalSupply())
      .to.eq(initSupply);
  });
});
