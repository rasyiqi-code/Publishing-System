
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Patching Layouter Permissions...');

    // Target Role: layouter
    const roleId = 'layouter';
    const role = await prisma.role.findUnique({
        where: { id: roleId }
    });

    if (!role) {
        console.error(`Role ${roleId} not found!`);
        return;
    }

    let permissions: any = {};
    try {
        permissions = JSON.parse(role.permissions || '{}');
    } catch (e) {
        console.error("Error parsing permissions", e);
    }

    // Add Segment View Permissions
    const newPermissions = {
        ...permissions,
        'view_segment_institutional': 'view',
        'view_segment_general': 'view'
    };

    await prisma.role.update({
        where: { id: roleId },
        data: { permissions: JSON.stringify(newPermissions) }
    });

    console.log(`Updated ${roleId} permissions:`, JSON.stringify(newPermissions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
