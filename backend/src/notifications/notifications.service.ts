import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async getNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: {
                userId,
            },
            include: {
                target: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });

        return { count };
    }

    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: {
                isRead: true,
            },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }
} 