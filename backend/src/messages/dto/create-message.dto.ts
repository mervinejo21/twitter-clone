import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
    @ApiProperty({
        example: 'Hello, how are you?',
        description: 'The content of the message',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'The ID of the conversation',
    })
    @IsUUID()
    @IsNotEmpty()
    conversationId: string;
} 