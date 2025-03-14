import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('tweets')
@Controller('tweets')
export class TweetsController {
    constructor(private readonly tweetsService: TweetsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new tweet' })
    @ApiResponse({ status: 201, description: 'Tweet created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createTweetDto: CreateTweetDto, @Request() req) {
        return this.tweetsService.create(req.user.id, createTweetDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tweets' })
    @ApiResponse({ status: 200, description: 'Return all tweets' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.tweetsService.findAll(page, limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a tweet by ID' })
    @ApiResponse({ status: 200, description: 'Return the tweet' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    findOne(@Param('id') id: string) {
        return this.tweetsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a tweet' })
    @ApiResponse({ status: 200, description: 'Tweet updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    update(
        @Param('id') id: string,
        @Body() updateTweetDto: UpdateTweetDto,
        @Request() req,
    ) {
        return this.tweetsService.update(id, req.user.id, updateTweetDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a tweet' })
    @ApiResponse({ status: 200, description: 'Tweet deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    remove(@Param('id') id: string, @Request() req) {
        return this.tweetsService.remove(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/like')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Like a tweet' })
    @ApiResponse({ status: 201, description: 'Tweet liked successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    likeTweet(@Param('id') id: string, @Request() req) {
        return this.tweetsService.likeTweet(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/like')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unlike a tweet' })
    @ApiResponse({ status: 200, description: 'Tweet unliked successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    unlikeTweet(@Param('id') id: string, @Request() req) {
        return this.tweetsService.unlikeTweet(id, req.user.id);
    }

    @Get(':id/likes')
    @ApiOperation({ summary: 'Get likes of a tweet' })
    @ApiResponse({ status: 200, description: 'Return the likes' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    getTweetLikes(@Param('id') id: string) {
        return this.tweetsService.getTweetLikes(id);
    }

    @Get(':id/replies')
    @ApiOperation({ summary: 'Get replies to a tweet' })
    @ApiResponse({ status: 200, description: 'Return the replies' })
    @ApiResponse({ status: 404, description: 'Tweet not found' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getTweetReplies(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.tweetsService.getTweetReplies(id, page, limit);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get tweets by a user' })
    @ApiResponse({ status: 200, description: 'Return the tweets' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getUserTweets(
        @Param('userId') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.tweetsService.getUserTweets(userId, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get('feed/me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get the current user\'s feed' })
    @ApiResponse({ status: 200, description: 'Return the feed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getUserFeed(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.tweetsService.getUserFeed(req.user.id, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Post('poll/option/:optionId/respond')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Respond to a poll' })
    @ApiResponse({ status: 201, description: 'Poll response created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Poll option not found' })
    respondToPoll(@Param('optionId') optionId: string, @Request() req) {
        return this.tweetsService.respondToPoll(optionId, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('poll/:pollId/response')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a poll response (unvote)' })
    @ApiResponse({ status: 200, description: 'Poll response removed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Poll response not found' })
    removePollResponse(@Param('pollId') pollId: string, @Request() req) {
        return this.tweetsService.removePollResponse(pollId, req.user.id);
    }

    @Get('search/:query')
    @ApiOperation({ summary: 'Search tweets' })
    @ApiResponse({ status: 200, description: 'Return the tweets' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    searchTweets(
        @Param('query') query: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.tweetsService.searchTweets(query, page, limit);
    }

    @Get('hashtag/:tag')
    @ApiOperation({ summary: 'Get tweets by hashtag' })
    @ApiResponse({ status: 200, description: 'Return the tweets' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getTweetsByHashtag(
        @Param('tag') tag: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.tweetsService.getTweetsByHashtag(tag, page, limit);
    }
} 