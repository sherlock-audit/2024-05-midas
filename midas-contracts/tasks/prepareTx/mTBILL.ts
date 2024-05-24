import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { logPopulatedTx } from '..';
import { getCurrentAddresses } from '../../config/constants/addresses';

export const getMTBill = async (hre: HardhatRuntimeEnvironment) => {
  const addresses = getCurrentAddresses(hre);
  return await hre.ethers.getContractAt('mTBILL', addresses?.mTBILL ?? '');
};

task('prepareTx:mTBILL:mint')
  .addPositionalParam('to', undefined, undefined, types.string)
  .addPositionalParam('amount', undefined, undefined, types.float)
  .setAction(async ({ to, amount }, hre) => {
    const amountParsed = hre.ethers.utils.parseUnits(amount.toString());

    const mTBillContract = await getMTBill(hre);

    const populatedTx = await mTBillContract.populateTransaction.mint(
      to,
      amountParsed,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:mTBILL:burn')
  .addPositionalParam('from', undefined, undefined, types.string)
  .addPositionalParam('amount', undefined, undefined, types.float)
  .setAction(async ({ from, amount }, hre) => {
    const amountParsed = hre.ethers.utils.parseUnits(amount.toString());
    const mTBillContract = await getMTBill(hre);

    const populatedTx = await mTBillContract.populateTransaction.burn(
      from,
      amountParsed,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:mTBILL:pause').setAction(async (_, hre) => {
  const mTBillContract = await getMTBill(hre);

  const populatedTx = await mTBillContract.populateTransaction.pause();

  logPopulatedTx(populatedTx);
});

task('prepareTx:mTBILL:unpause').setAction(async (_, hre) => {
  const mTBillContract = await getMTBill(hre);

  const populatedTx = await mTBillContract.populateTransaction.unpause();

  logPopulatedTx(populatedTx);
});

task('prepareTx:mTBILL:setMetadata')
  .addPositionalParam('key', undefined, undefined, types.string)
  .addPositionalParam('value', undefined, undefined, types.string)
  .setAction(async ({ key, value }, hre) => {
    const keyBytes32 = hre.ethers.utils.solidityKeccak256(['string'], [key]);
    const valueBytes = hre.ethers.utils.defaultAbiCoder.encode(
      ['string'],
      [value],
    );

    const mTBillContract = await getMTBill(hre);

    const populatedTx = await mTBillContract.populateTransaction.setMetadata(
      keyBytes32,
      valueBytes,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:mTBILL:addToBlackList')
  .addPositionalParam('account', undefined, undefined, types.string)
  .setAction(async ({ account }, hre) => {
    const mTBillContract = await getMTBill(hre);

    const populatedTx = await mTBillContract.populateTransaction.addToBlackList(
      account,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:mTBILL:removeFromBlackList')
  .addPositionalParam('account', undefined, undefined, types.string)
  .setAction(async ({ account }, hre) => {
    const mTBillContract = await getMTBill(hre);

    const populatedTx =
      await mTBillContract.populateTransaction.removeFromBlackList(account);

    logPopulatedTx(populatedTx);
  });
