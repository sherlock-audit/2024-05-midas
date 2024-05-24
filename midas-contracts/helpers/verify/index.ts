import chalk from 'chalk';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

const WAIT_BLOCKS = 5;
const VERIFY_TASK = 'verify:verify';

export const __verify = async (
  { network, config, run, ethers }: HardhatRuntimeEnvironment,
  contractAddress: string,
  deployTxHash: string,
  args: unknown[],
): Promise<void> => {
  if (
    network.name === 'hardhat' ||
    network.name === 'localhost' ||
    !(config as { etherscan?: { apiKey: string } }).etherscan?.apiKey
  ) {
    return console.log(chalk.bold.yellow('No need to verify.'));
  }

  try {
    console.log(
      chalk.bold.yellow(`Waiting ${WAIT_BLOCKS} blocks after deployment.`),
    );

    await ethers.provider
      .getTransaction(deployTxHash)
      .then((t) => t.wait(WAIT_BLOCKS));
    console.log(chalk.bold.yellow('Verifying...'));
    await run(VERIFY_TASK, {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log(chalk.bold.green('Verified.'));
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.toLowerCase().includes('already verified')
    ) {
      return console.log(chalk.bold.green('Already verified.'));
    }
    throw e;
  }
};
