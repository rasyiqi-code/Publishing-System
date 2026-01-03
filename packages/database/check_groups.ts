
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking distinct Master Data groups...');
    const result = await prisma.masterDataPoint.findMany({
        select: { group: true },
        distinct: ['group']
    });
    console.log('Found groups:', result.map(g => g.group));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
