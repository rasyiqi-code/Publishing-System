
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Patching: Restoring ACC Permissions...');

    const rolesToPatch = ['admin_kbm', 'marketing_kbm'];

    for (const roleId of rolesToPatch) {
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (role) {
            let permissions: any = {};
            try { permissions = JSON.parse(role.permissions || '{}'); } catch (e) { }

            permissions['approve_creative'] = 'edit';

            await prisma.role.update({
                where: { id: roleId },
                data: { permissions: JSON.stringify(permissions) }
            });
            console.log(`✅ Granted 'approve_creative' to ${roleId}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
