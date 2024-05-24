# Solidity API

## DepositVault

Smart contract that handles mTBILL minting

### minAmountToDepositInEuro

```solidity
uint256 minAmountToDepositInEuro
```

minimal USD amount in EUR for first user`s deposit

### lastRequestId

```solidity
struct Counters.Counter lastRequestId
```

last deposit request id

### eurUsdDataFeed

```solidity
contract IDataFeed eurUsdDataFeed
```

EUR/USD data feed

### totalDeposited

```solidity
mapping(address => uint256) totalDeposited
```

_depositor address => amount deposited_

### isFreeFromMinDeposit

```solidity
mapping(address => bool) isFreeFromMinDeposit
```

users restricted from depositin minDepositAmountInEuro

### initialize

```solidity
function initialize(address _ac, address _mTBILL, address _eurUsdDataFeed, uint256 _minAmountToDepositInEuro, address _usdReceiver) external
```

upgradeable pattern contract`s initializer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ac | address | address of MidasAccessControll contract |
| _mTBILL | address | address of mTBILL token |
| _eurUsdDataFeed | address | address of CL`s data feed EUR/USD |
| _minAmountToDepositInEuro | uint256 | initial value for minAmountToDepositInEuro |
| _usdReceiver | address | address of usd tokens receiver |

### deposit

```solidity
function deposit(address tokenIn, uint256 amountUsdIn) external
```

first step of the depositing proccess.
Transfers usd token from the user.
Then request should be validated off-chain and if
everything is okay, admin should mint necessary amount
of mTBILL token back to user

_transfers `tokenIn` from `msg.sender`
to `tokensReceiver`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | address of token to deposit. |
| amountUsdIn | uint256 | amount of token to deposit in 10**18 decimals. |

### freeFromMinDeposit

```solidity
function freeFromMinDeposit(address user) external
```

frees given `user` from the minimal deposit
amount validation in `initiateDepositRequest`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | address of user |

### setMinAmountToDeposit

```solidity
function setMinAmountToDeposit(uint256 newValue) external
```

sets new minimal amount to deposit in EUR.
can be called only from vault`s admin

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newValue | uint256 | new min. deposit value |

### minAmountToDepositInUsd

```solidity
function minAmountToDepositInUsd() public view returns (uint256)
```

minAmountToDepositInEuro converted to USD in base18

### vaultRole

```solidity
function vaultRole() public pure returns (bytes32)
```

AC role of vault administrator

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | role bytes32 role |

### _validateAmountUsdIn

```solidity
function _validateAmountUsdIn(address user, uint256 amountUsdIn) internal view
```

_validates that inputted USD amount >= minAmountToDepositInUsd()_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | user address |
| amountUsdIn | uint256 | amount of USD |

## RedemptionVault

Smart contract that handles mTBILL redemptions

### lastRequestId

```solidity
struct Counters.Counter lastRequestId
```

last redemption request id

### initialize

```solidity
function initialize(address _ac, address _mTBILL, address _tokensReceiver) external
```

upgradeable pattern contract`s initializer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ac | address | address of MidasAccessControll contract |
| _mTBILL | address | address of mTBILL token |
| _tokensReceiver | address | address of mTBILL token receiver |

### redeem

```solidity
function redeem(address tokenOut, uint256 amountTBillIn) external
```

Transfers mTBILL from the user to the admin.
After that admin should validate the redemption and transfer
selected `tokenOut` back to user

_transfers 'amountTBillIn' amount from user
to `tokensReceiver`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenOut | address | stable coin token address to redeem to |
| amountTBillIn | uint256 | amount of mTBILL to redeem |

### vaultRole

```solidity
function vaultRole() public pure returns (bytes32)
```

AC role of vault administrator

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | role bytes32 role |

### _requireTokenExists

```solidity
function _requireTokenExists(address token) internal view
```

_checks that provided `token` is supported by the vault_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |

## ManageableVault

Contract with base Vault methods

### MANUAL_FULLFILMENT_TOKEN

```solidity
address MANUAL_FULLFILMENT_TOKEN
```

address that represents off-chain USD bank transfer

### ONE_HUNDRED_PERCENT

```solidity
uint256 ONE_HUNDRED_PERCENT
```

100 percent with base 100

_for example, 10% will be (10 * 100)%_

### mTBILL

```solidity
contract IMTbill mTBILL
```

mTBILL token

### tokensReceiver

```solidity
address tokensReceiver
```

address to which USD and mTokens will be sent

### _paymentTokens

```solidity
struct EnumerableSetUpgradeable.AddressSet _paymentTokens
```

_tokens that can be used as USD representation_

### onlyVaultAdmin

```solidity
modifier onlyVaultAdmin()
```

_checks that msg.sender do have a vaultRole() role_

### __ManageableVault_init

```solidity
function __ManageableVault_init(address _ac, address _mTBILL, address _tokensReceiver) internal
```

_upgradeable pattern contract`s initializer_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ac | address | address of MidasAccessControll contract |
| _mTBILL | address | address of mTBILL token |
| _tokensReceiver | address | address to which USD and mTokens will be sent |

