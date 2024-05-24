import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { logPopulatedTx } from '..';

export const getAggregator = async (
  hre: HardhatRuntimeEnvironment,
  address: string,
) => {
  return await hre.ethers.getContractAt('AggregatorV3Mock', address);
};

task('prepareTx:aggregator:setRoundData')
  .addPositionalParam('address', undefined, undefined, types.string)
  .addPositionalParam('data', undefined, undefined, types.float)
  .setAction(async ({ data, address }, hre) => {
    const aggregatorContract = await getAggregator(hre, address);

    const dataParsed = hre.ethers.utils.parseUnits(
      data.toString(),
      await aggregatorContract.decimals(),
    );

    const populatedTx =
      await aggregatorContract.populateTransaction.setRoundData(dataParsed);

    logPopulatedTx(populatedTx);
  });
