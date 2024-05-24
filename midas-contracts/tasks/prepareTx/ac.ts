import { expect } from 'chai';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { logPopulatedTx } from '..';
import { getCurrentAddresses } from '../../config/constants/addresses';

export const getAc = async (hre: HardhatRuntimeEnvironment) => {
  const addresses = getCurrentAddresses(hre);
  return await hre.ethers.getContractAt(
    'MidasAccessControl',
    addresses?.accessControl ?? '',
  );
};

task('prepareTx:ac:grantRoleMult')
  .addPositionalParam('roles', undefined, undefined, types.string)
  .addPositionalParam('addresses', undefined, undefined, types.string)
  .setAction(async ({ roles, addresses }, hre) => {
    const rolesParsed = (roles as string).split(',');
    const addressesParsed = (addresses as string).split(',');

    expect(rolesParsed.length).to.eq(addressesParsed.length, 'LENGTH MISMATCH');

    const acContract = await getAc(hre);

    const populatedTx = await acContract.populateTransaction.grantRoleMult(
      rolesParsed,
      addressesParsed,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:ac:revokeRoleMult')
  .addPositionalParam('roles', undefined, undefined, types.string)
  .addPositionalParam('addresses', undefined, undefined, types.string)
  .setAction(async ({ roles, addresses }, hre) => {
    const rolesParsed = (roles as string).split(',');
    const addressesParsed = (addresses as string).split(',');

    expect(rolesParsed.length).to.eq(addressesParsed.length, 'LENGTH MISMATCH');

    const acContract = await getAc(hre);

    const populatedTx = await acContract.populateTransaction.revokeRoleMult(
      rolesParsed,
      addressesParsed,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:ac:grantRole')
  .addPositionalParam('role', undefined, undefined, types.string)
  .addPositionalParam('address', undefined, undefined, types.string)
  .setAction(async ({ role, address }, hre) => {
    const acContract = await getAc(hre);

    const populatedTx = await acContract.populateTransaction.grantRole(
      role,
      address,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:ac:revokeRole')
  .addPositionalParam('role', undefined, undefined, types.string)
  .addPositionalParam('address', undefined, undefined, types.string)
  .setAction(async ({ role, address }, hre) => {
    const acContract = await getAc(hre);

    const populatedTx = await acContract.populateTransaction.revokeRole(
      role,
      address,
    );

    logPopulatedTx(populatedTx);
  });

task('prepareTx:ac:renounceRole')
  .addPositionalParam('role', undefined, undefined, types.string)
  .addPositionalParam('address', undefined, undefined, types.string)
  .setAction(async ({ role, address }, hre) => {
    const acContract = await getAc(hre);

    const populatedTx = await acContract.populateTransaction.renounceRole(
      role,
      address,
    );

    logPopulatedTx(populatedTx);
  });
