import { Test, TestingModule } from '@nestjs/testing';
import { TweetsService } from './tweets.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TweetsService', () => {
    let service: TweetsService;
    let prisma: PrismaService;

    const mockTweet = {
        id: 'tweet-id-1',
        content: 'Test tweet content',
        images: [],
        videoUrl: null,
        userId: 'user-id-1',
        retweetId: null,
        replyToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
            id: 'user-id-1',
            username: 'testuser',
            displayName: 'Test User',
            profileImageUrl: null,
            isVerified: false,
        },
        _count: {
            comments: 0,
            likes: 0,
            retweets: 0,
        }
    };

    const mockPrismaService = {
        tweet: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        poll: {
            create: jest.fn(),
        },
        hashtag: {
            upsert: jest.fn(),
        },
        hashtagsOnTweets: {
            create: jest.fn(),
        },
        notification: {
            create: jest.fn(),
        },
        pollOption: {
            findUnique: jest.fn(),
        },
        pollResponse: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        like: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TweetsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<TweetsService>(TweetsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a tweet', async () => {
            const createTweetDto: CreateTweetDto = {
                content: 'Test tweet content',
            };

            mockPrismaService.tweet.create.mockResolvedValue(mockTweet);

            const result = await service.create('user-id-1', createTweetDto);

            expect(result).toEqual(mockTweet);
            expect(prisma.tweet.create).toHaveBeenCalledWith({
                data: {
                    content: createTweetDto.content,
                    images: [],
                    videoUrl: undefined,
                    userId: 'user-id-1',
                    retweetId: undefined,
                    replyToId: undefined,
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
        });

        it('should create a tweet with a poll', async () => {
            const createTweetDto: CreateTweetDto = {
                content: 'Poll tweet',
                poll: {
                    question: 'Favorite programming language?',
                    expiresAt: new Date(Date.now() + 86400000).toISOString(),
                    options: ['JavaScript', 'TypeScript', 'Python'],
                },
            };

            mockPrismaService.tweet.create.mockResolvedValue(mockTweet);
            mockPrismaService.poll.create.mockResolvedValue({
                id: 'poll-id-1',
                question: createTweetDto.poll.question,
                expiresAt: new Date(createTweetDto.poll.expiresAt),
                tweetId: mockTweet.id,
                options: createTweetDto.poll.options.map((option, index) => ({
                    id: `option-id-${index + 1}`,
                    text: option,
                    pollId: 'poll-id-1',
                })),
            });

            const result = await service.create('user-id-1', createTweetDto);

            expect(result).toHaveProperty('poll');
            expect(prisma.poll.create).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of tweets with pagination', async () => {
            const tweets = [mockTweet, { ...mockTweet, id: 'tweet-id-2' }];
            mockPrismaService.tweet.findMany.mockResolvedValue(tweets);
            mockPrismaService.tweet.count.mockResolvedValue(tweets.length);

            const result = await service.findAll(1, 10);

            expect(result).toEqual({
                data: tweets,
                meta: {
                    total: tweets.length,
                    page: 1,
                    limit: 10,
                    pages: 1,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a tweet by id', async () => {
            mockPrismaService.tweet.findUnique.mockResolvedValue(mockTweet);

            const result = await service.findOne('tweet-id-1');

            expect(result).toEqual(mockTweet);
            expect(prisma.tweet.findUnique).toHaveBeenCalled();
        });

        it('should throw NotFoundException if tweet not found', async () => {
            mockPrismaService.tweet.findUnique.mockResolvedValue(null);

            await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('respondToPoll', () => {
        it('should create a poll response', async () => {
            const pollOption = {
                id: 'option-id-1',
                text: 'JavaScript',
                pollId: 'poll-id-1',
                poll: {
                    id: 'poll-id-1',
                    question: 'Favorite programming language?',
                    expiresAt: new Date(Date.now() + 86400000),
                    tweetId: 'tweet-id-1',
                },
            };

            mockPrismaService.pollOption.findUnique.mockResolvedValue(pollOption);
            mockPrismaService.pollResponse.findFirst.mockResolvedValue(null);
            mockPrismaService.pollResponse.create.mockResolvedValue({
                id: 'response-id-1',
                userId: 'user-id-1',
                pollOptionId: 'option-id-1',
                createdAt: new Date(),
                pollOption,
            });

            const result = await service.respondToPoll('option-id-1', 'user-id-1');

            expect(result).toHaveProperty('id', 'response-id-1');
            expect(prisma.pollResponse.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if poll has expired', async () => {
            const pollOption = {
                id: 'option-id-1',
                text: 'JavaScript',
                pollId: 'poll-id-1',
                poll: {
                    id: 'poll-id-1',
                    question: 'Favorite programming language?',
                    expiresAt: new Date(Date.now() - 86400000), // Past date
                    tweetId: 'tweet-id-1',
                },
            };

            mockPrismaService.pollOption.findUnique.mockResolvedValue(pollOption);

            await expect(service.respondToPoll('option-id-1', 'user-id-1')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if user already responded', async () => {
            const pollOption = {
                id: 'option-id-1',
                text: 'JavaScript',
                pollId: 'poll-id-1',
                poll: {
                    id: 'poll-id-1',
                    question: 'Favorite programming language?',
                    expiresAt: new Date(Date.now() + 86400000),
                    tweetId: 'tweet-id-1',
                },
            };

            mockPrismaService.pollOption.findUnique.mockResolvedValue(pollOption);
            mockPrismaService.pollResponse.findFirst.mockResolvedValue({
                id: 'existing-response',
            });

            await expect(service.respondToPoll('option-id-1', 'user-id-1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('likeTweet', () => {
        it('should like a tweet', async () => {
            mockPrismaService.tweet.findUnique.mockResolvedValue(mockTweet);
            mockPrismaService.like.findUnique.mockResolvedValue(null);
            mockPrismaService.like.create.mockResolvedValue({
                id: 'like-id-1',
                userId: 'user-id-1',
                tweetId: 'tweet-id-1',
                createdAt: new Date(),
            });

            const result = await service.likeTweet('tweet-id-1', 'user-id-1');

            expect(result).toHaveProperty('id', 'like-id-1');
            expect(prisma.like.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if tweet already liked', async () => {
            mockPrismaService.tweet.findUnique.mockResolvedValue(mockTweet);
            mockPrismaService.like.findUnique.mockResolvedValue({
                id: 'existing-like',
            });

            await expect(service.likeTweet('tweet-id-1', 'user-id-1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('unlikeTweet', () => {
        it('should unlike a tweet', async () => {
            mockPrismaService.tweet.findUnique.mockResolvedValue(mockTweet);
            mockPrismaService.like.findUnique.mockResolvedValue({
                id: 'like-id-1',
            });
            mockPrismaService.like.delete.mockResolvedValue({
                id: 'like-id-1',
            });

            const result = await service.unlikeTweet('tweet-id-1', 'user-id-1');

            expect(result).toHaveProperty('id', 'like-id-1');
            expect(prisma.like.delete).toHaveBeenCalled();
        });

        it('should throw BadRequestException if tweet not liked', async () => {
            mockPrismaService.tweet.findUnique.mockResolvedValue(mockTweet);
            mockPrismaService.like.findUnique.mockResolvedValue(null);

            await expect(service.unlikeTweet('tweet-id-1', 'user-id-1')).rejects.toThrow(BadRequestException);
        });
    });
}); 