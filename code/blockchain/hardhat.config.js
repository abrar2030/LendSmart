require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Deployment/verification credentials are optional for local development
// (compiling and running the test suite never requires them), but are
// needed to deploy or verify on a live network. Falling back to an empty
// array of accounts (rather than a placeholder private key) means a
// misconfigured .env fails fast with Hardhat's own "no signer" error
// instead of silently deploying from a well-known dummy key.
const {
  ETHEREUM_RPC_URL,
  ETHEREUM_PRIVATE_KEY,
  SEPOLIA_RPC_URL,
  SEPOLIA_PRIVATE_KEY,
  POLYGON_RPC_URL,
  POLYGON_PRIVATE_KEY,
  ARBITRUM_RPC_URL,
  ARBITRUM_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  ARBISCAN_API_KEY,
} = process.env;

function accountsFor(privateKey) {
  return privateKey ? [privateKey] : [];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // `hardhat` (in-process) and `localhost` (a separately running
    // `npx hardhat node`) work out of the box with no configuration.
    mainnet: {
      url: ETHEREUM_RPC_URL || "https://ethereum-rpc.publicnode.com",
      accounts: accountsFor(ETHEREUM_PRIVATE_KEY),
      chainId: 1,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: accountsFor(SEPOLIA_PRIVATE_KEY),
      chainId: 11155111,
    },
    polygon: {
      url: POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: accountsFor(POLYGON_PRIVATE_KEY),
      chainId: 137,
    },
    arbitrum: {
      url: ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: accountsFor(ARBITRUM_PRIVATE_KEY),
      chainId: 42161,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY || "",
      sepolia: ETHERSCAN_API_KEY || "",
      polygon: POLYGONSCAN_API_KEY || "",
      arbitrumOne: ARBISCAN_API_KEY || "",
    },
  },
};