### withdrawToken

```solidity
function withdrawToken(address token, uint256 amount, address withdrawTo) external
```

withdraws `amount` of a given `token` from the contract.
can be called only from permissioned actor.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |
| amount | uint256 | token amount |
| withdrawTo | address | withdraw destination address |

### addPaymentToken

```solidity
function addPaymentToken(address token) external
```

adds a token to the stablecoins list.
can be called only from permissioned actor.

_reverts if token is already added_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |

### removePaymentToken

```solidity
function removePaymentToken(address token) external
```

removes a token from stablecoins list.
can be called only from permissioned actor.

_reverts if token is not presented_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |

### getPaymentTokens

```solidity
function getPaymentTokens() external view returns (address[])
```

returns array of stablecoins supported by the vault
can be called only from permissioned actor.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | paymentTokens array of payment tokens |

### vaultRole

```solidity
function vaultRole() public view virtual returns (bytes32)
```

AC role of vault administrator

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | role bytes32 role |

### pauseAdminRole

```solidity
function pauseAdminRole() public view returns (bytes32)
```

AC role of vault`s pauser

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | role bytes32 role |

### _tokenTransferFromUser

```solidity
function _tokenTransferFromUser(address token, uint256 amount) internal
```

_do safeTransferFrom on a given token
and converts `amount` from base18
to amount with a correct precision. Sends tokens
from `msg.sender` to `tokensReceiver`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | address of token |
| amount | uint256 | amount of `token` to transfer from `user` |

### _tokenDecimals

```solidity
function _tokenDecimals(address token) internal view returns (uint8)
```

_retreives decimals of a given `token`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | address of token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | decimals decinmals value of a given `token` |

### _requireTokenExists

```solidity
function _requireTokenExists(address token) internal view virtual
```

_checks that `token` is presented in `_paymentTokens`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | address of token |

## MidasInitializable

Base Initializable contract that implements constructor
that calls _disableInitializers() to prevent
initialization of implementation contract

### constructor

```solidity
constructor() internal
```

## Blacklistable

Base contract that implements basic functions and modifiers
to work with blacklistable

### onlyNotBlacklisted

```solidity
modifier onlyNotBlacklisted(address account)
```

_checks that a given `account` doesnt
have BLACKLISTED_ROLE_

### __Blacklistable_init

```solidity
function __Blacklistable_init(address _accessControl) internal
```

_upgradeable pattern contract`s initializer_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accessControl | address | MidasAccessControl contract address |

## Greenlistable

Base contract that implements basic functions and modifiers
to work with greenlistable

### onlyGreenlisted

```solidity
modifier onlyGreenlisted(address account)
```

_checks that a given `account`
have GREENLISTED_ROLE_

### __Greenlistable_init

```solidity
function __Greenlistable_init(address _accessControl) internal
```

_upgradeable pattern contract`s initializer_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accessControl | address | MidasAccessControl contract address |

## MidasAccessControl

Smart contract that stores all roles for Midas project

### initialize

```solidity
function initialize() external
```

upgradeable pattern contract`s initializer

