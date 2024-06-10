import '@nomicfoundation/hardhat-toolbox'
import { HardhatUserConfig } from 'hardhat/config'

require('dotenv').config()

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
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [process.env.WALLET_PRIVATE_KEY as string],
      gasPrice: 1000000000
    },
    // for mainnet
    'base-mainnet': {
      url: 'https://mainnet.base.org',
      accounts: [process.env.WALLET_PRIVATE_KEY as string],
      gasPrice: 1000000000
    }
  },
  etherscan: {
    apiKey: {
      'base-sepolia': 'PLACEHOLDER_STRING'
    },
    customChains: [
      {
        network: 'base-sepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org'
        }
      }
    ]
  },
  defaultNetwork: 'hardhat'
}

export default config
