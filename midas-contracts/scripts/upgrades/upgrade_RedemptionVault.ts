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
  const owner = await hre.ethers.getSigner(deployer);

  const deployment = await hre.upgrades.upgradeProxy(
    addresses?.redemptionVault ?? '',
    await hre.ethers.getContractFactory(REDEMPTION_VAULT_CONTRACT_NAME, owner),
  );

  if (deployment.deployTransaction) {
    await deployment.deployTransaction.wait(5);
  }
  await logDeployProxy(hre, REDEMPTION_VAULT_CONTRACT_NAME, deployment.address);
  await tryEtherscanVerifyImplementation(hre, deployment.address);
};

func(hre).then(console.log).catch(console.error);