### grantRoleMult

```solidity
function grantRoleMult(bytes32[] roles, address[] addresses) external
```

grant multiple roles to multiple users
in one transaction

_length`s of 2 arays should match_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| roles | bytes32[] | array of bytes32 roles |
| addresses | address[] | array of user addresses |

### revokeRoleMult

```solidity
function revokeRoleMult(bytes32[] roles, address[] addresses) external
```

revoke multiple roles from multiple users
in one transaction

_length`s of 2 arays should match_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| roles | bytes32[] | array of bytes32 roles |
| addresses | address[] | array of user addresses |

## MidasAccessControlRoles

Base contract that stores all roles descriptors

### GREENLIST_OPERATOR_ROLE

```solidity
bytes32 GREENLIST_OPERATOR_ROLE
```

actor that can change green list statuses of addresses

### BLACKLIST_OPERATOR_ROLE

```solidity
bytes32 BLACKLIST_OPERATOR_ROLE
```

actor that can change black list statuses of addresses

### M_TBILL_MINT_OPERATOR_ROLE

```solidity
bytes32 M_TBILL_MINT_OPERATOR_ROLE
```

actor that can mint mTBILL

### M_TBILL_BURN_OPERATOR_ROLE

```solidity
bytes32 M_TBILL_BURN_OPERATOR_ROLE
```

actor that can burn mTBILL

### M_TBILL_PAUSE_OPERATOR_ROLE

```solidity
bytes32 M_TBILL_PAUSE_OPERATOR_ROLE
```

actor that can pause mTBILL

### DEPOSIT_VAULT_ADMIN_ROLE

```solidity
bytes32 DEPOSIT_VAULT_ADMIN_ROLE
```

actor that have admin rights in deposit vault

### REDEMPTION_VAULT_ADMIN_ROLE

```solidity
bytes32 REDEMPTION_VAULT_ADMIN_ROLE
```

actor that have admin rights in redemption vault

### GREENLISTED_ROLE

```solidity
bytes32 GREENLISTED_ROLE
```

actor that is greenlisted

### BLACKLISTED_ROLE

```solidity
bytes32 BLACKLISTED_ROLE
```

actor that is blacklisted

## Pausable

Base contract that implements basic functions and modifiers
with pause functionality

### onlyPauseAdmin

```solidity
modifier onlyPauseAdmin()
```

_checks that a given `account`
has a determinedPauseAdminRole_

### __Pausable_init

```solidity
function __Pausable_init(address _accessControl) internal
```

_upgradeable pattern contract`s initializer_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accessControl | address | MidasAccessControl contract address |

### pause

```solidity
function pause() external
```

### unpause

```solidity
function unpause() external
```

### pauseAdminRole

```solidity
function pauseAdminRole() public view virtual returns (bytes32)
```

_virtual function to determine pauseAdmin role_

## WithMidasAccessControl

Base contract that consumes MidasAccessControl

### DEFAULT_ADMIN_ROLE

```solidity
bytes32 DEFAULT_ADMIN_ROLE
```

admin role

### accessControl

```solidity
contract MidasAccessControl accessControl
```

MidasAccessControl contract address

### onlyRole

```solidity
modifier onlyRole(bytes32 role, address account)
```

_checks that given `address` have `role`_

### onlyNotRole

```solidity
modifier onlyNotRole(bytes32 role, address account)
```

_checks that given `address` do not have `role`_

### __WithMidasAccessControl_init

```solidity
function __WithMidasAccessControl_init(address _accessControl) internal
```

_upgradeable pattern contract`s initializer_

### _onlyRole

```solidity
function _onlyRole(bytes32 role, address account) internal view
```

_checks that given `address` have `role`_

### _onlyNotRole

```solidity
function _onlyNotRole(bytes32 role, address account) internal view
```

_checks that given `address` do not have `role`_

## DataFeed

