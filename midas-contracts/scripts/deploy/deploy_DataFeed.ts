import { expect } from 'chai';
import chalk from 'chalk';
import { parseUnits } from 'ethers/lib/utils';
import * as hre from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import {
  DATA_FEED_CONTRACT_NAME,
  MOCK_AGGREGATOR_NETWORK_TAG,
} from '../../config';
import { getCurrentAddresses } from '../../config/constants/addresses';
import {
  logDeploy,
  logDeployProxy,
  tryEtherscanVerifyImplementation,
} from '../../helpers/utils';
// eslint-disable-next-line camelcase
import { AggregatorV3Mock__factory } from '../../typechain-types';

// EUR/USD: 0xb49f677943bc038e9857d61e7d053caa2c1734c1
// IB01/USD: 0x32d1463eb53b73c095625719afa544d5426354cb

const aggregatorsByNetwork: Record<number, string> = {
  1: '0x32d1463eb53b73c095625719afa544d5426354cb',
  11155111: '',
};

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const owner = await hre.ethers.getSigner(deployer);

  let aggregator: string;

  if (hre.network.tags[MOCK_AGGREGATOR_NETWORK_TAG]) {
    console.log(
      chalk.bold.yellow(
        'MOCK_AGGREGATOR_NETWORK_TAG is true, deploying mocked data aggregator',
      ),
    );
    console.log('Deploying AggregatorV3Mock...');
    const aggregatorDeploy = await (
      await (
        await hre.ethers.getContractFactory('AggregatorV3Mock', owner)
      ).deploy()
    ).deployed();
    console.log('Deployed AggregatorV3Mock:', aggregatorDeploy.address);

    // eslint-disable-next-line camelcase
    const aggregatorContract = AggregatorV3Mock__factory.connect(
      aggregatorDeploy.address,
      owner,
    );

    if ((await aggregatorContract.latestRoundData()).answer.eq('0')) {
      const newData = parseUnits(
        '5',
        await aggregatorContract.decimals(),
      ).toString();
      await aggregatorContract.setRoundData(newData);
    }

    aggregator = aggregatorContract.address;

    logDeploy('AggregatorV3Mock', undefined, aggregatorContract.address);
  } else {
    console.log(
      chalk.bold.yellow(
        'MOCK_AGGREGATOR_NETWORK_TAG is false, using production aggregator',
      ),
    );

    aggregator = aggregatorsByNetwork[hre.network.config.chainId ?? 1];
    expect(aggregator).not.eq(undefined);
  }

  const addresses = getCurrentAddresses(hre);

  console.log('Deploying DataFeed...', aggregator);
  const deployment = await hre.upgrades.deployProxy(
    await hre.ethers.getContractFactory(DATA_FEED_CONTRACT_NAME, owner),
    [addresses?.accessControl, aggregator],
    {
      unsafeAllow: ['constructor'],
    },
  );
  console.log('Deployed DataFeed:', deployment.address);

  if (deployment.deployTransaction) {
    console.log('Waiting 5 blocks...');
    await deployment.deployTransaction.wait(5);
    console.log('Waited.');
  }
  await logDeployProxy(hre, DATA_FEED_CONTRACT_NAME, deployment.address);
  await tryEtherscanVerifyImplementation(hre, deployment.address);
};

func(hre).then(console.log).catch(console.error);
