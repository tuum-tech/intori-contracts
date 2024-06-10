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
