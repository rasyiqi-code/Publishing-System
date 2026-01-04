
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- FIXING MISSING LOGS ---');

    // 1. Get all active projects
    const projects = await prisma.project.findMany({
        include: {
            logs: true,
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } }
        }
    });

    for (const project of projects) {
        console.log(`Checking Project: ${project.id}`);

        // Find the "Furthest" step (Max Order with a log)
        const loggedStepIds = project.logs.map(l => l.dataPointId);
        const loggedSteps = project.service.steps.filter(s => loggedStepIds.includes(s.dataPointId));

        if (loggedSteps.length === 0) continue;

        const maxOrder = Math.max(...loggedSteps.map(s => s.stepOrder));
        console.log(`Max Completed Order: ${maxOrder}`);

        // Find missing steps with order < maxOrder
        const missingSteps = project.service.steps.filter(s =>
            s.stepOrder < maxOrder &&
            !loggedStepIds.includes(s.dataPointId)
        );

        if (missingSteps.length > 0) {
            console.log(`Found ${missingSteps.length} skipped steps: ${missingSteps.map(s => s.dataPointId).join(', ')}`);

            // Backfill them
            for (const step of missingSteps) {
                await prisma.projectLog.create({
                    data: {
                        projectId: project.id,
                        dataPointId: step.dataPointId,
                        status: 'completed',
                        value: 'System Backfill (Migration)'
                    }
                });
                console.log(`✅ Backfilled: ${step.dataPointId}`);
            }
        } else {
            console.log('Sequence is intact.');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
