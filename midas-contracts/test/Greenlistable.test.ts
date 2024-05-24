import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

import { acErrors, greenList, unGreenList } from './common/ac.helpers';
import { defaultDeploy } from './common/fixtures';

import {
  // eslint-disable-next-line camelcase
  GreenlistableTester__factory,
} from '../typechain-types';

describe('Greenlistable', function () {
  it('deployment', async () => {
    const { accessControl, greenListableTester, roles } = await loadFixture(
      defaultDeploy,
    );

    expect(
      await accessControl.hasRole(
        roles.greenlistedOperator,
        greenListableTester.address,
      ),
    ).eq(true);
  });

  it('onlyInitializing', async () => {
    const { owner, accessControl } = await loadFixture(defaultDeploy);

    const greenListable = await new GreenlistableTester__factory(
      owner,
    ).deploy();

    await expect(
      greenListable.initializeWithoutInitializer(accessControl.address),
    ).revertedWith('Initializable: contract is not initializing');
  });

  describe('modifier onlyGreenlisted', () => {
    it('should fail: call from greenlisted user', async () => {
      const { greenListableTester, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      await expect(
        greenListableTester.onlyGreenlistedTester(regularAccounts[0].address),
      ).revertedWith(acErrors.WMAC_HASNT_ROLE);
    });

    it('call from not greenlisted user', async () => {
      const { accessControl, greenListableTester, owner, regularAccounts } =
        await loadFixture(defaultDeploy);

      await greenList(
        { greenlistable: greenListableTester, accessControl, owner },
        regularAccounts[0],
      );
      await expect(
        greenListableTester.onlyGreenlistedTester(regularAccounts[0].address),
      ).not.reverted;
    });
  });

  describe('addToGreenList', () => {
    it('should fail: call from user without GREENLIST_OPERATOR_ROLE role', async () => {
      const { accessControl, greenListableTester, owner, regularAccounts } =
        await loadFixture(defaultDeploy);

      await greenList(
        { greenlistable: greenListableTester, accessControl, owner },
        regularAccounts[0],
        {
          from: regularAccounts[0],
          revertMessage: `AccessControl: account ${regularAccounts[0].address.toLowerCase()} is missing role ${await accessControl.GREENLIST_OPERATOR_ROLE()}`,
        },
      );
    });

    it('call from user with GREENLIST_OPERATOR_ROLE role', async () => {
      const { accessControl, greenListableTester, owner, regularAccounts } =
        await loadFixture(defaultDeploy);
      await greenList(
        { greenlistable: greenListableTester, accessControl, owner },
        regularAccounts[0],
      );
    });
  });

  describe('removeFromGreenList', () => {
    it('should fail: call from user without GREENLIST_OPERATOR_ROLE role', async () => {
      const { accessControl, greenListableTester, owner, regularAccounts } =
        await loadFixture(defaultDeploy);

      await unGreenList(
        { greenlistable: greenListableTester, accessControl, owner },
        regularAccounts[0],
        {
          from: regularAccounts[0],
          revertMessage: `AccessControl: account ${regularAccounts[0].address.toLowerCase()} is missing role ${await accessControl.GREENLIST_OPERATOR_ROLE()}`,
        },
      );
    });

    it('call from user with GREENLIST_OPERATOR_ROLE role', async () => {
      const { accessControl, greenListableTester, owner, regularAccounts } =
        await loadFixture(defaultDeploy);
      await unGreenList(
        { greenlistable: greenListableTester, accessControl, owner },
        regularAccounts[0],
      );
    });
  });
});
