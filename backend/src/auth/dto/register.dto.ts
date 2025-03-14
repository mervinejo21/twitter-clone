import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email of the user',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'johndoe',
        description: 'The username of the user',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'The display name of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    displayName?: string;

    @ApiProperty({
        example: 'password123',
        description: 'The password of the user',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
} 