import chalk from 'chalk';
import * as hre from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { getCurrentAddresses } from '../../config/constants/addresses';
import { postDeploymentTest } from '../../test/common/post-deploy.helpers';
import {
  // eslint-disable-next-line camelcase
  AggregatorV3Interface__factory,
  // eslint-disable-next-line camelcase
  DataFeed__factory,
  // eslint-disable-next-line camelcase
  DepositVault__factory,
  // eslint-disable-next-line camelcase
  MidasAccessControl__factory,
  // eslint-disable-next-line camelcase
  RedemptionVault__factory,
  // eslint-disable-next-line camelcase
  MTBILL__factory,
} from '../../typechain-types';

export const POST_DEPLOY_TAG = 'POST_DEPLOY';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const owner = await hre.ethers.getSigner(deployer);

  const addresses = getCurrentAddresses(hre);

  if (!addresses) return;

  // eslint-disable-next-line camelcase
  const dataFeedContract = DataFeed__factory.connect(
    addresses.etfDataFeed,
    owner,
  );
  // eslint-disable-next-line camelcase
  const dataFeedEurContract = DataFeed__factory.connect(
    addresses.eurToUsdFeed,
    owner,
  );

  await postDeploymentTest(hre, {
    // eslint-disable-next-line camelcase
    accessControl: MidasAccessControl__factory.connect(
      addresses.accessControl,
      owner,
    ),
    // eslint-disable-next-line camelcase
    depositVault: DepositVault__factory.connect(addresses.depositVault, owner),
    // eslint-disable-next-line camelcase
    redemptionVault: RedemptionVault__factory.connect(
      addresses.redemptionVault,
      owner,
    ),
    // eslint-disable-next-line camelcase
    mTBILL: MTBILL__factory.connect(addresses.mTBILL, owner),
    // eslint-disable-next-line camelcase
    aggregator: AggregatorV3Interface__factory.connect(
      hre.ethers.constants.AddressZero,
      owner,
    ),
    dataFeed: dataFeedContract,
    dataFeedEur: dataFeedEurContract,
    // eslint-disable-next-line camelcase
    aggregatorEur: AggregatorV3Interface__factory.connect(
      hre.ethers.constants.AddressZero,
      owner,
    ),
    minAmountToDeposit: hre.ethers.utils.parseUnits('100000'),
    tokensReceiver: addresses.tokensReceiver,
    owner,
  });

  console.log(chalk.green('Post deployment checks completed'));
};

func(hre).then(console.log).catch(console.error);
