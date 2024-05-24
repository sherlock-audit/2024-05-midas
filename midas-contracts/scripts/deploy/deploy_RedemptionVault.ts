import * as hre from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { REDEMPTION_VAULT_CONTRACT_NAME } from '../../config';
import { getCurrentAddresses } from '../../config/constants/addresses';
import {
  logDeployProxy,
  tryEtherscanVerifyImplementation,
} from '../../helpers/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const addresses = getCurrentAddresses(hre);

  const { deployer } = await hre.getNamedAccounts();

  console.log({ deployer });

  const owner = await hre.ethers.getSigner(deployer);

  console.log('Deploying RedemptionVault...');
  const deployment = await hre.upgrades.deployProxy(
    await hre.ethers.getContractFactory(REDEMPTION_VAULT_CONTRACT_NAME, owner),
    [addresses?.accessControl, addresses?.mTBILL, addresses?.tokensReceiver],
    {
      unsafeAllow: ['constructor'],
    },
  );
  console.log('Deployed RedemptionVault:', deployment.address);

  if (deployment.deployTransaction) {
    console.log('Waiting 5 blocks...');
    await deployment.deployTransaction.wait(5);
    console.log('Waited.');
  }
  await logDeployProxy(hre, REDEMPTION_VAULT_CONTRACT_NAME, deployment.address);
  await tryEtherscanVerifyImplementation(hre, deployment.address);
};

func(hre).then(console.log).catch(console.error);
