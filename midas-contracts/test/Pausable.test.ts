import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';

import { pauseVault, unpauseVault } from './common/common.helpers';
import { defaultDeploy } from './common/fixtures';

import {
  // eslint-disable-next-line camelcase
  PausableTester__factory,
} from '../typechain-types';

describe('Pausable', () => {
  it('deployment', async () => {
    const { pausableTester, roles } = await loadFixture(defaultDeploy);

    expect(await pausableTester.pauseAdminRole()).eq(roles.defaultAdmin);

    expect(await pausableTester.paused()).eq(false);
  });

  it('onlyInitializing', async () => {
    const { accessControl, owner } = await loadFixture(defaultDeploy);

    const pausable = await new PausableTester__factory(owner).deploy();

    await expect(
      pausable.initializeWithoutInitializer(accessControl.address),
    ).revertedWith('Initializable: contract is not initializing');
  });

  describe('onlyPauseAdmin modifier', async () => {
    it('should fail: can`t pause if doesn`t have role', async () => {
      const { pausableTester, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      await pauseVault(pausableTester, {
        from: regularAccounts[0],
        revertMessage: 'WMAC: hasnt role',
      });
    });

    it('can change state if has role', async () => {
      const { pausableTester } = await loadFixture(defaultDeploy);

      await pauseVault(pausableTester);
    });
  });

  describe('pause()', async () => {
    it('fail: can`t pause if caller doesnt have admin role', async () => {
      const { pausableTester, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      await pauseVault(pausableTester, {
        from: regularAccounts[0],
        revertMessage: 'WMAC: hasnt role',
      });
    });

    it('fail: when paused', async () => {
      const { pausableTester } = await loadFixture(defaultDeploy);

      await pauseVault(pausableTester);
      await pauseVault(pausableTester, {
        revertMessage: 'Pausable: paused',
      });
    });

    it('when not paused and caller is admin', async () => {
      const { pausableTester } = await loadFixture(defaultDeploy);

      await pauseVault(pausableTester);
    });
  });

  describe('unpause()', async () => {
    it('fail: can`t unpause if caller doesnt have admin role', async () => {
      const { pausableTester, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      await unpauseVault(pausableTester, {
        from: regularAccounts[0],
        revertMessage: 'WMAC: hasnt role',
      });
    });

    it('fail: when not paused', async () => {
      const { pausableTester } = await loadFixture(defaultDeploy);

      await unpauseVault(pausableTester, {
        revertMessage: 'Pausable: not paused',
      });
    });

    it('when paused and caller is admin', async () => {
      const { pausableTester } = await loadFixture(defaultDeploy);

      await pauseVault(pausableTester);
      await unpauseVault(pausableTester);
    });
  });
});
