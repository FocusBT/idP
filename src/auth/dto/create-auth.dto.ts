// src/registration/dto/create-user.dto.ts
import { IsEmail, IsISO31661Alpha2, IsInt, Min, Max, Matches } from 'class-validator';


export class CreateUserDto {
  @IsEmail() email: string;

  @Matches(/^[\p{L} .'-]{2,60}$/u, { message: 'Invalid name' })
  name: string;

  @IsInt() @Min(13) @Max(120) age: number;

  @IsISO31661Alpha2() country: string;               // e.g. "US", "DE"

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be YYYY-MM-DD' })
  dob: string;                                       // keep as string for now
}