
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Patching Coordinator Permissions...');

    // Target Role: layout_coordinator
    const roleId = 'layout_coordinator';
    const role = await prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
        console.error(`Role ${roleId} not found!`);
        return;
    }

    let permissions: any = {};
    try {
        permissions = JSON.parse(role.permissions || '{}');
    } catch (e) {
        console.error('Json parse error', e);
    }

    // Add Segment View Permissions
    // This allows the coordinator to see projects even when not actively assigned (Monitoring)
    const newPermissions = {
        ...permissions,
        'view_segment_institutional': 'view', // [FIX] Matches ClientSegment table
        'view_segment_general': 'view',
        // 'view_segment_penulis' maps to institutional in DB, but let's keep it clean
    };

    await prisma.role.update({
        where: { id: roleId },
        data: {
            permissions: JSON.stringify(newPermissions)
        }
    });

    console.log(`Updated ${roleId} permissions:`, JSON.stringify(newPermissions, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
