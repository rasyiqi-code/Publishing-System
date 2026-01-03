
import { prisma } from '../packages/database';

async function verify() {
    console.log('Verifying Categories...');

    const categories = await prisma.productCategory.findMany({
        include: { products: true }
    });

    console.log(`Found ${categories.length} categories.`);

    for (const cat of categories) {
        console.log(`- ${cat.name} (${cat.slug}): ${cat.products.length} products`);
    }

    // Check product link
    const product = await prisma.product.findFirst({
        where: { categoryId: { not: null } }
    });

    if (product) {
        console.log(`Verified Product Link: ${product.name} -> Category ID ${product.categoryId}`);
    } else {
        console.log('No linked products found (might be empty DB).');
    }
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
