import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { logPopulatedTx } from '..';
import { getCurrentAddresses } from '../../config/constants/addresses';

export const getRedemptionVault = async (hre: HardhatRuntimeEnvironment) => {
  const addresses = getCurrentAddresses(hre);
  return await hre.ethers.getContractAt(
    'RedemptionVault',
    addresses?.redemptionVault ?? '',
  );
};

// task('prepareTx:redemptionVault:fulfillRedemptionRequest(uin256)')
//     .addPositionalParam('requestId', undefined, undefined, types.string)
//     .setAction(async ({
//         requestId
//     }, hre) => {
//         const redemptionVaultContract = await getRedemptionVault(hre);

//         const populatedTx = await redemptionVaultContract.populateTransaction[
//             'fulfillRedemptionRequest(uint256)'
//         ](requestId);

//         logPopulatedTx(
//             populatedTx
//         )
//     })

task('prepareTx:redemptionVault:fulfillRedemptionRequest(uin256,uint256)')
  .addPositionalParam('requestId', undefined, undefined, types.string)
  .addPositionalParam('amountUsdOut', undefined, undefined, types.float)
  .setAction(async ({ requestId, amountUsdOut }, hre) => {
    const amountUsdOutParsed = hre.ethers.utils.parseUnits(
      amountUsdOut.toString(),
    );

    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx = await redemptionVaultContract.populateTransaction[
      'fulfillRedemptionRequest(uint256,uint256)'
    ](requestId, amountUsdOutParsed);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:cancelRedemptionRequest')
  .addPositionalParam('requestId', undefined, undefined, types.string)
  .setAction(async ({ requestId }, hre) => {
    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.cancelRedemptionRequest(
        requestId,
      );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:manuallyRedeem(address,address,uint256)')
  .addPositionalParam('user', undefined, undefined, types.string)
  .addPositionalParam('tokenOut', undefined, undefined, types.string)
  .addPositionalParam('amountTBillIn', undefined, undefined, types.float)
  .setAction(async ({ user, tokenOut, amountTBillIn }, hre) => {
    const amountMTBillInParsed = hre.ethers.utils.parseUnits(
      amountTBillIn.toString(),
    );

    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx = await redemptionVaultContract.populateTransaction[
      'manuallyRedeem(address,address,uint256)'
    ](user, tokenOut, amountMTBillInParsed);

    logPopulatedTx(populatedTx);
  });

task(
  'prepareTx:redemptionVault:manuallyRedeem(address,address,uint256,uint256)',
)
  .addPositionalParam('user', undefined, undefined, types.string)
  .addPositionalParam('tokenOut', undefined, undefined, types.string)
  .addPositionalParam('amountTBillIn', undefined, undefined, types.float)
  .addPositionalParam('amountUsdOut', undefined, undefined, types.float)

  .setAction(async ({ user, tokenOut, amountTBillIn, amountUsdOut }, hre) => {
    const amountMTBillInParsed = hre.ethers.utils.parseUnits(
      amountTBillIn.toString(),
    );
    const amountUsdOutParsed = hre.ethers.utils.parseUnits(
      amountUsdOut.toString(),
    );

    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx = await redemptionVaultContract.populateTransaction[
      'manuallyRedeem(address,address,uint256,uint256)'
    ](user, tokenOut, amountMTBillInParsed, amountUsdOutParsed);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:setMinAmountToRedeem')
  .addPositionalParam('value', undefined, undefined, types.float)
  .setAction(async ({ value }, hre) => {
    const valueParsed = hre.ethers.utils.parseUnits(value.toString());

    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.setMinAmountToRedeem(
        valueParsed,
      );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:withdrawToken')
  .addPositionalParam('token', undefined, undefined, types.string)
  .addPositionalParam('amount', undefined, undefined, types.float)
  .addPositionalParam('withdrawTo', undefined, undefined, types.string)

  .setAction(async ({ token, amount, withdrawTo }, hre) => {
    const amountParsed = hre.ethers.utils.parseUnits(amount.toString());

    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.withdrawToken(
        token,
        amountParsed,
        withdrawTo,
      );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:addPaymentToken')
  .addPositionalParam('token', undefined, undefined, types.string)
  .setAction(async ({ token }, hre) => {
    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.addPaymentToken(token);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:removePaymentToken')
  .addPositionalParam('token', undefined, undefined, types.string)
  .setAction(async ({ token }, hre) => {
    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.removePaymentToken(
        token,
      );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:setFee')
  .addPositionalParam('newValue', undefined, undefined, types.float)
  .setAction(async ({ newValue }, hre) => {
    const redemptionVaultContract = await getRedemptionVault(hre);

    const newValueParsed = Math.floor(
      newValue * (await redemptionVaultContract.PERCENTAGE_BPS()).toNumber(),
    );

    console.log({ newValueParsed });

    const populatedTx =
      await redemptionVaultContract.populateTransaction.setFee(newValueParsed);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:addToGreenList')
  .addPositionalParam('account', undefined, undefined, types.string)
  .setAction(async ({ account }, hre) => {
    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.addToGreenList(account);

    logPopulatedTx(populatedTx);
  });

task('prepareTx:redemptionVault:removeFromGreenList')
  .addPositionalParam('account', undefined, undefined, types.string)
  .setAction(async ({ account }, hre) => {
    const redemptionVaultContract = await getRedemptionVault(hre);

    const populatedTx =
      await redemptionVaultContract.populateTransaction.removeFromGreenList(
        account,
      );

    logPopulatedTx(populatedTx);
  });
