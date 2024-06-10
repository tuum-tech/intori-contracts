# intori-contracts

## Compile the contracts

```
npx hardhat compile
```

## Test the contracts

### Measure code coverage

```
npx hardhat coverage
```

### Run tests

Using the gas reporter:

```
REPORT_GAS=true npx hardhat test
```

Running the tests in parallel

```
npx hardhat test --parallel
```

## Deploy the contracts

You can deploy in the `localhost` network following these steps:

1. Start a local node

```bash
npx hardhat node
```

2. Deploy the Ignition module

```bash
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```

## Verify the contracts

When you deploy to a testnet or mainnet, you probably want to verify the contract at the same time for which you can do:

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network base-sepolia --deployment-id base-sepolia-deployment
```

## Hardhat Tasks

### Print the list of available accounts

```bash
npx hardhat accounts
```
