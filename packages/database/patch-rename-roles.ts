
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RENAMING ROLES ---');

    // 1. Rename admin_kbm FIRST to free up the name
    await prisma.role.update({
        where: { id: 'admin_kbm' },
        data: { name: 'Klien Validator' }
    });
    console.log('✅ Renamed admin_kbm -> Klien Validator');

    // 2. Rename marketing_kbm
    await prisma.role.update({
        where: { id: 'marketing_kbm' },
        data: { name: 'Admin Penerbit KBM' }
    });
    console.log('✅ Renamed marketing_kbm -> Admin Penerbit KBM');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
