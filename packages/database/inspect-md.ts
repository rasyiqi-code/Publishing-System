
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- INSPECT MASTER DATA ---');
    const md = await prisma.masterDataPoint.findUnique({
        where: { id: 'isbn_input' }
    });
    console.log(md);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
