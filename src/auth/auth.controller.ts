// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { ProofRequestDto } from './dto/proof.dto';
import { VerifyRequestDto } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('proof')
  async generateProof(@Body() dto: ProofRequestDto) {
    return this.authService.generateProof(dto.secretHex, dto.commitment);
  }

  /** 3) Verify the proof */
  @Post('verify')
  async verifyProof(@Body() dto: VerifyRequestDto) {
    return this.authService.verifyProof(
      dto.commitment,
      dto.proof,
      dto.publicSignals,
    );
  }
}