Wrapper of ChainLink`s AggregatorV3 data feeds

### aggregator

```solidity
contract AggregatorV3Interface aggregator
```

AggregatorV3Interface contract address

### initialize

```solidity
function initialize(address _ac, address _aggregator) external
```

upgradeable pattern contract`s initializer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ac | address | MidasAccessControl contract address |
| _aggregator | address | AggregatorV3Interface contract address |

### changeAggregator

```solidity
function changeAggregator(address _aggregator) external
```

updates `aggregator` address

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _aggregator | address | new AggregatorV3Interface contract address |

### getDataInBase18

```solidity
function getDataInBase18() external view returns (uint256 answer)
```

fetches answer from aggregator
and converts it to the base18 precision

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| answer | uint256 | fetched aggregator answer |

## IDataFeed

### initialize

```solidity
function initialize(address _ac, address _aggregator) external
```

upgradeable pattern contract`s initializer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ac | address | MidasAccessControl contract address |
| _aggregator | address | AggregatorV3Interface contract address |

### changeAggregator

```solidity
function changeAggregator(address _aggregator) external
```

updates `aggregator` address

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _aggregator | address | new AggregatorV3Interface contract address |

### getDataInBase18

```solidity
function getDataInBase18() external view returns (uint256 answer)
```

fetches answer from aggregator
and converts it to the base18 precision

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| answer | uint256 | fetched aggregator answer |

## IDepositVault

### SetMinAmountToDeposit

```solidity
event SetMinAmountToDeposit(address caller, uint256 newValue)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| caller | address | function caller (msg.sender) |
| newValue | uint256 | new min amount to deposit value |

### Deposit

```solidity
event Deposit(uint256 id, address user, address usdTokenIn, uint256 amount)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | unique id of a deposit |
| user | address | address that initiated the deposit |
| usdTokenIn | address | address of usd token |
| amount | uint256 | amount of `usdTokenIn` |

### FreeFromMinDeposit

```solidity
event FreeFromMinDeposit(address user)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | address that was freed from min deposit check |

### deposit

```solidity
function deposit(address tokenIn, uint256 amountIn) external
```

first step of the depositing proccess.
Transfers usd token from the user.
Then request should be validated off-chain and if
everything is okay, admin should mint necessary amount
of mTBILL token back to user

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | address of USD token in |
| amountIn | uint256 | amount of `tokenIn` that will be taken from user |

### freeFromMinDeposit

```solidity
function freeFromMinDeposit(address user) external
```

frees given `user` from the minimal deposit
amount validation in `initiateDepositRequest`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | address of user |

### setMinAmountToDeposit

```solidity
function setMinAmountToDeposit(uint256 newValue) external
```

sets new minimal amount to deposit in EUR.
can be called only from vault`s admin

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newValue | uint256 | new min. deposit value |

## IMTbill

### mint

```solidity
function mint(address to, uint256 amount) external
```

mints mTBILL token `amount` to a given `to` address.
should be called only from permissioned actor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | addres to mint tokens to |
| amount | uint256 | amount to mint |

### burn

```solidity
function burn(address from, uint256 amount) external
```

burns mTBILL token `amount` to a given `to` address.
should be called only from permissioned actor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | addres to burn tokens from |
| amount | uint256 | amount to burn |

### setMetadata

```solidity
function setMetadata(bytes32 key, bytes data) external
```

updates contract`s metadata.
should be called only from permissioned actor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | metadata map. key |
| data | bytes | metadata map. value |

### pause

```solidity
function pause() external
```

puts mTBILL token on pause.
should be called only from permissioned actor

### unpause

```solidity
function unpause() external
```

puts mTBILL token on pause.
should be called only from permissioned actor

## IManageableVault

### WithdrawToken

```solidity
event WithdrawToken(address caller, address token, address withdrawTo, uint256 amount)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| caller | address | function caller (msg.sender) |
| token | address | token that was withdrawn |
| withdrawTo | address | address to which tokens were withdrawn |
| amount | uint256 | `token` transfer amount |

### AddPaymentToken

```solidity
event AddPaymentToken(address token, address caller)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | address of token that |
| caller | address | function caller (msg.sender) |

### RemovePaymentToken

