// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { groth16 } from 'snarkjs';
import { CreateUserDto } from './dto/create-auth.dto';
import { generateSecret } from 'src/crpyto/secret-generator';
import { generateProof as buildProof } from 'src/crpyto/generate-proof';

// CommonJS‑friendly JSON import
const vkey = require('../../circuits/build/verification_key.json');

@Injectable()
export class AuthService {
  /* -----------------------------------------------------------
   * 1. Registration  → returns secret / commitment / nonce
   * --------------------------------------------------------- */
  async register(dto: CreateUserDto) {
    const { secret, commitment, nonce } = await generateSecret(dto);
    return {
      secret:     `0x${secret.toString(16)}`,
      nonce:      `0x${nonce.toString(16)}`,
      commitment: commitment.toString(),
    };
  }

  /* -----------------------------------------------------------
   * 2. Proof generation  → returns proof + publicSignals
   * --------------------------------------------------------- */
  async generateProof(secretHex: string, commitment: string | bigint) {
    const { proof, publicSignals, solidityArgs } = await buildProof(
      secretHex,
      commitment,
    );

    return { proof, publicSignals, solidityArgs };
  }

  /* -----------------------------------------------------------
   * 3. Proof verification  → throws 401 on failure, true on success
   * --------------------------------------------------------- */
  async verifyProof(
    commitment: string,
    proof: any,
    publicSignals: string[],
  ) {
    const ok = await groth16.verify(vkey, publicSignals, proof);

    if (!ok || publicSignals[0] !== commitment) {
      throw new UnauthorizedException('invalid ZK proof');
    }
    return true;
  }
}
