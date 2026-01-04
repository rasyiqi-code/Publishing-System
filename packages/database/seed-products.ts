
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Products...');

    // Ensure a default service exists
    let service = await prisma.serviceDefinition.findFirst({
        where: { id: 'penerbitan_standar' }
    });

    if (!service) {
        service = await prisma.serviceDefinition.create({
            data: {
                id: 'penerbitan_standar',
                name: 'Standard Publishing Flow',
                uiMode: 'timeline'
            }
        });
        console.log('Created default service:', service.id);
    }

    const packages = [
        {
            name: 'Paket Majapahit',
            price: 2250000,
            // @ts-ignore
            category: 'package', // Note: Check schema if this is still valid field or relation
            features: JSON.stringify(['Layout', '2 Pilihan Cover', 'Mock Up Promosi', '50 Eksemplar', 'ISBN/QRCBN']),
            description: 'Paket best seller untuk penulis pemula.'
        },
        {
            name: 'Paket Nusantara',
            price: 500000,
            // @ts-ignore
            category: 'package',
            features: JSON.stringify(['Layout', '1 Cover Model', '5 Eksemplar', 'ISBN/QRCBN']),
            description: 'Paket ekonomis untuk tes pasar.'
        },
        {
            name: 'Paket Samudera Pasai',
            price: 7500000,
            // @ts-ignore
            category: 'package',
            features: JSON.stringify(['300 Eksemplar', 'Hard Cover', 'Royalty 25%', 'Distribusi Nasional']),
            description: 'Paket premium untuk penulis serius.'
        },
        {
            name: 'Jasa Cover',
            price: 125000,
            // @ts-ignore
            category: 'single_service',
            features: JSON.stringify(['1 Pilihan Cover', 'Revisi 2x', 'File HD']),
            description: 'Desain cover profesional.'
        }
    ];

    for (const pkg of packages) {
        /* 
           Note: 'category' field in Product model was commented as Legacy in schema.
           Ensure schema supports it or you need to use categoryId relation.
           Assuming legacy support for now based on previous schema view.
        */
        await prisma.product.create({
            data: {
                name: pkg.name,
                price: pkg.price,
                features: pkg.features,
                description: pkg.description,
                serviceId: service.id,
                isActive: true
            }
        });
        console.log(`Created product: ${pkg.name}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
