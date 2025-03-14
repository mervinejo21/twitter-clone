import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @UseGuards(JwtAuthGuard)
    @Post('conversations')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new conversation' })
    @ApiResponse({ status: 201, description: 'Conversation created successfully' })
    createConversation(
        @Request() req,
        @Body() createConversationDto: CreateConversationDto,
    ) {
        return this.messagesService.createConversation(req.user.id, createConversationDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversations')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all conversations for the current user' })
    @ApiResponse({ status: 200, description: 'Return all conversations' })
    getConversations(@Request() req) {
        return this.messagesService.getConversations(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversations/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a conversation by ID' })
    @ApiResponse({ status: 200, description: 'Return the conversation' })
    @ApiResponse({ status: 404, description: 'Conversation not found' })
    getConversation(@Param('id') id: string, @Request() req) {
        return this.messagesService.getConversation(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversations/:id/messages')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get messages for a conversation' })
    @ApiResponse({ status: 200, description: 'Return the messages' })
    @ApiResponse({ status: 404, description: 'Conversation not found' })
    getMessages(@Param('id') id: string, @Request() req) {
        return this.messagesService.getMessages(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new message' })
    @ApiResponse({ status: 201, description: 'Message created successfully' })
    createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
        return this.messagesService.createMessage(req.user.id, createMessageDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('unread')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get unread message count' })
    @ApiResponse({ status: 200, description: 'Return unread count' })
    getUnreadCount(@Request() req) {
        return this.messagesService.getUnreadCount(req.user.id);
    }
} 