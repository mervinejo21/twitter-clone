import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        // Check if email already exists
        const existingUserByEmail = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if username already exists
        const existingUserByUsername = await this.prisma.user.findUnique({
            where: { username: createUserDto.username },
        });

        if (existingUserByUsername) {
            throw new ConflictException('Username already exists');
        }

        return this.prisma.user.create({
            data: createUserDto,
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                bio: true,
                profileImageUrl: true,
                bannerImageUrl: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        // Check if user exists
        await this.findById(id);

        // Check if email is being updated and if it already exists
        if (updateUserDto.email) {
            const existingUserByEmail = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });

            if (existingUserByEmail && existingUserByEmail.id !== id) {
                throw new ConflictException('Email already exists');
            }
        }

        // Check if username is being updated and if it already exists
        if (updateUserDto.username) {
            const existingUserByUsername = await this.prisma.user.findUnique({
                where: { username: updateUserDto.username },
            });

            if (existingUserByUsername && existingUserByUsername.id !== id) {
                throw new ConflictException('Username already exists');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                bio: true,
                profileImageUrl: true,
                bannerImageUrl: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string) {
        // Check if user exists
        await this.findById(id);

        return this.prisma.user.delete({
            where: { id },
        });
    }

    async getFollowers(userId: string) {
        // Check if user exists
        await this.findById(userId);

        return this.prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true,
                    },
                },
            },
        });
    }

    async getFollowing(userId: string) {
        // Check if user exists
        await this.findById(userId);

        return this.prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true,
                    },
                },
            },
        });
    }

    async followUser(followerId: string, followingId: string) {
        // Check if both users exist
        await this.findById(followerId);
        await this.findById(followingId);

        // Check if already following
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            throw new ConflictException('Already following this user');
        }

        // Create follow relationship
        const follow = await this.prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true,
                    },
                },
            },
        });

        // Create notification
        await this.prisma.notification.create({
            data: {
                type: 'FOLLOW',
                content: 'started following you',
                userId: followingId,
                targetId: followerId,
            },
        });

        return follow;
    }

    async unfollowUser(followerId: string, followingId: string) {
        // Check if both users exist
        await this.findById(followerId);
        await this.findById(followingId);

        // Check if following
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (!existingFollow) {
            throw new NotFoundException('Not following this user');
        }

        // Delete follow relationship
        return this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }
} 