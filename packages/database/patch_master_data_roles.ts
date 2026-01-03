
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Patching MasterData roles...");

    // The mapping of Legacy Name -> Correct ID
    const mapping: Record<string, string> = {
        'Admin Marketing Penerbit KBM': 'marketing_kbm',
        'Admin Marketing External': 'marketing_external',
        'Super Admin': 'super_admin'
    };

    for (const [name, id] of Object.entries(mapping)) {
        const result = await prisma.masterDataPoint.updateMany({
            where: { role: name },
            data: { role: id }
        });
        if (result.count > 0) {
            console.log(`Updated ${result.count} records from '${name}' to '${id}'`);
        }
    }

    console.log("Patch complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
