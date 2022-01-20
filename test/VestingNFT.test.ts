import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Ganache } from "./helpers/ganache";
import {
  WoolPouch__factory,
  WoolPouch,
  ERC20Mock__factory,
  ERC20Mock,
  DateTime__factory,
} from "../typechain-types";

describe("VestingNFT", () => {
  const ganache = new Ganache();
  const initSupply: BigNumber = parseEther("100000000");

  let signers: SignerWithAddress[];
  let owner: SignerWithAddress;
  let token: ERC20Mock;
  let vestingNFT: WoolPouch;

  beforeEach("Deploy and setup contracts", async () => {
    signers = await ethers.getSigners();
    owner = signers[0];

    token = await new ERC20Mock__factory(signers[0]).deploy(
      "Mock ERC20 Token",
      "MCK",
      await owner.getAddress(),
      initSupply
    );

    const dateTime = await new DateTime__factory(signers[0]).deploy();

    vestingNFT = await new WoolPouch__factory(signers[0]).deploy(
      token.address,
      dateTime.address
    );

    await token.connect(signers[0]).transfer(vestingNFT.address, initSupply);
    await ganache.snapshot();
  });

  afterEach("revert", function () {
    return ganache.revert();
  });

  it("Should be possible to mint NFT and claim tokens from it", async () => {
    await vestingNFT
      .connect(signers[0])
      .addController(await owner.getAddress());

    await vestingNFT.connect(signers[0]).setPaused(false);

    await vestingNFT.mint(
      await signers[1].getAddress(),
      parseEther("50000"),
      10
    );

    expect(await vestingNFT.balanceOf(await signers[1].getAddress())).to.be.eq(
      1
    );

    await ganache.increaseTime(60 * 60 * 24);

    await vestingNFT.connect(signers[1]).claim(1);

    expect(await token.balanceOf(await signers[1].getAddress()))
      .to.be.least(parseEther("5000"))
      .and.to.be.below(parseEther("5001"));
  });
});