```solidity
event RemovePaymentToken(address token, address caller)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | address of token that |
| caller | address | function caller (msg.sender) |

### withdrawToken

```solidity
function withdrawToken(address token, uint256 amount, address withdrawTo) external
```

withdraws `amount` of a given `token` from the contract.
can be called only from permissioned actor.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |
| amount | uint256 | token amount |
| withdrawTo | address | withdraw destination address |

### addPaymentToken

```solidity
function addPaymentToken(address token) external
```

adds a token to the stablecoins list.
can be called only from permissioned actor.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |

### removePaymentToken

```solidity
function removePaymentToken(address token) external
```

removes a token from stablecoins list.
can be called only from permissioned actor.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token address |

## IRedemptionVault

### Redeem

```solidity
event Redeem(uint256 id, address user, address usdTokenOut, uint256 amount)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | unique id of a redemption |
| user | address | address that initiated the redeem |
| usdTokenOut | address | address of usd token that user wants to receive after redeem |
| amount | uint256 | amount of `usdTokenOut` |

### redeem

```solidity
function redeem(address tokenOut, uint256 amountTBillIn) external
```

Transfers mTBILL from the user to the admin.
After that admin should validate the redemption and transfer
selected `tokenOut` back to user

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenOut | address | stable coin token address to redeem to |
| amountTBillIn | uint256 | amount of mTBILL to redeem |

## DecimalsCorrectionLibrary

### convert

```solidity
function convert(uint256 originalAmount, uint256 originalDecimals, uint256 decidedDecimals) internal pure returns (uint256)
```

_converts `originalAmount` with `originalDecimals` into
amount with `decidedDecimals`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| originalAmount | uint256 | amount to convert |
| originalDecimals | uint256 | decimals of the original amount |
| decidedDecimals | uint256 | decimals for the output amount |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | amount converted amount with `decidedDecimals` |

### convertFromBase18

```solidity
function convertFromBase18(uint256 originalAmount, uint256 decidedDecimals) internal pure returns (uint256)
```

_converts `originalAmount` with decimals 18 into
amount with `decidedDecimals`_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| originalAmount | uint256 | amount to convert |
| decidedDecimals | uint256 | decimals for the output amount |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | amount converted amount with `decidedDecimals` |

### convertToBase18

```solidity
function convertToBase18(uint256 originalAmount, uint256 originalDecimals) internal pure returns (uint256)
```

_converts `originalAmount` with `originalDecimals` into
amount with decimals 18_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| originalAmount | uint256 | amount to convert |
| originalDecimals | uint256 | decimals of the original amount |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | amount converted amount with 18 decimals |

## mTBILL

### metadata

```solidity
mapping(bytes32 => bytes) metadata
```

metadata key => metadata value

### initialize

```solidity
function initialize(address _accessControl) external
```

upgradeable pattern contract`s initializer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accessControl | address | address of MidasAccessControll contract |

### mint

```solidity
function mint(address to, uint256 amount) external
```

mints mTBILL token `amount` to a given `to` address.
should be called only from permissioned actor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | addres to mint tokens to |
| amount | uint256 | amount to mint |

### burn

```solidity
function burn(address from, uint256 amount) external
```

burns mTBILL token `amount` to a given `to` address.
should be called only from permissioned actor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | addres to burn tokens from |
| amount | uint256 | amount to burn |

### pause

```solidity
function pause() external
```

puts mTBILL token on pause.
should be called only from permissioned actor

### unpause

```solidity
function unpause() external
```

puts mTBILL token on pause.
should be called only from permissioned actor

### setMetadata

```solidity
function setMetadata(bytes32 key, bytes data) external
```

updates contract`s metadata.
should be called only from permissioned actor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | metadata map. key |
| data | bytes | metadata map. value |

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual
```

_overrides _beforeTokenTransfer function to ban
blaclisted users from using the token functions_

## AggregatorV3DeprecatedMock

### decimals

```solidity
function decimals() external view returns (uint8)
```

### description

```solidity
function description() external view returns (string)
```

### version

```solidity
function version() external view returns (uint256)
```

### setRoundData

```solidity
function setRoundData(int256 _data) external
```

### getRoundData

```solidity
function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

