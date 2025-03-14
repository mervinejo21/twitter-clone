import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

describe('PrismaService', () => {
    let service: PrismaService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrismaService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to the database', async () => {
            const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

            await service.onModuleInit();

            expect(connectSpy).toHaveBeenCalled();
        });
    });

    describe('onModuleDestroy', () => {
        it('should disconnect from the database', async () => {
            const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

            await service.onModuleDestroy();

            expect(disconnectSpy).toHaveBeenCalled();
        });
    });
}); 