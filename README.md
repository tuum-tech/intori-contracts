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
npx hardhat ignition deploy ./ignition/modules/CredentialRegistry.ts --network localhost
```

3. Run an interact script

```bash
npm run interact
```

This runs the script in `scripts/interact.ts` which has an example code on how the register and verify methods work.

## Verify the contracts

When you deploy to a testnet or mainnet, you probably want to verify the contract at the same time for which you can do:

```bash
npx hardhat ignition deploy ignition/modules/CredentialRegistry.ts --network base-sepolia --deployment-id base-sepolia-deployment
```

## Hardhat Tasks

### Print the list of available accounts

```bash
npx hardhat accounts
```

## Contract Info

- CredentialMetadata Struct: Holds information about a registered credential.
- Mappings: Stores issuer-to-credential IDs, recipient DID-to-credential IDs, credential type-to-credential IDs, and issued/received credential counts.
- registerCredential Function:
  - Checks if the credential ID is already registered.
  - Stores the credential metadata.
  - Updates issuer, recipient, and type-based mappings.
  - Emits a CredentialRegistered event.
- Getter Functions:
  - getCredentialsByIssuer: Retrieves credentials issued by a specific address.
  - getCredentialsByRecipient: Retrieves credentials associated with a recipient DID.
  - getCredentialsByType: Retrieves credentials of a specific type.
- verifyCredential Function:
  - Checks if the credential ID exists.
  - Uses verifyEvmDid for Ethereum-based DIDs (optional for other DID methods).
  - Emits a CredentialVerified event if the signature is valid.
- verifyEvmDid Function:
  - Extracts the address from the DID (assuming Ethereum DID format).
  - Calculates the message hash as expected by the contract (including the Ethereum Signed Message prefix).
  - Recovers the signer's address using ecrecover.
  - Compares the recovered address with the recipient address and returns it if valid.
