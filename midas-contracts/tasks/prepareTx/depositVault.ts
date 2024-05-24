import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { logPopulatedTx } from '..';
import { getCurrentAddresses } from '../../config/constants/addresses';

export const getDepositVault = async (hre: HardhatRuntimeEnvironment) => {
  const addresses = getCurrentAddresses(hre);
  return await hre.ethers.getContractAt(
    'DepositVault',
    addresses?.depositVault ?? '',
  );
};

task('prepareTx:depositVault:fulfillManualDeposit(address,uin256)')
  .addPositionalParam('user', undefined, undefined, types.string)
  .addPositionalParam('amountUsdIn', undefined, undefined, types.float)
  .setAction(async ({ user, amountUsdIn }, hre) => {
    const amountParsed = hre.ethers.utils.parseUnits(amountUsdIn.toString());

    const depositVaultContract = await getDepositVault(hre);

    const populatedTx = await depositVaultContract.populateTransaction[
      'fulfillManualDeposit(address,uint256)'
    ](user, amountParsed);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:fulfillManualDeposit(address,uin256,uin256)')
  .addPositionalParam('user', undefined, undefined, types.string)
  .addPositionalParam('amountUsdIn', undefined, undefined, types.float)
  .addPositionalParam('amountMTbillOut', undefined, undefined, types.float)
  .setAction(async ({ user, amountUsdIn, amountMTbillOut }, hre) => {
    const amountInParsed = hre.ethers.utils.parseUnits(amountUsdIn.toString());
    const amountOutParsed = hre.ethers.utils.parseUnits(
      amountMTbillOut.toString(),
    );

    const depositVaultContract = await getDepositVault(hre);

    const populatedTx = await depositVaultContract.populateTransaction[
      'fulfillManualDeposit(address,uint256,uint256)'
    ](user, amountInParsed, amountOutParsed);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:setMinAmountToDeposit')
  .addPositionalParam('value', undefined, undefined, types.float)
  .setAction(async ({ value }, hre) => {
    const valueParsed = hre.ethers.utils.parseUnits(value.toString());

    const depositVaultContract = await getDepositVault(hre);

    const populatedTx =
      await depositVaultContract.populateTransaction.setMinAmountToDeposit(
        valueParsed,
      );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:withdrawToken')
  .addPositionalParam('token', undefined, undefined, types.string)
  .addPositionalParam('amount', undefined, undefined, types.float)
  .addPositionalParam('withdrawTo', undefined, undefined, types.string)

  .setAction(async ({ token, amount, withdrawTo }, hre) => {
    const amountParsed = hre.ethers.utils.parseUnits(amount.toString());

    const depositVaultContract = await getDepositVault(hre);

    const populatedTx =
      await depositVaultContract.populateTransaction.withdrawToken(
        token,
        amountParsed,
        withdrawTo,
      );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:addPaymentToken')
  .addPositionalParam('token', undefined, undefined, types.string)
  .setAction(async ({ token }, hre) => {
    const depositVaultContract = await getDepositVault(hre);

    const populatedTx =
      await depositVaultContract.populateTransaction.addPaymentToken(token);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:removePaymentToken')
  .addPositionalParam('token', undefined, undefined, types.string)
  .setAction(async ({ token }, hre) => {
    const depositVaultContract = await getDepositVault(hre);

    const populatedTx =
      await depositVaultContract.populateTransaction.removePaymentToken(token);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:setFee')
  .addPositionalParam('newValue', undefined, undefined, types.float)
  .setAction(async ({ newValue }, hre) => {
    const depositVaultContract = await getDepositVault(hre);

    const newValueParsed = Math.floor(
      newValue * (await depositVaultContract.PERCENTAGE_BPS()).toNumber(),
    );

    console.log({ newValueParsed });

    const populatedTx = await depositVaultContract.populateTransaction.setFee(
      newValueParsed,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:addToGreenList')
  .addPositionalParam('account', undefined, undefined, types.string)
  .setAction(async ({ account }, hre) => {
    const depositVaultContract = await getDepositVault(hre);

    const populatedTx =
      await depositVaultContract.populateTransaction.addToGreenList(account);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:depositVault:removeFromGreenList')
  .addPositionalParam('account', undefined, undefined, types.string)
  .setAction(async ({ account }, hre) => {
    const depositVaultContract = await getDepositVault(hre);

    const populatedTx =
      await depositVaultContract.populateTransaction.removeFromGreenList(
        account,
      );

    logPopulatedTx(populatedTx);
  });
