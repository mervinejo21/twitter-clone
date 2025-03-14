import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class MessagesService {
    constructor(private readonly prisma: PrismaService) { }

    async createConversation(userId: string, createConversationDto: CreateConversationDto) {
        // Ensure current user is not in the participantIds array
        if (createConversationDto.participantIds.includes(userId)) {
            throw new ForbiddenException('Cannot create conversation with yourself');
        }

        // Add current user to participants
        const allParticipantIds = [...createConversationDto.participantIds, userId];

        // Create conversation with participants
        const conversation = await this.prisma.conversation.create({
            data: {
                participants: {
                    create: allParticipantIds.map(participantId => ({
                        userId: participantId
                    }))
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                profileImageUrl: true,
                                isVerified: true
                            }
                        }
                    }
                }
            }
        });

        return conversation;
    }

    async getConversations(userId: string) {
        // Get all conversations where the user is a participant
        const conversations = await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                profileImageUrl: true,
                                isVerified: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return conversations;
    }

    async getConversation(id: string, userId: string) {
        // Check if conversation exists and user is a participant
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id,
                participants: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                profileImageUrl: true,
                                isVerified: true
                            }
                        }
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        return conversation;
    }

    async getMessages(conversationId: string, userId: string) {
        // Check if conversation exists and user is a participant
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Get messages for the conversation
        const messages = await this.prisma.message.findMany({
            where: {
                conversationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Mark messages as read
        await this.prisma.message.updateMany({
            where: {
                conversationId,
                userId: {
                    not: userId
                },
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return messages;
    }

    async createMessage(userId: string, createMessageDto: CreateMessageDto) {
        // Check if conversation exists and user is a participant
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: createMessageDto.conversationId,
                participants: {
                    some: {
                        userId
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Create message
        const message = await this.prisma.message.create({
            data: {
                content: createMessageDto.content,
                userId,
                conversationId: createMessageDto.conversationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true
                    }
                }
            }
        });

        // Update conversation updatedAt
        await this.prisma.conversation.update({
            where: {
                id: createMessageDto.conversationId
            },
            data: {
                updatedAt: new Date()
            }
        });

        return message;
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.message.count({
            where: {
                conversation: {
                    participants: {
                        some: {
                            userId
                        }
                    }
                },
                userId: {
                    not: userId
                },
                isRead: false
            }
        });

        return { count };
    }
} 