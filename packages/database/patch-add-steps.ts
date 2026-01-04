
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Patching: Adding After Sales Steps & Updating Permissions...');

    // 1. Update Admin KBM Permissions
    const roleId = 'admin_kbm';
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (role) {
        let permissions: any = {};
        try { permissions = JSON.parse(role.permissions || '{}'); } catch (e) { }

        permissions['manage_digital_assets'] = 'edit';

        await prisma.role.update({
            where: { id: roleId },
            data: { permissions: JSON.stringify(permissions) }
        });
        console.log('✅ Updated admin_kbm permissions.');
    }

    // 2. Add Steps to Service Definition
    const serviceId = 'spt_full';
    const newStepsEndpoint = ['send_certificate', 'send_sale_link', 'send_testimony_link'];

    // Get current max order
    const steps = await prisma.serviceStep.findMany({
        where: { serviceId },
        orderBy: { stepOrder: 'asc' }
    });

    let currentOrder = steps.length > 0 ? steps[steps.length - 1].stepOrder : 0;

    for (const stepId of newStepsEndpoint) {
        // Check if exists
        const exists = steps.find(s => s.dataPointId === stepId);
        if (!exists) {
            currentOrder++;
            await prisma.serviceStep.create({
                data: {
                    serviceId,
                    dataPointId: stepId,
                    stepOrder: currentOrder,
                    dependencyRule: null
                }
            });
            console.log(`✅ Added step: ${stepId} at order ${currentOrder}`);
        } else {
            console.log(`ℹ️ Step ${stepId} already exists.`);
        }
    }

    console.log('Patch Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
