import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Ganache } from "./helpers/ganache";
import {
  RarityVeNFT__factory,
  RarityVeNFT,
  ERC20Mock__factory,
  ERC20Mock,
  DateTime__factory,
} from "../typechain-types";

describe("VestingNFT", () => {
  const ganache = new Ganache();
  const initSupply: BigNumber = parseEther("100000000");
  const SECONDS_IN_DAY = 24 * 60 * 60;

  let signers: SignerWithAddress[];
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let token: ERC20Mock;
  let vestingNFT: RarityVeNFT;

  beforeEach("Deploy and setup contracts", async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    user = signers[1];

    token = await new ERC20Mock__factory(owner).deploy(
      "Mock ERC20 Token",
      "MCK",
      owner.address,
      initSupply
    );

    const dateTime = await new DateTime__factory(owner).deploy();

    vestingNFT = await new RarityVeNFT__factory(owner).deploy(
      token.address,
      dateTime.address
    );

    await ganache.snapshot();
  });

  afterEach("revert", function () {
    return ganache.revert();
  });

  it("Should be possible to mint NFT, claim tokens from it and transfer NFT after", async () => {
    await token.connect(owner).transfer(vestingNFT.address, initSupply);
    await vestingNFT.connect(owner).addController(owner.address);

    await vestingNFT.mint(user.address, parseEther("50000"), 10);

    expect(await vestingNFT.balanceOf(user.address)).to.be.eq(1);

    await ganache.increaseTime(SECONDS_IN_DAY);

    await vestingNFT.connect(user).claim(1);

    expect(await token.balanceOf(user.address))
      .to.be.least(parseEther("5000"))
      .and.to.be.below(parseEther("5001"));

    await vestingNFT
      .connect(user)
      .transferFrom(user.address, signers[2].address, 1);

    expect(await vestingNFT.balanceOf(user.address)).to.be.eq(0);
  });

  it("Should be NOT possible to mint NFT if not enough tokens on contract balance", async () => {
    await token
      .connect(owner)
      .transfer(vestingNFT.address, parseEther("40000"));
    await vestingNFT.connect(owner).addController(owner.address);

    await expect(
      vestingNFT.mint(user.address, parseEther("50000"), 10)
    ).to.be.revertedWith("Not enough tokens for minting");
  });

  it("Should be NOT possible to mint few NFTs if their balance sum grater than contract balance", async () => {
    await token
      .connect(owner)
      .transfer(vestingNFT.address, parseEther("40000"));
    await vestingNFT.connect(owner).addController(owner.address);

    await vestingNFT.mint(user.address, parseEther("30000"), 10);

    expect(await vestingNFT.balanceOf(user.address)).to.be.eq(1);

    await expect(
      vestingNFT.mint(user.address, parseEther("10001"), 10)
    ).to.be.revertedWith("Not enough tokens for minting");
  });

  it("Should be possible to mint NFT and claim full distribution from it after duration period ends", async () => {
    await token.connect(owner).transfer(vestingNFT.address, initSupply);
    await vestingNFT.connect(owner).addController(owner.address);

    await vestingNFT.mint(user.address, parseEther("50000"), 10);

    expect(await vestingNFT.balanceOf(user.address)).to.be.eq(1);

    await ganache.increaseTime(SECONDS_IN_DAY * 10);

    await vestingNFT.connect(user).claim(1);

    expect(await token.balanceOf(user.address)).to.be.eq(parseEther("50000"));
  });

  it("Should be possible to claim only 1/10 of tokens after 1/10 duration period", async () => {
    await token.connect(owner).transfer(vestingNFT.address, initSupply);
    await vestingNFT.connect(owner).addController(owner.address);

    await vestingNFT.mint(user.address, parseEther("10000"), 10);

    expect(await vestingNFT.balanceOf(user.address)).to.be.eq(1);

    await ganache.increaseTime(SECONDS_IN_DAY * 1);

    await vestingNFT.connect(user).claim(1);

    expect(await token.balanceOf(user.address))
      .to.be.least(parseEther("1000"))
      .and.to.be.below(parseEther("1001"));
  });

  it("Should be NOT possible to mint NFT from non controller address", async () => {
    await token.connect(owner).transfer(vestingNFT.address, initSupply);

    await expect(
      vestingNFT.mint(user.address, parseEther("50000"), 10)
    ).to.be.revertedWith("Only controllers can mint");
  });
});
