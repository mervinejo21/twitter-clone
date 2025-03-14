import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePollDto } from './create-poll.dto';

export class CreateTweetDto {
    @ApiProperty({
        example: 'This is my first tweet!',
        description: 'The content of the tweet',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        description: 'Array of image URLs',
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @ApiProperty({
        example: 'https://example.com/video.mp4',
        description: 'URL to a video',
        required: false,
    })
    @IsString()
    @IsOptional()
    videoUrl?: string;

    @ApiProperty({
        description: 'Poll data for the tweet',
        required: false,
        type: CreatePollDto,
    })
    @ValidateNested()
    @Type(() => CreatePollDto)
    @IsOptional()
    poll?: CreatePollDto;

    @ApiProperty({
        example: null,
        description: 'ID of the tweet being retweeted',
        required: false,
    })
    @IsString()
    @IsOptional()
    retweetId?: string;

    @ApiProperty({
        example: null,
        description: 'ID of the tweet being replied to',
        required: false,
    })
    @IsString()
    @IsOptional()
    replyToId?: string;
} 