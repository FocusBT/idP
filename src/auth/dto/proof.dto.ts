import { ApiProperty } from '@nestjs/swagger';

export class ProofRequestDto {
    @ApiProperty({
        description: 'Secret value in hexadecimal format (from registration response)',
        example: '0x258c489bb45c94cfde65f05964efc75a47e4e4310595935ff10a440cc9acbbed'
    })
    secretHex: string;

    @ApiProperty({
        description: 'Commitment value (from registration response)',
        example: '5360578543298580981610616694364508704365712000716700730584261436538390710233'
    })
    commitment: string;
}