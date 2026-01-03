
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Patching permissions for Super Admin...');

    const superAdmin = await prisma.role.findUnique({ where: { id: 'super_admin' } });
    if (!superAdmin) {
        console.error('❌ Super Admin role not found!');
        return;
    }

    let permissions: Record<string, any> = {};
    try {
        permissions = JSON.parse(superAdmin.permissions || '{}');
    } catch (e) {
        console.error('⚠️ Failed to parse JSON, starting fresh');
    }

    // Add new permission
    permissions['manage_system_config'] = 'edit';

    await prisma.role.update({
        where: { id: 'super_admin' },
        data: { permissions: JSON.stringify(permissions) }
    });

    console.log('✅ Permissions updated! "manage_system_config" added to Super Admin.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
