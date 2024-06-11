import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const CredentialRegistryModule = buildModule(
  'CredentialRegistryModule',
  (m) => {
    // Deploy the CredentialRegistry contract
    const credentialRegistry = m.contract('CredentialRegistry')

    return { credentialRegistry }
  }
)

export default CredentialRegistryModule
