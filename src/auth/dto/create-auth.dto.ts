// src/registration/dto/create-user.dto.ts
import { IsEmail, IsISO31661Alpha2, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'alice@ex.com'
  })
  @IsEmail() 
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Alice12312'
  })
  @Matches(/^[\p{L} .'-]{2,60}$/u, { message: 'Invalid name' })
  name: string;

  @ApiProperty({
    description: 'Age of the user (13-120)',
    example: 50,
    minimum: 13,
    maximum: 120
  })
  @IsInt() @Min(13) @Max(120) 
  age: number;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'IR'
  })
  @IsISO31661Alpha2() 
  country: string;

  @ApiProperty({
    description: 'Date of birth in YYYY-MM-DD format',
    example: '1994-05-01'
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be YYYY-MM-DD' })
  dob: string;
}