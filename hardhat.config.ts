import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
dotenv.config();

const {PRIVATE_KEY, ETHERSCAN_API_KEY} = process.env;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

 export default {
  networks: {
    polygon: {
      url: `https://rpc-mainnet.matic.quiknode.pro`,
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url: `https://rpc.goerli.mudit.blog`,
      accounts: [PRIVATE_KEY],
    }
  },
  solidity: "0.8.10",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};