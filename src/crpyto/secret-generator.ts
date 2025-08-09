// src/crypto/secret-generator.ts
import { buildPoseidon } from 'circomlibjs';
import { keccak_256 }    from '@noble/hashes/sha3';
import { randomBytes }   from 'crypto';


function toBigInt(hexOrNum: string | number): bigint {
  return typeof hexOrNum === 'number'
    ? BigInt(hexOrNum)
    : BigInt('0x' + hexOrNum.replace(/^0x/, ''));
}

// We'll hold our initialized poseidon instance here:
let poseidon: null | ReturnType<Awaited<ReturnType<typeof buildPoseidon>>> = null;

// Ensure poseidon is ready; call at startup or on first use.
async function ensurePoseidon() {
  if (poseidon === null) {
    poseidon = await buildPoseidon();
  }
}

export async function generateSecret(
  attrs: { email: string; name: string; age: number; country: string; dob: string; }
): Promise<{secret: bigint; commitment: bigint; nonce: bigint;}> {
  const { email, name, age, country, dob } = attrs;

  // 1) Make sure we have our poseidon builder
  await ensurePoseidon();

  // 2) Hash email & name to bytes
  const emailHash = keccak_256(email.toLowerCase());
  const nameHash  = keccak_256(name.trim());

  const dobInt    = Number(dob.replace(/-/g, ''));

  // 3) Build the userHash via Poseidon
  const rawUserHash = poseidon!([
    toBigInt(Buffer.from(emailHash).toString('hex')),
    toBigInt(Buffer.from(nameHash).toString('hex')),
    BigInt(age),
    BigInt(Buffer.from(country).readUInt16BE(0)),
    BigInt(dobInt),
  ]);
  // Convert to bigint
  const userHash = BigInt(poseidon!.F.toString(rawUserHash));

  // 4) Generate a random nonce
  const nonce = toBigInt(randomBytes(16).toString('hex'));

  // 5) Compute secret = H(userHash, nonce)
  const rawSecret = poseidon!([userHash, nonce]);
  const secret    = BigInt(poseidon!.F.toString(rawSecret));

  // 6) And final commitment = H(secret)
  const rawComm   = poseidon!([secret]);
  const commitment= BigInt(poseidon!.F.toString(rawComm));

  return { secret, commitment, nonce };
}
