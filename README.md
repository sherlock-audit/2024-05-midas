
# Midas contest details

- Join [Sherlock Discord](https://discord.gg/MABEWyASkp)
- Submit findings using the issue page in your private contest repo (label issues as med or high)
- [Read for more details](https://docs.sherlock.xyz/audits/watsons)

# Q&A

### Q: On what chains are the smart contracts going to be deployed?
The contracts will be deployed on Ethereum and Arbitrum.
___

### Q: If you are integrating tokens, are you allowing only whitelisted tokens to work with the codebase or any complying with the standard? Are they assumed to have certain properties, e.g. be non-reentrant? Are there any types of <a href="https://github.com/d-xo/weird-erc20" target="_blank" rel="noopener noreferrer">weird tokens</a> you want to integrate?
Only USDC and mTBILL will be used so only those will be in the scope of the audit.

***General***
Question | Answer
|---|---
Testing Coverage | 100% (109/109 statements)
ERC20 used by the protocol | mTBILL, USDC
ERC721 used by the protocol | None
ERC777 used by the protocol | None 
ERC1155 used by the protocol | None

**ERC20 token behaviours in scope**

* Tokens in the scope: mTBILL, USDC
* Vulnerabilites derived from the following behaviours will only be considered valid if the issues exist in the tokens used by the protocol. 

Question | Answer
|---|---
Missing return value | ❌ No
Fee on transfer | ❌ No
Balance changes outside of transfers | ✅ Yes
Upgradeability | ✅ Yes
Flash minting | ❌ No
Blocklists | ✅ Yes
Pausability | ✅ Yes
Approval race protections | ✅ Yes
Revert on approval to zero address | ✅ Yes
Revert on zero value approvals | ✅ Yes
Revert on zero value transfers | ✅ Yes
Revert on transfer to the zero address | ✅ Yes
Revert on large approvals and/or transfers | ❌ No
Doesn't revert on failure | ❌ No
Multiple token addresses | ❌ No
Low decimals ( < 6) | ❌ No
High decimals ( > 18) | ❌ No
___

### Q: Are the admins of the protocols your contracts integrate with (if any) TRUSTED or RESTRICTED? If these integrations are trusted, should auditors also assume they are always responsive, for example, are oracles trusted to provide non-stale information, or VRF providers to respond within a designated timeframe?
IB01/USD Price from Chainlink is `RESTRICTED`, as their documentation states that the price will only be updated during defined market hours (weekends and holidays excluded), so we assume the price is only stale if more than three days have passed.
___

### Q: Are there any protocol roles? Please list them and provide whether they are TRUSTED or RESTRICTED, or provide a more comprehensive description of what a role can and can't do/impact.
| Role | Purpose | Category
|---|---|---
| `GREENLIST_OPERATOR_ROLE` | Manages greenlist status | *TRUSTED*
| `BLACKLIST_OPERATOR_ROLE` |  Manages blacklist status | *TRUSTED*
| `M_TBILL_MINT_OPERATOR_ROLE` | Minting token(s) upon issuance | *TRUSTED*
| `M_TBILL_BURN_OPERATOR_ROLE` | Burning token(s) upon redemption | *TRUSTED*
| `M_TBILL_PAUSE_OPERATOR_ROLE` | Pauses/unpauses token functionality | *TRUSTED*
| `DEPOSIT_VAULT_ADMIN_ROLE` | Handles `freeFromMinDeposit`, `setMinAmountToDeposit`, `withdrawToken`, `addPaymentToken`, `removePaymentToken` in `DepositVault` | *TRUSTED*
| `REDEMPTION_VAULT_ADMIN_ROLE` | Handles `withdrawToken`, `addPaymentToken`, `removePaymentToken` in `RedemptionVault` | *TRUSTED*
| `DEFAULT_ADMIN_ROLE` | Grants and revokes roles and handles `changeAggregator`, `setMetadata` | *TRUSTED*
| `GREENLISTED_ROLE` | Can deposit tokens to receive mTBILL and redeem to receive back deposited tokens | *RESTRICTED*
| `BLACKLISTED_ROLE` | Cannot access the mTBILL contract | *RESTRICTED*
These roles (Greenlist, Blacklist) have limited rights. Greenlisted addresses can interact with the contract and blacklisted cannot - we can assume that neither role can act maliciously. 

mTBILL can only be minted and burned by addresses with the above role designations, granted through [MidasAccessControl](https://github.com/RedDuck-Software/midas-contracts/blob/main/contracts/access/MidasAccessControl.sol). 

*Currently, only project owner(s) are assigned restricted roles.*
___

### Q: For permissioned functions, please list all checks and requirements that will be made before calling the function.
* `onlyRole()` - Checks if the permissioned function is being called by an address with its respective admin role (i.e. `M_TBILL_MINT_OPERATOR_ROLE` in the case of issuance). 
* `onlyNotBlacklisted` - Checks that `from` and `to` addresses are not currently assigned the `BLACKLISTED_ROLE`. 
___

### Q: Is the codebase expected to comply with any EIPs? Can there be/are there any deviations from the specification?
mTBILL should be strictly compliant with the ERC20.
___

### Q: Are there any off-chain mechanisms or off-chain procedures for the protocol (keeper bots, arbitrage bots, etc.)?
The conversion of USDC deposits to mTBILL tokens and vice-versa is performed offchain. These assets are bankruptcy protected, with attestation reports posted daily on the Midas site. This will be fully functional and working as intended. All reports are independently verified, and there should be no delays in reporting or posting the data.
___

### Q: Are there any hardcoded values that you intend to change before (some) deployments?
N/A.
___

### Q: If the codebase is to be deployed on an L2, what should be the behavior of the protocol in case of sequencer issues (if applicable)? Should Sherlock assume that the Sequencer won't misbehave, including going offline?
Sherlock should assume that the Sequencer won't misbehave, including going offline.
___

### Q: Should potential issues, like broken assumptions about function behavior, be reported if they could pose risks in future integrations, even if they might not be an issue in the context of the scope? If yes, can you elaborate on properties/invariants that should hold?
No
___

### Q: Please discuss any design choices you made.
mTBILL is an accumulating, ERC20 token. 
___

### Q: Please list any known issues and explicitly state the acceptable risks for each known issue.	
*A note for Sherlock Watsons: Anything in the following section is considered a known issue and will be inelgible for rewards.*

Our most recent audit can be found [here](https://2732961456-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FsPjk0ggBxEJCCnVFFkDR%2Fuploads%2F38N1bo36K8FLriRrPDXb%2FHacken_Midas_%5BSCA%5D%20Midas_Vault_Dec2023_P-2023-076_1_20240118%2016_22.pdf?alt=media&token=2c58f6f7-889e-4c64-ac84-35bad59eb51a).

* Centralization Risk: We are aware that our management roles and processes results in a centralized system requiring trust.  
* Converisons: As mentioned, we're aware that the `convertFromBase18()` function is hard-coded. This behaviour is intended for use as an internal counting metric for USD-like tokens. 
* mTBILL Pricing: The system currently assumes that the price of one USDC is equal to one dollar. This is intened, as the conversion routes through the Issuer, where the quoted price is always one dollar. We currently have no plans to accept alternate stablecoins. 
* Malicious Admin: We are aware that admin addresses can change the role designations of interacting addresses and perform various tasks, such as adding and removing wallets from the Blacklist, minting and burning tokens, and altering accepted payment tokens. We are open to suggestions on methods to further restrain these roles without negatively impacting the operation flow and flexibility of the code.
* Minimum Deposit Check: The minimum deposit threshold is only applied to first-time depositors due to the condition in the validateAmountUsdIn() function. This is intended, as this validation is only required for a user's first deposit.
___

### Q: We will report issues where the core protocol functionality is inaccessible for at least 7 days. Would you like to override this value?
N/A
___

### Q: Please provide links to previous audits (if any).
| Audit | Date
|---|---
| [Hacken #1](https://2732961456-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FsPjk0ggBxEJCCnVFFkDR%2Fuploads%2F1wxK6TgqaRsSgt3ixVMx%2FMidas_SC%20Audit%20Report_25092023_%5BSA-1833%5D%20-%20POST%20REMEDIATION.pdf?alt=media&token=cdcf6533-7366-42db-9d3b-224efac85b9a) | September 25, 2023
| [Hacken #2](https://2732961456-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FsPjk0ggBxEJCCnVFFkDR%2Fuploads%2F38N1bo36K8FLriRrPDXb%2FHacken_Midas_%5BSCA%5D%20Midas_Vault_Dec2023_P-2023-076_1_20240118%2016_22.pdf?alt=media&token=2c58f6f7-889e-4c64-ac84-35bad59eb51a) | January 18, 2024
___

### Q: Please list any relevant protocol resources.
* Documentation: https://docs.midas.app/
* Website: https://midas.app/
* X/Twitter: https://twitter.com/MidasRWA
___

### Q: Additional audit information.
We would like for Watsons to look especially at these attack vectors : 
- Attack Vectors: Role works properly, No infinite minting pattern from a hacker, security of mTBILL contract
___



# Audit scope


[midas-contracts @ 0b1644f519876cadc1d6ca0e02fdfe8a32cefa12](https://github.com/RedDuck-Software/midas-contracts/tree/0b1644f519876cadc1d6ca0e02fdfe8a32cefa12)
- [midas-contracts/contracts/DepositVault.sol](midas-contracts/contracts/DepositVault.sol)
- [midas-contracts/contracts/RedemptionVault.sol](midas-contracts/contracts/RedemptionVault.sol)
- [midas-contracts/contracts/abstract/ManageableVault.sol](midas-contracts/contracts/abstract/ManageableVault.sol)
- [midas-contracts/contracts/abstract/MidasInitializable.sol](midas-contracts/contracts/abstract/MidasInitializable.sol)
- [midas-contracts/contracts/access/Blacklistable.sol](midas-contracts/contracts/access/Blacklistable.sol)
- [midas-contracts/contracts/access/Greenlistable.sol](midas-contracts/contracts/access/Greenlistable.sol)
- [midas-contracts/contracts/access/MidasAccessControl.sol](midas-contracts/contracts/access/MidasAccessControl.sol)
- [midas-contracts/contracts/access/MidasAccessControlRoles.sol](midas-contracts/contracts/access/MidasAccessControlRoles.sol)
- [midas-contracts/contracts/access/Pausable.sol](midas-contracts/contracts/access/Pausable.sol)
- [midas-contracts/contracts/access/WithMidasAccessControl.sol](midas-contracts/contracts/access/WithMidasAccessControl.sol)
- [midas-contracts/contracts/feeds/DataFeed.sol](midas-contracts/contracts/feeds/DataFeed.sol)
- [midas-contracts/contracts/libraries/DecimalsCorrectionLibrary.sol](midas-contracts/contracts/libraries/DecimalsCorrectionLibrary.sol)
- [midas-contracts/contracts/mTBILL.sol](midas-contracts/contracts/mTBILL.sol)


