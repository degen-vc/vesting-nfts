import { network } from "hardhat";

export class Ganache {
  snapshotId: number;

  constructor() {
    this.snapshotId = 0;
  }

  async revert() {
    await network.provider.send("evm_revert", [this.snapshotId]);
    return this.snapshot();
  }

  async snapshot() {
    this.snapshotId = await network.provider.send("evm_snapshot", []);
  }

  async setTime(timestamp: number) {
    await network.provider.send("evm_mine", [timestamp]);
  }

  async increaseTime(time: number) {
    await network.provider.send("evm_increaseTime", [time]);
    await network.provider.send("evm_mine");
  }
}
