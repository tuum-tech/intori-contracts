import { ethers } from 'hardhat'

async function main() {
  const [user1, user2] = await ethers.getSigners()
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  const CredentialRegistry = await ethers.getContractFactory(
    'CredentialRegistry'
  )
  const credentialRegistry = CredentialRegistry.attach(contractAddress)

  // Example: Register a Credential
  const credentialId = ethers.encodeBytes32String('example-credential-id')
  const recipientDid = `did:pkh:eip155:1:${user1.address}`
  const credentialHash = ethers.keccak256(
    ethers.toUtf8Bytes('example-credential')
  )
  const credentialType = 'example-type'

  await credentialRegistry
    .connect(user1)
    .registerCredential(
      credentialId,
      recipientDid,
      credentialHash,
      credentialType
    )
  console.log('Credential registered')

  // Create the message hash as expected by the contract
  const messageHash = ethers.solidityPackedKeccak256(
    ['bytes32', 'address'],
    [credentialId, user1.address]
  )

  // Prepare the message for signing
  const message = ethers.getBytes(messageHash)

  // Sign the message using `user1`'s private key
  const signature = await user1.signMessage(message)

  await credentialRegistry.verifyCredential(credentialId, signature)
  console.log('Credential verified')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
