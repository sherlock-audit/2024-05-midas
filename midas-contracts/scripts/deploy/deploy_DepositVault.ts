import * as hre from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { DEPOSIT_VAULT_CONTRACT_NAME } from '../../config';
import { getCurrentAddresses } from '../../config/constants/addresses';
import {
  logDeployProxy,
  tryEtherscanVerifyImplementation,
} from '../../helpers/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const owner = await hre.ethers.getSigner(deployer);

  const addresses = getCurrentAddresses(hre);

  console.log('Deploying DepositVault...');
  const deployment = await hre.upgrades.deployProxy(
    await hre.ethers.getContractFactory(DEPOSIT_VAULT_CONTRACT_NAME, owner),
    [
      addresses?.accessControl,
      addresses?.mTBILL,
      addresses?.eurToUsdFeed,
      hre.ethers.utils.parseUnits('100000'),
      addresses?.tokensReceiver,
    ],
    {
      unsafeAllow: ['constructor'],
    },
  );
  console.log('Deployed DepositVault:', deployment.address);

  if (deployment.deployTransaction) {
    console.log('Waiting 5 blocks...');
    await deployment.deployTransaction.wait(5);
    console.log('Waited.');
  }

  await logDeployProxy(hre, DEPOSIT_VAULT_CONTRACT_NAME, deployment.address);
  await tryEtherscanVerifyImplementation(hre, deployment.address);
};

func(hre).then(console.log).catch(console.error);
