import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';

describe('DTO Validation', () => {
    describe('RegisterDto', () => {
        it('should validate a correct register dto', async () => {
            const dto = plainToInstance(RegisterDto, {
                email: 'test@example.com',
                username: 'testuser',
                displayName: 'Test User',
                password: 'password123',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid email', async () => {
            const dto = plainToInstance(RegisterDto, {
                email: 'not-an-email',
                username: 'testuser',
                password: 'password123',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('email');
        });

        it('should fail with invalid username format', async () => {
            const dto = plainToInstance(RegisterDto, {
                email: 'test@example.com',
                username: 'invalid username with spaces!',
                password: 'password123',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('username');
        });

        it('should fail with short password', async () => {
            const dto = plainToInstance(RegisterDto, {
                email: 'test@example.com',
                username: 'testuser',
                password: 'short',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('password');
        });

        it('should pass without displayName (optional)', async () => {
            const dto = plainToInstance(RegisterDto, {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('LoginDto', () => {
        it('should validate a correct login dto', async () => {
            const dto = plainToInstance(LoginDto, {
                email: 'test@example.com',
                password: 'password123',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid email', async () => {
            const dto = plainToInstance(LoginDto, {
                email: 'not-an-email',
                password: 'password123',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('email');
        });

        it('should fail with missing password', async () => {
            const dto = plainToInstance(LoginDto, {
                email: 'test@example.com',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('password');
        });

        it('should fail with short password', async () => {
            const dto = plainToInstance(LoginDto, {
                email: 'test@example.com',
                password: 'short',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('password');
        });
    });
}); 