import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversationDto {
    @ApiProperty({
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        description: 'Array of user IDs to include in the conversation',
    })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    participantIds: string[];
} 