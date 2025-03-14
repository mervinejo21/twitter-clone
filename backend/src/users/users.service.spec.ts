import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let prisma: PrismaService;

    const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'hashedpassword',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: null,
        profileImageUrl: null,
        bannerImageUrl: null,
    };

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        follow: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                email: 'new@example.com',
                username: 'newuser',
                password: 'password123',
                displayName: 'New User',
            };

            mockPrismaService.user.findFirst.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
                ...mockUser,
                email: createUserDto.email,
                username: createUserDto.username,
                displayName: createUserDto.displayName,
            });

            const result = await service.create(createUserDto);

            expect(result).toEqual({
                ...mockUser,
                email: createUserDto.email,
                username: createUserDto.username,
                displayName: createUserDto.displayName,
            });
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: createUserDto,
            });
        });

        it('should throw ConflictException if email already exists', async () => {
            const createUserDto: CreateUserDto = {
                email: 'existing@example.com',
                username: 'newuser',
                password: 'password123',
                displayName: 'New User',
            };

            mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-user' });

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [mockUser, { ...mockUser, id: 'user-id-2', username: 'user2' }];
            mockPrismaService.user.findMany.mockResolvedValue(users);
            mockPrismaService.user.count.mockResolvedValue(users.length);

            const result = await service.findAll();

            expect(result).toEqual({
                data: users,
                meta: {
                    total: users.length,
                    page: 1,
                    limit: 10,
                    pages: 1,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findOne('user-id-1');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-id-1' },
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByUsername', () => {
        it('should return a user by username', async () => {
            mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

            const result = await service.findByUsername('testuser');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findFirst.mockResolvedValue(null);

            await expect(service.findByUsername('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto: UpdateUserDto = {
                displayName: 'Updated Name',
                bio: 'Updated bio',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue({
                ...mockUser,
                ...updateUserDto,
            });

            const result = await service.update('user-id-1', updateUserDto);

            expect(result).toEqual({
                ...mockUser,
                ...updateUserDto,
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-id-1' },
                data: updateUserDto,
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.update('nonexistent-id', { bio: 'test' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a user', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.delete.mockResolvedValue(mockUser);

            const result = await service.remove('user-id-1');

            expect(result).toEqual(mockUser);
            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: 'user-id-1' },
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
        });
    });
}); 