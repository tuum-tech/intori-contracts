import '@nomicfoundation/hardhat-toolbox'
import { HardhatUserConfig, task } from 'hardhat/config'

require('dotenv').config()

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 40000
  },
  networks: {
    // for hardhat local testing
    hardhat: {},
    // for local dev environment
    localhost: {
      url: 'http://localhost:8545',
      accounts: [process.env.WALLET_PRIVATE_KEY as string],
      gasPrice: 1000000000
    },
    // for testnet
    base_sepolia: {
      url: 'https://sepolia.base.org',
      accounts: [process.env.WALLET_PRIVATE_KEY as string],
      gasPrice: 1000000000
    },
    // for mainnet
    base_mainnet: {
      url: 'https://mainnet.base.org',
      accounts: [process.env.WALLET_PRIVATE_KEY as string],
      gasPrice: 1000000000
    }
  },
  etherscan: {
    apiKey: {
      base_sepolia: process.env.ETHERSCAN_API_KEY as string,
      base_mainnet: process.env.ETHERSCAN_API_KEY as string
    },
    customChains: [
      {
        network: 'base_sepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org'
        }
      },
      {
        network: 'base_mainnet',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org'
        }
      }
    ]
  },
  defaultNetwork: 'hardhat'
}

export default config
