import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseUnits } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { acErrors } from './common/ac.helpers';
import { setRoundData } from './common/data-feed.helpers';
import { defaultDeploy } from './common/fixtures';

describe('DataFeed', function () {
  it('deployment', async () => {
    const { dataFeed, mockedAggregator } = await loadFixture(defaultDeploy);

    expect(await dataFeed.aggregator()).eq(mockedAggregator.address);
  });

  it('initialize', async () => {
    const { dataFeed } = await loadFixture(defaultDeploy);

    await expect(
      dataFeed.initialize(
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ),
    ).revertedWith('Initializable: contract is already initialized');
  });

  describe('changeAggregator()', () => {
    it('should fail: call from address without DEFAULT_ADMIN_ROLE', async () => {
      const { dataFeed, regularAccounts } = await loadFixture(defaultDeploy);

      await expect(
        dataFeed
          .connect(regularAccounts[0])
          .changeAggregator(ethers.constants.AddressZero),
      ).revertedWith(acErrors.WMAC_HASNT_ROLE);
    });

    it('should fail: pass zero address', async () => {
      const { dataFeed } = await loadFixture(defaultDeploy);

      await expect(
        dataFeed.changeAggregator(ethers.constants.AddressZero),
      ).revertedWith('DF: invalid address');
    });

    it('pass new aggregator address', async () => {
      const { dataFeed, mockedAggregator } = await loadFixture(defaultDeploy);

      await expect(dataFeed.changeAggregator(mockedAggregator.address)).not
        .reverted;
    });
  });

  describe('getDataInBase18()', () => {
    it('data in base18 conversion for 4$ price', async () => {
      const { dataFeed, mockedAggregator } = await loadFixture(defaultDeploy);
      const price = '4';
      await setRoundData({ mockedAggregator }, +price);
      expect(await dataFeed.getDataInBase18()).eq(parseUnits(price));
    });

    it('data in base18 conversion for 0.001$ price', async () => {
      const { dataFeed, mockedAggregator } = await loadFixture(defaultDeploy);
      const price = '0.001';
      await setRoundData({ mockedAggregator }, +price);
      expect(await dataFeed.getDataInBase18()).eq(parseUnits(price));
    });
  });
});

describe('DataFeed Deprecated', function () {
  it('should fail when: feed is deprecated', async () => {
    const { dataFeedDeprecated } = await loadFixture(defaultDeploy);
    await expect(dataFeedDeprecated.getDataInBase18()).to.be.reverted;
  });
});

describe('DataFeed Unhealthy', function () {
  it('should fail when: feed is unhealthy', async () => {
    const { dataFeedUnhealthy } = await loadFixture(defaultDeploy);
    await expect(dataFeedUnhealthy.getDataInBase18()).to.be.reverted;
  });
});
