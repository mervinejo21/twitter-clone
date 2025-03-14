import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email of the user',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: 'johndoe',
        description: 'The username of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username?: string;

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
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @ApiProperty({
        example: 'I am a software developer',
        description: 'The bio of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({
        example: 'https://example.com/profile.jpg',
        description: 'The profile image URL of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    profileImageUrl?: string;

    @ApiProperty({
        example: 'https://example.com/banner.jpg',
        description: 'The banner image URL of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    bannerImageUrl?: string;
} 