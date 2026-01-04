
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Patching: Integrating Layouter Role Steps...');

    // 1. Create Master Data
    const newMasterData = [
        { id: 'assign_to_layouter', label: 'Assign ke Layouter', role: 'layout_coordinator', group: 'production', requiredPermission: 'manage_creative_flow' },
        { id: 'submit_layout_work', label: 'Submit Hasil Layout', role: 'layouter', group: 'production', requiredPermission: 'submit_draft' }
    ];

    for (const md of newMasterData) {
        await prisma.masterDataPoint.upsert({
            where: { id: md.id },
            update: md,
            create: md
        });
        console.log(`✅ Upserted Master Data: ${md.id}`);
    }

    // 2. Shift Existing Steps in SPT Full
    const serviceId = 'spt_full';
    const INSERT_AT_ORDER = 5; // insert after assign_layout (4)
    const SHIFT_AMOUNT = 2;

    // Use raw query or manual update loop (loop safer for prisma without raw SQL)
    // Best to loop reverse to avoid collissions if unique constraint exists on (serviceId, stepOrder)
    // Actually, unique on (serviceId, dataPointId) usually. Let's check schema.
    // Schema says: @@unique([serviceId, stepOrder]) usually?
    // Let's check schema first implicitly by assuming we need to be careful.

    // Fetch all steps >= 5 sorted DESC
    const stepsToShift = await prisma.serviceStep.findMany({
        where: {
            serviceId,
            stepOrder: { gte: INSERT_AT_ORDER }
        },
        orderBy: { stepOrder: 'desc' }
    });

    console.log(`Shifting ${stepsToShift.length} steps to make room...`);

    for (const step of stepsToShift) {
        await prisma.serviceStep.update({
            where: { id: step.id },
            data: { stepOrder: step.stepOrder + SHIFT_AMOUNT }
        });
        console.log(`-> Shifted ${step.dataPointId} to ${step.stepOrder + SHIFT_AMOUNT}`);
    }

    // 3. Insert New Steps
    const newSteps = [
        { id: 'assign_to_layouter', order: 5, rule: null },
        { id: 'submit_layout_work', order: 6, rule: null }
    ];

    for (const step of newSteps) {
        await prisma.serviceStep.create({
            data: {
                serviceId,
                dataPointId: step.id,
                stepOrder: step.order,
                dependencyRule: step.rule
            }
        });
        console.log(`✅ Inserted Step: ${step.id} at ${step.order}`);
    }

    console.log('Integration Complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
