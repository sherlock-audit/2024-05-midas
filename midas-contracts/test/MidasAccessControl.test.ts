import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { defaultDeploy } from './common/fixtures';

import {
  // eslint-disable-next-line camelcase
  WithMidasAccessControlTester__factory,
} from '../typechain-types';

describe('MidasAccessControl', function () {
  it('deployment', async () => {
    const { accessControl, roles, owner } = await loadFixture(defaultDeploy);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blacklisted: _, greenlisted: __, ...rolesToCheck } = roles;

    for (const role of Object.values(rolesToCheck)) {
      expect(await accessControl.hasRole(role, owner.address)).to.eq(true);
    }

    expect(await accessControl.getRoleAdmin(roles.blacklisted)).eq(
      roles.blacklistedOperator,
    );
  });

  it('initialize', async () => {
    const { accessControl } = await loadFixture(defaultDeploy);

    await expect(accessControl.initialize()).revertedWith(
      'Initializable: contract is already initialized',
    );
  });

  describe('grantRoleMult()', () => {
    it('should fail: arrays length mismatch', async () => {
      const { accessControl } = await loadFixture(defaultDeploy);

      await expect(
        accessControl.grantRoleMult([], [ethers.constants.AddressZero]),
      ).revertedWith('MAC: mismatch arrays');
    });

    it('should fail: arrays length mismatch', async () => {
      const { accessControl, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      const arr = [
        {
          role: await accessControl.BLACKLIST_OPERATOR_ROLE(),
          user: regularAccounts[0].address,
        },
        {
          role: await accessControl.GREENLIST_OPERATOR_ROLE(),
          user: regularAccounts[0].address,
        },
      ];

      await expect(
        accessControl.grantRoleMult(
          arr.map((v) => v.role),
          arr.map((v) => v.user),
        ),
      ).not.reverted;

      for (const setRoles of arr) {
        expect(await accessControl.hasRole(setRoles.role, setRoles.user)).eq(
          true,
        );
      }
    });
  });

  describe('revokeRoleMult()', () => {
    it('should fail: arrays length mismatch', async () => {
      const { accessControl } = await loadFixture(defaultDeploy);

      await expect(
        accessControl.revokeRoleMult([], [ethers.constants.AddressZero]),
      ).revertedWith('MAC: mismatch arrays');
    });

    it('should fail: arrays length mismatch', async () => {
      const { accessControl, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      const arr = [
        {
          role: await accessControl.BLACKLIST_OPERATOR_ROLE(),
          user: regularAccounts[0].address,
        },
        {
          role: await accessControl.GREENLIST_OPERATOR_ROLE(),
          user: regularAccounts[0].address,
        },
      ];

      await expect(
        accessControl.grantRoleMult(
          arr.map((v) => v.role),
          arr.map((v) => v.user),
        ),
      ).not.reverted;
      await expect(
        accessControl.revokeRoleMult(
          arr.map((v) => v.role),
          arr.map((v) => v.user),
        ),
      ).not.reverted;

      for (const setRoles of arr) {
        expect(await accessControl.hasRole(setRoles.role, setRoles.user)).eq(
          false,
        );
      }
    });
  });
});

describe('WithMidasAccessControl', function () {
  it('deployment', async () => {
    const { accessControl, wAccessControlTester } = await loadFixture(
      defaultDeploy,
    );
    expect(await wAccessControlTester.accessControl()).eq(
      accessControl.address,
    );
  });

  it('onlyInitializing', async () => {
    const { accessControl, owner } = await loadFixture(defaultDeploy);

    const wac = await new WithMidasAccessControlTester__factory(owner).deploy();

    await expect(
      wac.initializeWithoutInitializer(accessControl.address),
    ).revertedWith('Initializable: contract is not initializing');
  });

  describe('modifier onlyRole', () => {
    it('should fail when call from non DEFAULT_ADMIN_ROLE address', async () => {
      const { wAccessControlTester, regularAccounts, roles } =
        await loadFixture(defaultDeploy);
      await expect(
        wAccessControlTester
          .connect(regularAccounts[1])
          .withOnlyRole(roles.blacklisted, regularAccounts[0].address),
      ).revertedWith('WMAC: hasnt role');
    });

    it('call from DEFAULT_ADMIN_ROLE address', async () => {
      const { wAccessControlTester, owner, roles } = await loadFixture(
        defaultDeploy,
      );
      await expect(
        wAccessControlTester.withOnlyRole(
          roles.blacklistedOperator,
          owner.address,
        ),
      ).not.reverted;
    });
  });

  describe('modifier onlyNotRole', () => {
    it('should fail when call from DEFAULT_ADMIN_ROLE address', async () => {
      const { wAccessControlTester, owner, roles } = await loadFixture(
        defaultDeploy,
      );
      await expect(
        wAccessControlTester.withOnlyNotRole(
          roles.blacklistedOperator,
          owner.address,
        ),
      ).revertedWith('WMAC: has role');
    });

    it('call from non DEFAULT_ADMIN_ROLE address', async () => {
      const { wAccessControlTester, regularAccounts, roles } =
        await loadFixture(defaultDeploy);
      await expect(
        wAccessControlTester.withOnlyNotRole(
          roles.blacklisted,
          regularAccounts[1].address,
        ),
      ).not.reverted;
    });
  });

  describe('grantRole()', () => {
    it('should fail when call from non role admin', async () => {
      const { wAccessControlTester, accessControl, regularAccounts, roles } =
        await loadFixture(defaultDeploy);
      expect(
        await accessControl.hasRole(
          roles.blacklistedOperator,
          wAccessControlTester.address,
        ),
      ).eq(false);
      await expect(
        wAccessControlTester.grantRoleTester(
          roles.blacklisted,
          regularAccounts[1].address,
        ),
      ).reverted;
    });

    it('call from role admin', async () => {
      const { accessControl, wAccessControlTester, regularAccounts, roles } =
        await loadFixture(defaultDeploy);
      await accessControl.grantRole(
        roles.blacklistedOperator,
        wAccessControlTester.address,
      );
      await expect(
        wAccessControlTester.grantRoleTester(
          roles.blacklisted,
          regularAccounts[1].address,
        ),
      ).not.reverted;
    });
  });

  describe('revokeRole()', () => {
    it('should fail when call from non role admin', async () => {
      const { wAccessControlTester, accessControl, regularAccounts, roles } =
        await loadFixture(defaultDeploy);
      expect(
        await accessControl.hasRole(
          roles.blacklistedOperator,
          wAccessControlTester.address,
        ),
      ).eq(false);
      await expect(
        wAccessControlTester.revokeRoleTester(
          roles.blacklisted,
          regularAccounts[1].address,
        ),
      ).reverted;
    });

    it('call from role admin', async () => {
      const { accessControl, wAccessControlTester, regularAccounts, roles } =
        await loadFixture(defaultDeploy);
      await accessControl.grantRole(
        roles.blacklistedOperator,
        wAccessControlTester.address,
      );
      await wAccessControlTester.grantRoleTester(
        roles.blacklisted,
        regularAccounts[1].address,
      );

      await expect(
        wAccessControlTester.revokeRoleTester(
          roles.blacklisted,
          regularAccounts[1].address,
        ),
      ).not.reverted;

      expect(
        await accessControl.hasRole(
          roles.blacklisted,
          regularAccounts[1].address,
        ),
      ).eq(false);
    });
  });
});
