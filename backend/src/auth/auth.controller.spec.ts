import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: null,
        profileImageUrl: null,
        bannerImageUrl: null,
    };

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                username: 'testuser',
                displayName: 'Test User',
                password: 'password123',
            };

            const expected = {
                user: mockUser,
                access_token: 'jwt-token'
            };

            mockAuthService.register.mockResolvedValue(expected);

            const result = await controller.register(registerDto);

            expect(result).toEqual(expected);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should login a user', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const expected = {
                user: mockUser,
                access_token: 'jwt-token'
            };

            mockAuthService.login.mockResolvedValue(expected);

            const result = await controller.login(loginDto);

            expect(result).toEqual(expected);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('getProfile', () => {
        it('should return the user profile', () => {
            const req = { user: mockUser };

            const result = controller.getProfile(req);

            expect(result).toEqual(mockUser);
        });
    });
}); 