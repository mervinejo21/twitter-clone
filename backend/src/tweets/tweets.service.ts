import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';

@Injectable()
export class TweetsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, createTweetDto: CreateTweetDto) {
        // Extract hashtags from content
        const hashtags = this.extractHashtags(createTweetDto.content);

        // Create the tweet
        const tweet = await this.prisma.tweet.create({
            data: {
                content: createTweetDto.content,
                images: createTweetDto.images || [],
                videoUrl: createTweetDto.videoUrl,
                userId,
                retweetId: createTweetDto.retweetId,
                replyToId: createTweetDto.replyToId,
            },
            include: {
                user: {
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

        // Create poll if provided
        if (createTweetDto.poll) {
            const poll = await this.prisma.poll.create({
                data: {
                    question: createTweetDto.poll.question,
                    expiresAt: new Date(createTweetDto.poll.expiresAt),
                    tweetId: tweet.id,
                    options: {
                        create: createTweetDto.poll.options.map(option => ({
                            text: option,
                        })),
                    },
                },
                include: {
                    options: true,
                },
            });

            tweet['poll'] = poll;
        }

        // Create hashtags
        if (hashtags.length > 0) {
            for (const tag of hashtags) {
                // Find or create hashtag
                const hashtag = await this.prisma.hashtag.upsert({
                    where: { name: tag },
                    update: {},
                    create: { name: tag },
                });

                // Link hashtag to tweet
                await this.prisma.hashtagsOnTweets.create({
                    data: {
                        tweetId: tweet.id,
                        hashtagId: hashtag.id,
                    },
                });
            }
        }

        // Create notification for retweet
        if (createTweetDto.retweetId) {
            const originalTweet = await this.prisma.tweet.findUnique({
                where: { id: createTweetDto.retweetId },
                select: { userId: true },
            });

            if (originalTweet && originalTweet.userId !== userId) {
                await this.prisma.notification.create({
                    data: {
                        type: 'RETWEET',
                        content: 'retweeted your tweet',
                        userId: originalTweet.userId,
                        targetId: userId,
                        tweetId: createTweetDto.retweetId,
                    },
                });
            }
        }

        // Create notification for reply
        if (createTweetDto.replyToId) {
            const originalTweet = await this.prisma.tweet.findUnique({
                where: { id: createTweetDto.replyToId },
                select: { userId: true },
            });

            if (originalTweet && originalTweet.userId !== userId) {
                await this.prisma.notification.create({
                    data: {
                        type: 'COMMENT',
                        content: 'replied to your tweet',
                        userId: originalTweet.userId,
                        targetId: userId,
                        tweetId: createTweetDto.replyToId,
                    },
                });
            }
        }

        // Create notifications for mentions
        const mentions = this.extractMentions(createTweetDto.content);
        if (mentions.length > 0) {
            for (const mention of mentions) {
                const mentionedUser = await this.prisma.user.findUnique({
                    where: { username: mention },
                });

                if (mentionedUser && mentionedUser.id !== userId) {
                    await this.prisma.notification.create({
                        data: {
                            type: 'MENTION',
                            content: 'mentioned you in a tweet',
                            userId: mentionedUser.id,
                            targetId: userId,
                            tweetId: tweet.id,
                        },
                    });
                }
            }
        }

        return tweet;
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [tweets, total] = await Promise.all([
            this.prisma.tweet.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                            isVerified: true,
                        },
                    },
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            retweets: true,
                        },
                    },
                    poll: {
                        include: {
                            options: {
                                include: {
                                    _count: {
                                        select: {
                                            responses: true,
                                        },
                                    },
                                },
                            },
                            _count: {
                                select: {
                                    options: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.tweet.count(),
        ]);

        return {
            data: tweets,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const tweet = await this.prisma.tweet.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                        isVerified: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                        retweets: true,
                    },
                },
                poll: {
                    include: {
                        options: {
                            include: {
                                _count: {
                                    select: {
                                        responses: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                options: true,
                            },
                        },
                    },
                },
                retweet: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                profileImageUrl: true,
                                isVerified: true,
                            },
                        },
                    },
                },
                replyTo: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                profileImageUrl: true,
                                isVerified: true,
                            },
                        },
                    },
                },
            },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${id} not found`);
        }

        return tweet;
    }

    async update(id: string, userId: string, updateTweetDto: UpdateTweetDto) {
        // Check if tweet exists and belongs to the user
        const tweet = await this.prisma.tweet.findUnique({
            where: { id },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${id} not found`);
        }

        if (tweet.userId !== userId) {
            throw new BadRequestException('You can only update your own tweets');
        }

        // Update the tweet
        return this.prisma.tweet.update({
            where: { id },
            data: {
                content: updateTweetDto.content,
                images: updateTweetDto.images,
                videoUrl: updateTweetDto.videoUrl,
            },
            include: {
                user: {
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

    async remove(id: string, userId: string) {
        // Check if tweet exists and belongs to the user
        const tweet = await this.prisma.tweet.findUnique({
            where: { id },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${id} not found`);
        }

        if (tweet.userId !== userId) {
            throw new BadRequestException('You can only delete your own tweets');
        }

        // Delete the tweet
        return this.prisma.tweet.delete({
            where: { id },
        });
    }

    async likeTweet(tweetId: string, userId: string) {
        // Check if tweet exists
        const tweet = await this.prisma.tweet.findUnique({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${tweetId} not found`);
        }

        // Check if already liked
        const existingLike = await this.prisma.like.findUnique({
            where: {
                userId_tweetId: {
                    userId,
                    tweetId,
                },
            },
        });

        if (existingLike) {
            throw new BadRequestException('Tweet already liked');
        }

        // Create like
        const like = await this.prisma.like.create({
            data: {
                userId,
                tweetId,
            },
        });

        // Create notification if the tweet is not by the same user
        if (tweet.userId !== userId) {
            await this.prisma.notification.create({
                data: {
                    type: 'LIKE',
                    content: 'liked your tweet',
                    userId: tweet.userId,
                    targetId: userId,
                    tweetId,
                },
            });
        }

        return like;
    }

    async unlikeTweet(tweetId: string, userId: string) {
        // Check if tweet exists
        const tweet = await this.prisma.tweet.findUnique({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${tweetId} not found`);
        }

        // Check if liked
        const existingLike = await this.prisma.like.findUnique({
            where: {
                userId_tweetId: {
                    userId,
                    tweetId,
                },
            },
        });

        if (!existingLike) {
            throw new BadRequestException('Tweet not liked');
        }

        // Delete like
        return this.prisma.like.delete({
            where: {
                userId_tweetId: {
                    userId,
                    tweetId,
                },
            },
        });
    }

    async getTweetLikes(tweetId: string) {
        // Check if tweet exists
        const tweet = await this.prisma.tweet.findUnique({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${tweetId} not found`);
        }

        // Get likes
        return this.prisma.like.findMany({
            where: { tweetId },
            include: {
                user: {
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

    async getTweetReplies(tweetId: string, page = 1, limit = 10) {
        // Check if tweet exists
        const tweet = await this.prisma.tweet.findUnique({
            where: { id: tweetId },
        });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${tweetId} not found`);
        }

        const skip = (page - 1) * limit;

        const [replies, total] = await Promise.all([
            this.prisma.tweet.findMany({
                where: { replyToId: tweetId },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                            isVerified: true,
                        },
                    },
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            retweets: true,
                        },
                    },
                },
            }),
            this.prisma.tweet.count({
                where: { replyToId: tweetId },
            }),
        ]);

        return {
            data: replies,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getUserTweets(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [tweets, total] = await Promise.all([
            this.prisma.tweet.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                            isVerified: true,
                        },
                    },
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            retweets: true,
                        },
                    },
                    poll: {
                        include: {
                            options: {
                                include: {
                                    _count: {
                                        select: {
                                            responses: true,
                                        },
                                    },
                                },
                            },
                            _count: {
                                select: {
                                    options: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.tweet.count({
                where: { userId },
            }),
        ]);

        return {
            data: tweets,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getUserFeed(userId: string, page = 1, limit = 10) {
        // Get the IDs of users that the current user follows
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });

        const followingIds = following.map(f => f.followingId);

        // Add the user's own ID to include their tweets in the feed
        followingIds.push(userId);

        const skip = (page - 1) * limit;

        const [tweets, total] = await Promise.all([
            this.prisma.tweet.findMany({
                where: {
                    userId: { in: followingIds },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                            isVerified: true,
                        },
                    },
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            retweets: true,
                        },
                    },
                    poll: {
                        include: {
                            options: {
                                include: {
                                    _count: {
                                        select: {
                                            responses: true,
                                        },
                                    },
                                },
                            },
                            _count: {
                                select: {
                                    options: true,
                                },
                            },
                        },
                    },
                    retweet: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    displayName: true,
                                    profileImageUrl: true,
                                    isVerified: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.tweet.count({
                where: {
                    userId: { in: followingIds },
                },
            }),
        ]);

        return {
            data: tweets,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async respondToPoll(pollOptionId: string, userId: string) {
        // Check if poll option exists
        const pollOption = await this.prisma.pollOption.findUnique({
            where: { id: pollOptionId },
            include: {
                poll: true,
            },
        });

        if (!pollOption) {
            throw new NotFoundException(`Poll option with ID ${pollOptionId} not found`);
        }

        // Check if poll has expired
        if (new Date(pollOption.poll.expiresAt) < new Date()) {
            throw new BadRequestException('Poll has expired');
        }

        // Check if user has already responded to this poll
        const existingResponse = await this.prisma.pollResponse.findFirst({
            where: {
                userId,
                pollOption: {
                    pollId: pollOption.pollId,
                },
            },
        });

        // If the user clicked the same option, remove their vote (toggle behavior)
        if (existingResponse && existingResponse.pollOptionId === pollOptionId) {
            return this.prisma.pollResponse.delete({
                where: {
                    id: existingResponse.id,
                }
            });
        }
        // If they voted for a different option, handle that in removePollResponse + respondToPoll pattern
        else if (existingResponse) {
            throw new BadRequestException('You have already responded to this poll');
        }

        // Create new response
        return this.prisma.pollResponse.create({
            data: {
                userId,
                pollOptionId,
            },
            include: {
                pollOption: {
                    include: {
                        poll: true,
                    },
                },
            },
        });
    }

    async removePollResponse(pollId: string, userId: string) {
        // Find the user's response to this poll
        const existingResponse = await this.prisma.pollResponse.findFirst({
            where: {
                userId,
                pollOption: {
                    pollId,
                },
            },
        });

        if (!existingResponse) {
            throw new NotFoundException(`No poll response found for poll ID ${pollId}`);
        }

        // Check if poll has expired
        const pollOption = await this.prisma.pollOption.findUnique({
            where: { id: existingResponse.pollOptionId },
            include: {
                poll: true,
            },
        });

        if (pollOption && new Date(pollOption.poll.expiresAt) < new Date()) {
            throw new BadRequestException('Poll has expired');
        }

        // Delete the response
        return this.prisma.pollResponse.delete({
            where: {
                id: existingResponse.id,
            },
        });
    }

    async searchTweets(query: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [tweets, total] = await Promise.all([
            this.prisma.tweet.findMany({
                where: {
                    OR: [
                        { content: { contains: query, mode: 'insensitive' } },
                        {
                            hashtags: {
                                some: {
                                    hashtag: {
                                        name: { contains: query, mode: 'insensitive' },
                                    },
                                },
                            },
                        },
                    ],
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                            isVerified: true,
                        },
                    },
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            retweets: true,
                        },
                    },
                    poll: {
                        include: {
                            options: {
                                include: {
                                    _count: {
                                        select: {
                                            responses: true,
                                        },
                                    },
                                },
                            },
                            _count: {
                                select: {
                                    options: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.tweet.count({
                where: {
                    OR: [
                        { content: { contains: query, mode: 'insensitive' } },
                        {
                            hashtags: {
                                some: {
                                    hashtag: {
                                        name: { contains: query, mode: 'insensitive' },
                                    },
                                },
                            },
                        },
                    ],
                },
            }),
        ]);

        return {
            data: tweets,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getTweetsByHashtag(hashtag: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [tweets, total] = await Promise.all([
            this.prisma.tweet.findMany({
                where: {
                    hashtags: {
                        some: {
                            hashtag: {
                                name: hashtag,
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                            isVerified: true,
                        },
                    },
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                            retweets: true,
                        },
                    },
                    poll: {
                        include: {
                            options: {
                                include: {
                                    _count: {
                                        select: {
                                            responses: true,
                                        },
                                    },
                                },
                            },
                            _count: {
                                select: {
                                    options: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.tweet.count({
                where: {
                    hashtags: {
                        some: {
                            hashtag: {
                                name: hashtag,
                            },
                        },
                    },
                },
            }),
        ]);

        return {
            data: tweets,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    private extractHashtags(content: string): string[] {
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);

        if (!matches) {
            return [];
        }

        return matches.map(tag => tag.substring(1).toLowerCase());
    }

    private extractMentions(content: string): string[] {
        const mentionRegex = /@(\w+)/g;
        const matches = content.match(mentionRegex);

        if (!matches) {
            return [];
        }

        return matches.map(mention => mention.substring(1).toLowerCase());
    }
} 