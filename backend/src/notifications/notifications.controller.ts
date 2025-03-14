import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all notifications for the current user' })
    @ApiResponse({ status: 200, description: 'Return all notifications' })
    getNotifications(@Request() req) {
        return this.notificationsService.getNotifications(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('unread')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get unread notification count' })
    @ApiResponse({ status: 200, description: 'Return unread count' })
    getUnreadCount(@Request() req) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/read')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    markAsRead(@Param('id') id: string, @Request() req) {
        return this.notificationsService.markAsRead(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('read-all')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
} 