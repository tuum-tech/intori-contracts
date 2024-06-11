import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre, { ethers } from 'hardhat'

describe('CredentialRegistry', function () {
  async function deployCredentialRegistryFixture() {
    const [deployer, user1, user2] = await hre.ethers.getSigners()

    const CredentialRegistry = await hre.ethers.getContractFactory(
      'CredentialRegistry'
    )
    const credentialRegistry = await CredentialRegistry.deploy()

    return { credentialRegistry, deployer, user1, user2 }
  }

  describe('Deployment', function () {
    it('Should deploy the contract', async function () {
      const { credentialRegistry } = await loadFixture(
        deployCredentialRegistryFixture
      )
      expect(await credentialRegistry.getAddress()).to.properAddress
    })
  })

  describe('Registering Credentials', function () {
    it('Should not register credential with same ID twice', async function () {
      const { credentialRegistry, user1 } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const credentialId = ethers.encodeBytes32String('1234567890abcdef')
      const recipientDid = 'did:example:user1'
      const credentialHash = ethers.keccak256(
        ethers.toUtf8Bytes('example-credential')
      )
      const credentialType = 'Degree'

      await credentialRegistry.registerCredential(
        credentialId,
        recipientDid,
        credentialHash,
        credentialType
      )

      await expect(
        credentialRegistry.registerCredential(
          credentialId,
          recipientDid,
          credentialHash,
          credentialType
        )
      ).to.be.revertedWith('Credential already registered')
    })
  })

  describe('Getter Functions', function () {
    it('Should return empty array for non-existent issuer', async function () {
      const { credentialRegistry } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const issuer = '0x0000000000000000000000000000000000000000'
      const credentials = await credentialRegistry.getCredentialsByIssuer(
        issuer
      )

      expect(credentials).to.be.empty
    })

    it('Should return empty array for non-existent recipient DID', async function () {
      const { credentialRegistry } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const recipientDid = 'did:example:nonexistent'
      const credentials = await credentialRegistry.getCredentialsByRecipient(
        recipientDid
      )

      expect(credentials).to.be.empty
    })

    it('Should return empty array for non-existent credential type', async function () {
      const { credentialRegistry } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const credentialType = 'NonexistentType'
      const credentials = await credentialRegistry.getCredentialsByType(
        credentialType
      )

      expect(credentials).to.be.empty
    })
  })

  describe('Verification Function', function () {
    it('Should fail verification for non-existent credential', async function () {
      const { credentialRegistry } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const credentialId = ethers.encodeBytes32String('9876543210fedcba')
      const signature =
        '0x0000000000000000000000000000000000000000000000000000000000000000'

      await expect(
        credentialRegistry.verifyCredential(credentialId, signature)
      ).to.be.revertedWith('Credential does not exist')
    })

    it('Should fail verification for invalid signature', async function () {
      const { credentialRegistry, user1 } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const credentialId = ethers.encodeBytes32String('abcdef0123456789')
      const recipientDid = 'did:example:user1'
      const credentialHash = ethers.keccak256(
        ethers.toUtf8Bytes('example-credential')
      )
      const credentialType = 'Certificate'

      await credentialRegistry
        .connect(user1)
        .registerCredential(
          credentialId,
          recipientDid,
          credentialHash,
          credentialType
        )

      const invalidSignature =
        '0x0000000000000000000000000000000000000000000000000000000000000000'

      await expect(
        credentialRegistry.verifyCredential(credentialId, invalidSignature)
      ).to.be.revertedWith('Invalid signature')
    })

    it('Should fail verification for incorrect signer', async function () {
      const { credentialRegistry, user1, user2 } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const credentialId = ethers.encodeBytes32String('abcdef0123456789')
      const recipientDid = `did:pkh:eip155:1:${user1.address}`
      const credentialHash = ethers.keccak256(
        ethers.toUtf8Bytes('example-credential')
      )
      const credentialType = 'Certificate'

      await credentialRegistry.registerCredential(
        credentialId,
        recipientDid,
        credentialHash,
        credentialType
      )

      // Create the message hash as expected by the contract
      const messageHash = ethers.solidityPackedKeccak256(
        ['bytes32', 'address'],
        [credentialId, user1.address]
      )

      // Prepare the message for signing
      const message = ethers.getBytes(messageHash)

      // Sign the message using `user2`'s private key
      const signature = await user2.signMessage(message)

      // Expect verification to revert
      await expect(
        credentialRegistry.verifyCredential(credentialId, signature)
      ).to.be.revertedWith('Invalid signature')
    })

    it('Should successfully verify a credential with matching signature', async function () {
      const { credentialRegistry, deployer, user1 } = await loadFixture(
        deployCredentialRegistryFixture
      )

      const credentialId = ethers.encodeBytes32String('abcdef0123456789')
      const recipientDid = `did:pkh:eip155:1:${user1.address}`
      const credentialHash = ethers.keccak256(
        ethers.toUtf8Bytes('example-credential')
      )
      const credentialType = 'Certificate'

      await credentialRegistry.registerCredential(
        credentialId,
        recipientDid,
        credentialHash,
        credentialType
      )

      // Create the message hash as expected by the contract
      const messageHash = ethers.solidityPackedKeccak256(
        ['bytes32', 'address'],
        [credentialId, user1.address]
      )

      // Prepare the message for signing
      const message = ethers.getBytes(messageHash)

      // Sign the message using `user1`'s private key
      const signature = await user1.signMessage(message)

      // Expect verification to succeed
      await expect(credentialRegistry.verifyCredential(credentialId, signature))
        .to.emit(credentialRegistry, 'CredentialVerified')
        .withArgs(credentialId, deployer.address)
    })
  })
})
