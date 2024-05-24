import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { ConfigPerNetwork } from '../types/index';

export interface MidasAddresses {
  depositVault: string;
  redemptionVault: string;
  mTBILL: string;
  etfDataFeed: string;
  eurToUsdFeed: string;
  accessControl: string;
  tokensReceiver: string;
}

export const midasAddressesPerNetwork: ConfigPerNetwork<
  MidasAddresses | undefined
> = {
  main: {
    tokensReceiver: '0x875c06A295C41c27840b9C9dfDA7f3d819d8bC6A',
    accessControl: '0x0312A9D1Ff2372DDEdCBB21e4B6389aFc919aC4B',
    depositVault: '0xcbCf1e67F1988e2572a2A620321Aef2ff73369f0',
    // TODO: remove this data feed
    etfDataFeed: '0xc747FdDFC46CDC915bEA866D519dFc5Eae5c947f',
    eurToUsdFeed: '0x6022a020Ca5c611304B9E97F37AEE0C38455081A',
    redemptionVault: '0x8978e327FE7C72Fa4eaF4649C23147E279ae1470',
    mTBILL: '0xDD629E5241CbC5919847783e6C96B2De4754e438',
  },
  sepolia: {
    tokensReceiver: '0xa0819ae43115420beb161193b8D8Ba64C9f9faCC',
    depositVault: '0xE85f2B707Ec5Ae8e07238F99562264f304E30109',
    redemptionVault: '0xf3482c80d1A2883611De939Af7b0a970d5fcdC06',
    mTBILL: '0xefED40D1eb1577d1073e9C4F277463486D39b084',
    etfDataFeed: '0x4E677F7FE252DE44682a913f609EA3eb6F29DC3E',
    eurToUsdFeed: '0xE23c07Ecad6D822500CbE8306d72A90578CA9F11',
    accessControl: '0xbf25b58cB8DfaD688F7BcB2b87D71C23A6600AaC',
  },
  hardhat: undefined,
  localhost: {
    tokensReceiver: '0x875c06A295C41c27840b9C9dfDA7f3d819d8bC6A',
    accessControl: '0x0312A9D1Ff2372DDEdCBB21e4B6389aFc919aC4B',
    depositVault: '0xcbCf1e67F1988e2572a2A620321Aef2ff73369f0',
    etfDataFeed: '',
    eurToUsdFeed: '0x6022a020Ca5c611304B9E97F37AEE0C38455081A',
    redemptionVault: '0x8978e327FE7C72Fa4eaF4649C23147E279ae1470',
    mTBILL: '0xDD629E5241CbC5919847783e6C96B2De4754e438',
  },
};

export const getCurrentAddresses = (hre: HardhatRuntimeEnvironment) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (midasAddressesPerNetwork as any)[hre.network.name] as
    | MidasAddresses
    | undefined;
};
