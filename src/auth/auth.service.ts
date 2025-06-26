import { Injectable } from '@nestjs/common';
// import { PrismaService } from './prisma/prisma.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { generateSecret } from 'src/crpyto/secret-generator';

@Injectable()
export class AuthService {
  // constructor(private prisma: PrismaService) {}

  async register(dto: CreateUserDto) {
    const { secret, commitment, nonce } = await generateSecret(dto);

    // await this.prisma.credential.create({
    //   data: {
    //     email: dto.email.toLowerCase(),
    //     name: dto.name.trim(),
    //     age: dto.age,
    //     country: dto.country,
    //     dob: dto.dob,
    //     commitment: commitment.toString(),
    //   },
    // });
    return { secret: '0x' + secret.toString(16), nonce: '0x' + nonce.toString(16), commitment: commitment };
  }
}
