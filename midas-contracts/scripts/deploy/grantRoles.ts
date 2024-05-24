import chalk from 'chalk';
import * as hre from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { getCurrentAddresses } from '../../config/constants/addresses';
import { initGrantRoles } from '../../test/common/post-deploy.helpers';
import {
  // eslint-disable-next-line camelcase
  DepositVault__factory,
  // eslint-disable-next-line camelcase
  MidasAccessControl__factory,
  // eslint-disable-next-line camelcase
  RedemptionVault__factory,
  // eslint-disable-next-line camelcase
  MTBILL__factory,
} from '../../typechain-types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const owner = await hre.ethers.getSigner(deployer);

  const addresses = getCurrentAddresses(hre);

  if (!addresses) {
    console.log('addresses', { addresses });
    return;
  }

  await initGrantRoles({
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
    owner,
  });

  console.log(chalk.green('Roles granted'));
};

func(hre).then(console.log).catch(console.error);
