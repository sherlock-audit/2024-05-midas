import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseUnits } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { acErrors, greenList, unGreenList } from './common/ac.helpers';
import { approveBase18, mintToken, pauseVault } from './common/common.helpers';
import { setRoundData } from './common/data-feed.helpers';
import {
  deposit,
  setMinAmountToDepositTest,
} from './common/deposit-vault.helpers';
import { defaultDeploy } from './common/fixtures';
import {
  addPaymentTokenTest,
  removePaymentTokenTest,
  withdrawTest,
} from './common/manageable-vault.helpers';

import {
  // eslint-disable-next-line camelcase
  ManageableVaultTester__factory,
} from '../typechain-types';

describe('DepositVault', function () {
  it('deployment', async () => {
    const { depositVault, mTBILL, tokensReceiver, eurToUsdDataFeed, roles } =
      await loadFixture(defaultDeploy);

    expect(await depositVault.mTBILL()).eq(mTBILL.address);

    expect(await depositVault.paused()).eq(false);

    expect(await depositVault.tokensReceiver()).eq(tokensReceiver.address);

    expect(await depositVault.eurUsdDataFeed()).eq(eurToUsdDataFeed.address);

    expect(await depositVault.ONE_HUNDRED_PERCENT()).eq('10000');

    expect(await depositVault.minAmountToDepositInEuro()).eq('0');

    expect(await depositVault.vaultRole()).eq(roles.depositVaultAdmin);

    expect(await depositVault.MANUAL_FULLFILMENT_TOKEN()).eq(
      ethers.constants.AddressZero,
    );
  });

  describe('initialization', () => {
    it('should fail: cal; initialize() when already initialized', async () => {
      const { depositVault } = await loadFixture(defaultDeploy);

      await expect(
        depositVault.initialize(
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
          0,
          ethers.constants.AddressZero,
        ),
      ).revertedWith('Initializable: contract is already initialized');
    });

    it('should fail: call with initializing == false', async () => {
      const { owner, accessControl, mTBILL, tokensReceiver } =
        await loadFixture(defaultDeploy);

      const vault = await new ManageableVaultTester__factory(owner).deploy();

      await expect(
        vault.initializeWithoutInitializer(
          accessControl.address,
          mTBILL.address,
          tokensReceiver.address,
        ),
      ).revertedWith('Initializable: contract is not initializing');
    });

    it('should fail: when _tokensReceiver == address(this)', async () => {
      const { owner, accessControl, mTBILL } = await loadFixture(defaultDeploy);

      const vault = await new ManageableVaultTester__factory(owner).deploy();

      await expect(
        vault.initialize(accessControl.address, mTBILL.address, vault.address),
      ).revertedWith('invalid address');
    });
  });

  describe('setMinAmountToDeposit()', () => {
    it('should fail: call from address without DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { owner, depositVault, regularAccounts } = await loadFixture(
        defaultDeploy,
      );

      await setMinAmountToDepositTest({ depositVault, owner }, 1.1, {
        from: regularAccounts[0],
        revertMessage: acErrors.WMAC_HASNT_ROLE,
      });
    });

    it('call from address with DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { owner, depositVault } = await loadFixture(defaultDeploy);
      await setMinAmountToDepositTest({ depositVault, owner }, 1.1);
    });
  });

  describe('addPaymentToken()', () => {
    it('should fail: call from address without DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { depositVault, regularAccounts, owner } = await loadFixture(
        defaultDeploy,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        ethers.constants.AddressZero,
        { revertMessage: acErrors.WMAC_HASNT_ROLE, from: regularAccounts[0] },
      );
    });

    it('should fail: when token is already added', async () => {
      const { depositVault, stableCoins, owner } = await loadFixture(
        defaultDeploy,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
        {
          revertMessage: 'MV: already added',
        },
      );
    });

    it('call from address with DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { depositVault, stableCoins, owner } = await loadFixture(
        defaultDeploy,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
    });

    it('call from address with DEPOSIT_VAULT_ADMIN_ROLE role and add 3 options on a row', async () => {
      const { depositVault, stableCoins, owner } = await loadFixture(
        defaultDeploy,
      );

      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdc,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdt,
      );
    });
  });

  describe('removePaymentToken()', () => {
    it('should fail: call from address without DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { depositVault, regularAccounts, owner } = await loadFixture(
        defaultDeploy,
      );
      await removePaymentTokenTest(
        { vault: depositVault, owner },
        ethers.constants.AddressZero,
        { revertMessage: acErrors.WMAC_HASNT_ROLE, from: regularAccounts[0] },
      );
    });

    it('should fail: when token is not exists', async () => {
      const { owner, depositVault, stableCoins } = await loadFixture(
        defaultDeploy,
      );
      await removePaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai.address,
        { revertMessage: 'MV: not exists' },
      );
    });

    it('call from address with DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { depositVault, stableCoins, owner } = await loadFixture(
        defaultDeploy,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await removePaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai.address,
      );
    });

    it('call from address with DEPOSIT_VAULT_ADMIN_ROLE role and add 3 options on a row', async () => {
      const { depositVault, owner, stableCoins } = await loadFixture(
        defaultDeploy,
      );

      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdc,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdt,
      );

      await removePaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai.address,
      );
      await removePaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdc.address,
      );
      await removePaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdt.address,
      );

      await removePaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdt.address,
        { revertMessage: 'MV: not exists' },
      );
    });
  });
  describe('withdrawToken()', () => {
    it('should fail: call from address without DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { depositVault, regularAccounts, owner } = await loadFixture(
        defaultDeploy,
      );
      await withdrawTest(
        { vault: depositVault, owner },
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
        { revertMessage: acErrors.WMAC_HASNT_ROLE, from: regularAccounts[0] },
      );
    });

    it('should fail: when there is no token in vault', async () => {
      const { owner, depositVault, regularAccounts, stableCoins } =
        await loadFixture(defaultDeploy);
      await withdrawTest(
        { vault: depositVault, owner },
        stableCoins.dai,
        1,
        regularAccounts[0],
        { revertMessage: 'ERC20: transfer amount exceeds balance' },
      );
    });

    it('call from address with DEPOSIT_VAULT_ADMIN_ROLE role', async () => {
      const { depositVault, regularAccounts, stableCoins, owner } =
        await loadFixture(defaultDeploy);
      await mintToken(stableCoins.dai, depositVault, 1);
      await withdrawTest(
        { vault: depositVault, owner },
        stableCoins.dai,
        1,
        regularAccounts[0],
      );
    });
  });

  describe('usdToEuro()', () => {
    it('EUR price is 1$, minAmountToDepositInEuro is 100000 EUR, should return 100000 USD', async () => {
      const {
        depositVault,
        mockedAggregatorEur: mockedAggregator,
        owner,
      } = await loadFixture(defaultDeploy);
      await setRoundData({ mockedAggregator }, 1);
      await setMinAmountToDepositTest({ depositVault, owner }, 100_000);
      expect(await depositVault.minAmountToDepositInUsd()).eq(
        parseUnits('100000'),
      );
    });

    it('EUR price is 1.1$, minAmountToDepositInEuro is 100000 EUR, should return 110000 USD', async () => {
      const {
        depositVault,
        mockedAggregatorEur: mockedAggregator,
        owner,
      } = await loadFixture(defaultDeploy);
      await setRoundData({ mockedAggregator }, 1.1);
      await setMinAmountToDepositTest({ depositVault, owner }, 100_000);
      expect(await depositVault.minAmountToDepositInUsd()).eq(
        parseUnits('110000'),
      );
    });
  });

  describe('freeFromMinDeposit(address)', async () => {
    it('should fail: call from address without vault admin role', async () => {
      const { depositVault, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      await expect(
        depositVault
          .connect(regularAccounts[0])
          .freeFromMinDeposit(regularAccounts[1].address),
      ).to.be.revertedWith('WMAC: hasnt role');
    });
    it('should not fail', async () => {
      const { depositVault, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      await expect(depositVault.freeFromMinDeposit(regularAccounts[0].address))
        .to.not.reverted;

      expect(
        await depositVault.isFreeFromMinDeposit(regularAccounts[0].address),
      ).to.eq(true);
    });
    it('should fail: already in list', async () => {
      const { depositVault, regularAccounts } = await loadFixture(
        defaultDeploy,
      );
      await expect(depositVault.freeFromMinDeposit(regularAccounts[0].address))
        .to.not.reverted;

      expect(
        await depositVault.isFreeFromMinDeposit(regularAccounts[0].address),
      ).to.eq(true);

      await expect(
        depositVault.freeFromMinDeposit(regularAccounts[0].address),
      ).to.revertedWith('DV: already free');
    });
  });

  describe('deposit()', async () => {
    it('should fail: call from address without GREENLISTED_ROLE role', async () => {
      const { depositVault, regularAccounts, owner, mTBILL, stableCoins } =
        await loadFixture(defaultDeploy);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 0, {
        revertMessage: acErrors.WMAC_HASNT_ROLE,
        from: regularAccounts[0],
      });
    });

    it('should fail: when there is no token in vault', async () => {
      const { owner, depositVault, accessControl, stableCoins, mTBILL } =
        await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 1, {
        revertMessage: 'MV: token not exists',
      });
    });

    it('should fail: when trying to deposit 0 amount', async () => {
      const { owner, depositVault, accessControl, stableCoins, mTBILL } =
        await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 0, {
        revertMessage: 'DV: invalid amount',
      });
    });

    it('should fail: when rounding is invalid', async () => {
      const { owner, depositVault, accessControl, stableCoins, mTBILL } =
        await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await deposit(
        { depositVault, owner, mTBILL },
        stableCoins.dai,
        0.0000000001,
        {
          revertMessage: 'MV: invalid rounding',
        },
      );
    });

    it('should fail: call with insufficient allowance', async () => {
      const { owner, depositVault, accessControl, stableCoins, mTBILL } =
        await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await mintToken(stableCoins.dai, owner, 10);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 1, {
        revertMessage: 'ERC20: insufficient allowance',
      });
    });

    it('should fail: call with insufficient balance', async () => {
      const { owner, depositVault, accessControl, stableCoins, mTBILL } =
        await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await approveBase18(owner, stableCoins.dai, depositVault, 10);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 1, {
        revertMessage: 'ERC20: transfer amount exceeds balance',
      });
    });

    it('should fail: deposit 100 DAI, then remove user from green list and try to deposit again', async () => {
      const {
        owner,
        mockedAggregator,
        depositVault,
        accessControl,
        stableCoins,
        mTBILL,
      } = await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await mintToken(stableCoins.dai, owner, 100);
      await approveBase18(owner, stableCoins.dai, depositVault, 100);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await setRoundData({ mockedAggregator }, 5);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100);

      await unGreenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100, {
        revertMessage: acErrors.WMAC_HASNT_ROLE,
      });
    });

    it('should fail: call for amount < minAmountToDepositTest', async () => {
      const {
        depositVault,
        accessControl,
        mockedAggregator,
        mockedAggregatorEur,
        owner,
        mTBILL,
        stableCoins,
      } = await loadFixture(defaultDeploy);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await setRoundData({ mockedAggregator }, 4);

      await mintToken(stableCoins.dai, owner, 100_000);
      await approveBase18(owner, stableCoins.dai, depositVault, 100_000);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );

      await setRoundData({ mockedAggregator: mockedAggregatorEur }, 1);
      await setMinAmountToDepositTest({ depositVault, owner }, 100_000);

      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 99_999, {
        revertMessage: 'DV: usd amount < min',
      });
    });

    it('deposit 100 DAI, when price is 5$', async () => {
      const {
        owner,
        mockedAggregator,
        depositVault,
        accessControl,
        stableCoins,
        mTBILL,
      } = await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await mintToken(stableCoins.dai, owner, 100);
      await approveBase18(owner, stableCoins.dai, depositVault, 100);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await setRoundData({ mockedAggregator }, 5);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100);
    });

    it('deposit 100 DAI, when price is 5$ without checking of minDepositAmount', async () => {
      const {
        owner,
        mockedAggregator,
        depositVault,
        accessControl,
        stableCoins,
        mTBILL,
      } = await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );
      await mintToken(stableCoins.dai, owner, 100);
      await approveBase18(owner, stableCoins.dai, depositVault, 100);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await setRoundData({ mockedAggregator }, 5);
      await depositVault.freeFromMinDeposit(owner.address);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100);
    });
  });

  describe('deposit()', () => {
    it('should fail: when is paused', async () => {
      const {
        accessControl,
        depositVault,
        owner,
        mTBILL,
        stableCoins,
        regularAccounts,
      } = await loadFixture(defaultDeploy);

      await pauseVault(depositVault);
      await mintToken(stableCoins.dai, regularAccounts[0], 100);
      await approveBase18(
        regularAccounts[0],
        stableCoins.dai,
        depositVault,
        100,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        regularAccounts[0],
      );

      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100, {
        from: regularAccounts[0],
        revertMessage: 'Pausable: paused',
      });
    });

    it('is on pause, but admin can use everything', async () => {
      const { accessControl, depositVault, owner, mTBILL, stableCoins } =
        await loadFixture(defaultDeploy);

      await pauseVault(depositVault);

      await mintToken(stableCoins.dai, owner, 100);
      await approveBase18(owner, stableCoins.dai, depositVault, 100);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );

      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100, {
        revertMessage: 'Pausable: paused',
      });
    });

    it('call for amount == minAmountToDepositTest', async () => {
      const {
        depositVault,
        accessControl,
        mockedAggregator,
        mockedAggregatorEur,
        owner,
        mTBILL,
        stableCoins,
      } = await loadFixture(defaultDeploy);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await setRoundData({ mockedAggregator }, 4);

      await mintToken(stableCoins.dai, owner, 100_000);
      await approveBase18(owner, stableCoins.dai, depositVault, 100_000);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );

      await setRoundData({ mockedAggregator: mockedAggregatorEur }, 1);
      await setMinAmountToDepositTest({ depositVault, owner }, 100_000);

      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100_000);
    });

    it('call for amount == minAmountToDepositTest+1, then deposit with amount 1', async () => {
      const {
        depositVault,
        accessControl,
        mockedAggregator,
        mockedAggregatorEur,
        owner,
        mTBILL,
        stableCoins,
      } = await loadFixture(defaultDeploy);
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await setRoundData({ mockedAggregator }, 4);

      await mintToken(stableCoins.dai, owner, 100_002);
      await approveBase18(owner, stableCoins.dai, depositVault, 100_002);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );

      await setRoundData({ mockedAggregator: mockedAggregatorEur }, 1);
      await setMinAmountToDepositTest({ depositVault, owner }, 100_000);

      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100_001);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 1);
    });

    it('deposit 100 DAI, when price is 5$, 25 USDC when price is 5.1$, 14 USDT when price is 5.4$', async () => {
      const {
        owner,
        mockedAggregator,
        depositVault,
        accessControl,
        stableCoins,
        mTBILL,
      } = await loadFixture(defaultDeploy);
      await greenList(
        { accessControl, greenlistable: depositVault, owner },
        owner,
      );

      await mintToken(stableCoins.dai, owner, 100);
      await mintToken(stableCoins.usdc, owner, 25);
      await mintToken(stableCoins.usdt, owner, 14);

      await approveBase18(owner, stableCoins.dai, depositVault, 100);
      await approveBase18(owner, stableCoins.usdc, depositVault, 25);
      await approveBase18(owner, stableCoins.usdt, depositVault, 14);

      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.dai,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdc,
      );
      await addPaymentTokenTest(
        { vault: depositVault, owner },
        stableCoins.usdt,
      );

      await setRoundData({ mockedAggregator }, 5);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.dai, 100);

      await setRoundData({ mockedAggregator }, 5.1);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.usdc, 25);

      await setRoundData({ mockedAggregator }, 5.4);
      await deposit({ depositVault, owner, mTBILL }, stableCoins.usdt, 14);
    });
  });
});
