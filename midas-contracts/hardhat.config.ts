import { type HardhatUserConfig } from 'hardhat/config';

import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-contract-sizer';
import 'hardhat-deploy';
// import 'hardhat-docgen';
import 'solidity-docgen';
import './tasks';

import {
  ENV,
  getForkNetworkConfig,
  getHardhatNetworkConfig,
  getNetworkConfig,
} from './config';

const { OPTIMIZER, REPORT_GAS, FORKING_NETWORK, ETHERSCAN_API_KEY } = ENV;

console.log({ FORKING_NETWORK });
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      1: '0xa0819ae43115420beb161193b8D8Ba64C9f9faCC',
      hardhat: '0xa0819ae43115420beb161193b8D8Ba64C9f9faCC',
      localhost: '0xa0819ae43115420beb161193b8D8Ba64C9f9faCC',
      sepolia: '0xa0819ae43115420beb161193b8D8Ba64C9f9faCC',
    },
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  networks: {
    main: getNetworkConfig('main', []),
    sepolia: getNetworkConfig('sepolia'),
    hardhat: FORKING_NETWORK
      ? getForkNetworkConfig(FORKING_NETWORK)
      : getHardhatNetworkConfig(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    localhost: getNetworkConfig('localhost', [], FORKING_NETWORK as any),
  },
  gasReporter: {
    enabled: REPORT_GAS,
  },
  contractSizer: {
    runOnCompile: OPTIMIZER,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    deploy: 'deploy/',
    deployments: 'deployments/',
  },
  docgen: {
    outputDir: './docgen',
    pages: 'single',
  },
  external: FORKING_NETWORK
    ? {
        deployments: {
          hardhat: ['deployments/' + FORKING_NETWORK],
          local: ['deployments/' + FORKING_NETWORK],
        },
      }
    : undefined,
};

export default config;