### latestRoundData

```solidity
function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

## AggregatorV3Mock

### decimals

```solidity
function decimals() external view returns (uint8)
```

### description

```solidity
function description() external view returns (string)
```

### version

```solidity
function version() external view returns (uint256)
```

### setRoundData

```solidity
function setRoundData(int256 _data) external
```

### getRoundData

```solidity
function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

### latestRoundData

```solidity
function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

## AggregatorV3UnhealthyMock

### decimals

```solidity
function decimals() external view returns (uint8)
```

### description

```solidity
function description() external view returns (string)
```

### version

```solidity
function version() external view returns (uint256)
```

### setRoundData

```solidity
function setRoundData(int256 _data) external
```

### getRoundData

```solidity
function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

### latestRoundData

```solidity
function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

## ERC20Mock

### constructor

```solidity
constructor(uint8 decimals_) public
```

### mint

```solidity
function mint(address to, uint256 amount) external
```

### decimals

```solidity
function decimals() public view returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the value {ERC20} uses, unless this function is
overridden;

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

## ERC20MockWithName

### constructor

```solidity
constructor(uint8 decimals_, string name, string symb) public
```

### mint

```solidity
function mint(address to, uint256 amount) external
```

### decimals

```solidity
function decimals() public view returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the value {ERC20} uses, unless this function is
overridden;

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

## BlacklistableTester

### initialize

```solidity
function initialize(address _accessControl) external
```

### initializeWithoutInitializer

```solidity
function initializeWithoutInitializer(address _accessControl) external
```

### onlyNotBlacklistedTester

```solidity
function onlyNotBlacklistedTester(address account) external
```

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## DataFeedTest

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## DecimalsCorrectionTester

### convertAmountFromBase18Public

```solidity
function convertAmountFromBase18Public(uint256 amount, uint256 decimals) public pure returns (uint256)
```

### convertAmountToBase18Public

```solidity
function convertAmountToBase18Public(uint256 amount, uint256 decimals) public pure returns (uint256)
```

## DepositVaultTest

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## GreenlistableTester

### initialize

```solidity
function initialize(address _accessControl) external
```

### initializeWithoutInitializer

```solidity
function initializeWithoutInitializer(address _accessControl) external
```

### onlyGreenlistedTester

```solidity
function onlyGreenlistedTester(address account) external
```

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## ManageableVaultTester

### initialize

```solidity
function initialize(address _accessControl, address _mTbill, address _tokensReceiver) external
```

### initializeWithoutInitializer

```solidity
function initializeWithoutInitializer(address _accessControl, address _mTbill, address _tokensReceiver) external
```

### vaultRole

```solidity
function vaultRole() public view virtual returns (bytes32)
```

AC role of vault administrator

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | role bytes32 role |

## MidasAccessControlTest

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## PausableTester

### initialize

```solidity
function initialize(address _accessControl) external
```

### initializeWithoutInitializer

```solidity
function initializeWithoutInitializer(address _accessControl) external
```

### pauseAdminRole

```solidity
function pauseAdminRole() public view returns (bytes32)
```

_virtual function to determine pauseAdmin role_

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## RedemptionVaultTest

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## WithMidasAccessControlTester

### initialize

```solidity
function initialize(address _accessControl) external
```

### initializeWithoutInitializer

```solidity
function initializeWithoutInitializer(address _accessControl) external
```

### grantRoleTester

```solidity
function grantRoleTester(bytes32 role, address account) external
```

### revokeRoleTester

```solidity
function revokeRoleTester(bytes32 role, address account) external
```

### withOnlyRole

```solidity
function withOnlyRole(bytes32 role, address account) external
```

### withOnlyNotRole

```solidity
function withOnlyNotRole(bytes32 role, address account) external
```

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

## mTBILLTest

### _disableInitializers

```solidity
function _disableInitializers() internal
```

_Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
to any version. It is recommended to use this to lock implementation contracts that are designed to be called
through proxies.

Emits an {Initialized} event the first time it is successfully executed._

