import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(() => 'test-token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user object when credentials are valid', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password123');

            const { password, ...expectedUser } = mockUser;
            expect(result).toEqual(expectedUser);
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(service.validateUser('nonexistent@example.com', 'password123'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.validateUser('test@example.com', 'wrongpassword'))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should return user info and access token', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const { password, ...userWithoutPassword } = mockUser;
            jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);

            const result = await service.login(loginDto);

            expect(result).toEqual({
                user: userWithoutPassword,
                access_token: 'test-token',
            });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                username: mockUser.username,
            });
        });
    });

    describe('register', () => {
        it('should create a new user and return user info and access token', async () => {
            const registerDto: RegisterDto = {
                email: 'newuser@example.com',
                username: 'newuser',
                displayName: 'New User',
                password: 'password123',
            };

            const hashedPassword = 'hashedpassword123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const createdUser = {
                ...mockUser,
                email: registerDto.email,
                username: registerDto.username,
                displayName: registerDto.displayName,
                password: hashedPassword,
            };

            (usersService.create as jest.Mock).mockResolvedValue(createdUser);

            const result = await service.register(registerDto);

            const { password, ...userWithoutPassword } = createdUser;
            expect(result).toEqual({
                user: userWithoutPassword,
                access_token: 'test-token',
            });

            expect(usersService.create).toHaveBeenCalledWith({
                ...registerDto,
                password: hashedPassword,
            });

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: createdUser.id,
                email: createdUser.email,
                username: createdUser.username,
            });
        });
    });
}); 