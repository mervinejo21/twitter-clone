import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        // Only for development and testing
        const models = Reflect.ownKeys(this).filter(
            (key) => key[0] !== '_' && key[0] !== '$' && key !== 'engine',
        );

        return Promise.all(
            models.map((modelKey) => this[modelKey as string].deleteMany()),
        );
    }
} 