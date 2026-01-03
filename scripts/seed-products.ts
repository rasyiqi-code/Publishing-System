
import { PrismaClient } from '@repo/database';

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
            category: 'package',
            features: JSON.stringify(['Layout', '2 Pilihan Cover', 'Mock Up Promosi', '50 Eksemplar', 'ISBN/QRCBN']),
            description: 'Paket best seller untuk penulis pemula.'
        },
        {
            name: 'Paket Nusantara',
            price: 500000,
            category: 'package',
            features: JSON.stringify(['Layout', '1 Cover Model', '5 Eksemplar', 'ISBN/QRCBN']),
            description: 'Paket ekonomis untuk tes pasar.'
        },
        {
            name: 'Paket Samudera Pasai',
            price: 7500000,
            category: 'package',
            features: JSON.stringify(['300 Eksemplar', 'Hard Cover', 'Royalty 25%', 'Distribusi Nasional']),
            description: 'Paket premium untuk penulis serius.'
        },
        {
            name: 'Jasa Cover',
            price: 125000,
            category: 'single_service',
            features: JSON.stringify(['1 Pilihan Cover', 'Revisi 2x', 'File HD']),
            description: 'Desain cover profesional.'
        }
    ];

    for (const pkg of packages) {
        await prisma.product.create({
            data: {
                ...pkg,
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
