
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Migrating Categories...');

    // 1. Create Default Categories
    const catPackages = await prisma.productCategory.upsert({
        where: { slug: 'paket_penerbitan' },
        update: {},
        create: {
            name: 'Paket Penerbitan Lengkap',
            slug: 'paket_penerbitan',
            description: 'Solusi lengkap dari naskah mentah hingga buku jadi.',
            order: 1
        }
    });
    console.log('Category Package:', catPackages.id);

    const catSingles = await prisma.productCategory.upsert({
        where: { slug: 'jasa_satuan' },
        update: {},
        create: {
            name: 'Jasa Satuan & Add-on',
            slug: 'jasa_satuan',
            description: 'Layanan terpisah sesuai kebutuhan spesifik Anda.',
            order: 2
        }
    });
    console.log('Category Single:', catSingles.id);

    // 2. Migrate Existing Products
    const products = await prisma.product.findMany();
    for (const p of products) {
        let targetCatId = null;
        if (p.category === 'package') targetCatId = catPackages.id;
        if (p.category === 'single_service') targetCatId = catSingles.id;

        if (targetCatId) {
            await prisma.product.update({
                where: { id: p.id },
                data: { categoryId: targetCatId }
            });
            console.log(`Migrated Product ${p.name} -> ${targetCatId}`);
        }
    }

    console.log('Migration Complete');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
