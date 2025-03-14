import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePollDto {
    @ApiProperty({
        example: 'What is your favorite programming language?',
        description: 'The question for the poll',
    })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({
        example: ['JavaScript', 'Python', 'Java', 'C#'],
        description: 'Array of poll options',
    })
    @IsArray()
    @IsString({ each: true })
    @MinLength(2, {
        each: true,
        message: 'Each poll option must have at least 2 characters',
    })
    options: string[];

    @ApiProperty({
        example: '2023-12-31T23:59:59Z',
        description: 'The expiration date of the poll',
    })
    @IsDateString()
    expiresAt: string;
} 