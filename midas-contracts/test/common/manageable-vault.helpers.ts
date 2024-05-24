import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumberish } from 'ethers';

import { Account, OptionalCommonParams, getAccount } from './common.helpers';

import {
  DepositVault,
  ERC20,
  // eslint-disable-next-line camelcase
  ERC20__factory,
  RedemptionVault,
} from '../../typechain-types';

type CommonParamsChangePaymentToken = {
  vault: DepositVault | RedemptionVault;
  owner: SignerWithAddress;
};

export const addPaymentTokenTest = async (
  { vault, owner }: CommonParamsChangePaymentToken,
  token: ERC20 | string,
  opt?: OptionalCommonParams,
) => {
  token = (token as ERC20).address ?? (token as string);

  if (opt?.revertMessage) {
    await expect(
      vault.connect(opt?.from ?? owner).addPaymentToken(token),
    ).revertedWith(opt?.revertMessage);
    return;
  }

  await expect(
    vault.connect(opt?.from ?? owner).addPaymentToken(token),
  ).to.emit(
    vault,
    vault.interface.events['AddPaymentToken(address,address)'].name,
  ).to.not.reverted;

  const paymentTokens = await vault.getPaymentTokens();
  expect(paymentTokens.find((v) => v === token)).not.eq(undefined);
};

export const removePaymentTokenTest = async (
  { vault, owner }: CommonParamsChangePaymentToken,
  token: ERC20 | string,
  opt?: OptionalCommonParams,
) => {
  token = (token as ERC20).address ?? (token as string);

  if (opt?.revertMessage) {
    await expect(
      vault.connect(opt?.from ?? owner).removePaymentToken(token),
    ).revertedWith(opt?.revertMessage);
    return;
  }

  await expect(
    vault.connect(opt?.from ?? owner).removePaymentToken(token),
  ).to.emit(
    vault,
    vault.interface.events['RemovePaymentToken(address,address)'].name,
  ).to.not.reverted;

  const paymentTokens = await vault.getPaymentTokens();
  expect(paymentTokens.find((v) => v === token)).eq(undefined);
};

export const withdrawTest = async (
  { vault, owner }: CommonParamsChangePaymentToken,
  token: ERC20 | string,
  amount: BigNumberish,
  withdrawTo: Account,
  opt?: OptionalCommonParams,
) => {
  withdrawTo = getAccount(withdrawTo);
  token = getAccount(token);

  // eslint-disable-next-line camelcase
  const tokenContract = ERC20__factory.connect(token, owner);

  if (opt?.revertMessage) {
    await expect(
      vault
        .connect(opt?.from ?? owner)
        .withdrawToken(token, amount, withdrawTo),
    ).revertedWith(opt?.revertMessage);
    return;
  }

  const balanceBeforeContract = await tokenContract.balanceOf(vault.address);
  const balanceBeforeTo = await tokenContract.balanceOf(withdrawTo);

  await expect(
    vault.connect(opt?.from ?? owner).withdrawToken(token, amount, withdrawTo),
  ).to.emit(
    vault,
    vault.interface.events['WithdrawToken(address,address,address,uint256)']
      .name,
  ).to.not.reverted;

  const balanceAfterContract = await tokenContract.balanceOf(vault.address);
  const balanceAfterTo = await tokenContract.balanceOf(withdrawTo);

  expect(balanceAfterContract).eq(balanceBeforeContract.sub(amount));
  expect(balanceAfterTo).eq(balanceBeforeTo.add(amount));
};
