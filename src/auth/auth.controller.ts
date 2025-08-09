// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { ProofRequestDto } from './dto/proof.dto';
import { VerifyRequestDto } from './dto/verify.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Register User',
    description: 'Register a new user and generate cryptographic commitment. Returns secret, nonce, and commitment for ZK proof generation.'
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        secret: {
          type: 'string',
          example: '0x1a2b3c4d5e6f7890abcdef1234567890fedcba0987654321',
          description: 'Hexadecimal secret (keep private)'
        },
        nonce: {
          type: 'string',
          example: '0x9876543210fedcba',
          description: 'Random nonce used in secret generation'
        },
        commitment: {
          type: 'string',
          example: '12345678901234567890123456789012345678901234567890123456789012345678',
          description: 'Public commitment (Poseidon hash of secret)'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('proof')
  @ApiOperation({
    summary: 'Generate ZK Proof',
    description: 'Generate a zero-knowledge proof that you know the secret corresponding to the commitment, without revealing the secret. IMPORTANT: You must use the exact secretHex and commitment values returned from the registration endpoint.'
  })
  @ApiResponse({
    status: 201,
    description: 'ZK proof successfully generated',
    schema: {
      type: 'object',
      properties: {
        proof: {
          type: 'object',
          description: 'Groth16 proof object with a, b, c components',
          example: {
            "a": ["123456789", "987654321"],
            "b": [["111111111", "222222222"], ["333333333", "444444444"]],
            "c": ["555555555", "666666666"]
          }
        },
        publicSignals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Public signals (commitment value)',
          example: ["12345678901234567890123456789012345678901234567890123456789012345678"]
        },
        solidityArgs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Arguments formatted for Solidity verifier contract',
          example: ["0x123...", "0x456..."]
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid secret or commitment'
  })
  async generateProof(@Body() dto: ProofRequestDto) {
    return this.authService.generateProof(dto.secretHex, dto.commitment);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify ZK Proof',
    description: 'Verify a zero-knowledge proof. Returns true if the proof is valid and corresponds to the given commitment. IMPORTANT: Use the exact proof data returned from the proof generation endpoint.'
  })
  @ApiResponse({
    status: 201,
    description: 'Proof verification result',
    schema: {
      type: 'boolean',
      example: true,
      description: 'True if proof is valid, throws 401 if invalid'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid ZK proof or proof does not match commitment'
  })
  async verifyProof(@Body() dto: VerifyRequestDto) {
    return this.authService.verifyProof(
      dto.commitment,
      dto.proof,
      dto.publicSignals,
    );
  }
}
