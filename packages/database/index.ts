import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    const client = new PrismaClient();
    // Debug: Log available models to console on creation
    const models = Object.keys(client).filter(key => key !== '_' && !key.startsWith('$'));
    console.log('✅ [Database] Prisma Client Created (Singleton). Models:', models.join(', '));
    return client;
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export * from '@prisma/client';

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
