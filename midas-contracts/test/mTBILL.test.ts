import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseUnits } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { blackList, acErrors, unBlackList } from './common/ac.helpers';
import { defaultDeploy } from './common/fixtures';
import { burn, mint, setMetadataTest } from './common/mTBILL.helpers';

describe('mTBILL', function () {
  it('deployment', async () => {
    const { mTBILL } = await loadFixture(defaultDeploy);

    expect(await mTBILL.name()).eq('mTBILL');
    expect(await mTBILL.symbol()).eq('mTBILL');

    expect(await mTBILL.paused()).eq(false);
  });

  it('initialize', async () => {
    const { mTBILL } = await loadFixture(defaultDeploy);

    await expect(mTBILL.initialize(ethers.constants.AddressZero)).revertedWith(
      'Initializable: contract is already initialized',
    );
  });

  describe('pause()', () => {
    it('should fail: call from address without M_TBILL_PAUSE_OPERATOR_ROLE role', async () => {
      const { mTBILL, regularAccounts } = await loadFixture(defaultDeploy);
      const caller = regularAccounts[0];

      await expect(mTBILL.connect(caller).pause()).revertedWith(
        acErrors.WMAC_HASNT_ROLE,
      );
    });

    it('should fail: call when already paused', async () => {
      const { owner, mTBILL } = await loadFixture(defaultDeploy);

      await mTBILL.connect(owner).pause();
      await expect(mTBILL.connect(owner).pause()).revertedWith(
        `Pausable: paused`,
      );
    });

    it('call when unpaused', async () => {
      const { owner, mTBILL } = await loadFixture(defaultDeploy);
      expect(await mTBILL.paused()).eq(false);
      await expect(mTBILL.connect(owner).pause()).to.emit(
        mTBILL,
        mTBILL.interface.events['Paused(address)'].name,
      ).to.not.reverted;
      expect(await mTBILL.paused()).eq(true);
    });
  });

  describe('unpause()', () => {
    it('should fail: call from address without M_TBILL_PAUSE_OPERATOR_ROLE role', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      const caller = regularAccounts[0];

      await mTBILL.connect(owner).pause();
      await expect(mTBILL.connect(caller).unpause()).revertedWith(
        acErrors.WMAC_HASNT_ROLE,
      );
    });

    it('should fail: call when already paused', async () => {
      const { owner, mTBILL } = await loadFixture(defaultDeploy);

      await expect(mTBILL.connect(owner).unpause()).revertedWith(
        `Pausable: not paused`,
      );
    });

    it('call when paused', async () => {
      const { owner, mTBILL } = await loadFixture(defaultDeploy);
      expect(await mTBILL.paused()).eq(false);
      await mTBILL.connect(owner).pause();
      expect(await mTBILL.paused()).eq(true);

      await expect(mTBILL.connect(owner).unpause()).to.emit(
        mTBILL,
        mTBILL.interface.events['Unpaused(address)'].name,
      ).to.not.reverted;

      expect(await mTBILL.paused()).eq(false);
    });
  });

  describe('mint()', () => {
    it('should fail: call from address without M_TBILL_MINT_OPERATOR_ROLE role', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      const caller = regularAccounts[0];

      await mint({ mTBILL, owner }, owner, 0, {
        from: caller,
        revertMessage: acErrors.WMAC_HASNT_ROLE,
      });
    });

    it('call from address with M_TBILL_MINT_OPERATOR_ROLE role', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      const amount = parseUnits('100');
      const to = regularAccounts[0].address;

      await mint({ mTBILL, owner }, to, amount);
    });
  });

  describe('burn()', () => {
    it('should fail: call from address without M_TBILL_BURN_OPERATOR_ROLE role', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      const caller = regularAccounts[0];

      await burn({ mTBILL, owner }, owner, 0, {
        from: caller,
        revertMessage: acErrors.WMAC_HASNT_ROLE,
      });
    });

    it('should fail: call when user has insufficient balance', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      const amount = parseUnits('100');
      const to = regularAccounts[0].address;

      await burn({ mTBILL, owner }, to, amount, {
        revertMessage: 'ERC20: burn amount exceeds balance',
      });
    });

    it('call from address with M_TBILL_MINT_OPERATOR_ROLE role', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      const amount = parseUnits('100');
      const to = regularAccounts[0].address;

      await mint({ mTBILL, owner }, to, amount);
      await burn({ mTBILL, owner }, to, amount);
    });
  });

  describe('setMetadata()', () => {
    it('should fail: call from address without DEFAULT_ADMIN_ROLE role', async () => {
      const { owner, mTBILL, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      const caller = regularAccounts[0];
      await setMetadataTest({ mTBILL, owner }, 'url', 'some value', {
        from: caller,
        revertMessage: acErrors.WMAC_HASNT_ROLE,
      });
    });

    it('call from address with DEFAULT_ADMIN_ROLE role', async () => {
      const { owner, mTBILL } = await loadFixture(defaultDeploy);
      await setMetadataTest({ mTBILL, owner }, 'url', 'some value', undefined);
    });
  });

  describe('_beforeTokenTransfer()', () => {
    it('should fail: mint(...) when address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);
      const blacklisted = regularAccounts[0];

      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );
      await mint({ mTBILL, owner }, blacklisted, 1, {
        revertMessage: acErrors.WMAC_HAS_ROLE,
      });
    });

    it('should fail: burn(...) when address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);
      const blacklisted = regularAccounts[0];

      await mint({ mTBILL, owner }, blacklisted, 1);
      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );
      await burn({ mTBILL, owner }, blacklisted, 1, {
        revertMessage: acErrors.WMAC_HAS_ROLE,
      });
    });

    it('should fail: transfer(...) when from address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);
      const blacklisted = regularAccounts[0];
      const to = regularAccounts[1];

      await mint({ mTBILL, owner }, blacklisted, 1);
      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );

      await expect(
        mTBILL.connect(blacklisted).transfer(to.address, 1),
      ).revertedWith(acErrors.WMAC_HAS_ROLE);
    });

    it('should fail: transfer(...) when to address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);
      const blacklisted = regularAccounts[0];
      const from = regularAccounts[1];

      await mint({ mTBILL, owner }, from, 1);
      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );

      await expect(
        mTBILL.connect(from).transfer(blacklisted.address, 1),
      ).revertedWith(acErrors.WMAC_HAS_ROLE);
    });

    it('should fail: transferFrom(...) when from address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);
      const blacklisted = regularAccounts[0];
      const to = regularAccounts[1];

      await mint({ mTBILL, owner }, blacklisted, 1);
      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );

      await mTBILL.connect(blacklisted).approve(to.address, 1);

      await expect(
        mTBILL.connect(to).transferFrom(blacklisted.address, to.address, 1),
      ).revertedWith(acErrors.WMAC_HAS_ROLE);
    });

    it('should fail: transferFrom(...) when to address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);

      const blacklisted = regularAccounts[0];
      const from = regularAccounts[1];
      const caller = regularAccounts[2];

      await mint({ mTBILL, owner }, from, 1);

      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );
      await mTBILL.connect(from).approve(caller.address, 1);

      await expect(
        mTBILL
          .connect(caller)
          .transferFrom(from.address, blacklisted.address, 1),
      ).revertedWith(acErrors.WMAC_HAS_ROLE);
    });

    it('transferFrom(...) when caller address is blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);

      const blacklisted = regularAccounts[0];
      const from = regularAccounts[1];
      const to = regularAccounts[2];

      await mint({ mTBILL, owner }, from, 1);
      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );

      await mTBILL.connect(from).approve(blacklisted.address, 1);

      await expect(
        mTBILL.connect(blacklisted).transferFrom(from.address, to.address, 1),
      ).not.reverted;
    });

    it('transfer(...) when caller address was blacklisted and then un-blacklisted', async () => {
      const { owner, mTBILL, regularAccounts, accessControl } =
        await loadFixture(defaultDeploy);

      const blacklisted = regularAccounts[0];
      const to = regularAccounts[2];

      await mint({ mTBILL, owner }, blacklisted, 1);
      await blackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );

      await expect(
        mTBILL.connect(blacklisted).transfer(to.address, 1),
      ).revertedWith(acErrors.WMAC_HAS_ROLE);

      await unBlackList(
        { blacklistable: mTBILL, accessControl, owner },
        blacklisted,
      );

      await expect(mTBILL.connect(blacklisted).transfer(to.address, 1)).not
        .reverted;
    });
  });
});
