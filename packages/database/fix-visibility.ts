
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing Project Visibility...');

    // 1. Get all active projects with their logs
    const projects = await prisma.project.findMany({
        where: { status: 'active' },
        include: {
            logs: true,
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } }
        }
    });

    console.log(`Found ${projects.length} active projects.`);

    for (const project of projects) {
        // Find the "Active" step (latest log with status 'active' OR last completed + 1)
        // Usually, we have a log with status='active'.
        const activeLog = project.logs.find(l => l.status === 'active');

        // If no explicit active log, find the last completed and assume next is active
        let currentStepId = activeLog?.dataPointId;

        if (!currentStepId) {
            // Find last completed
            // Sort logs by... we don't have timestamp in logs? Yes we should. updatedAt.
            // But checking stepOrder using service def is safer.
            // Map logs to steps
            const completedStepIds = project.logs.filter(l => l.status === 'completed').map(l => l.dataPointId);

            // Find the highest order step that is completed
            const completedSteps = project.service.steps.filter(s => completedStepIds.includes(s.dataPointId));
            const lastCompletedStep = completedSteps.sort((a, b) => b.stepOrder - a.stepOrder)[0];

            if (lastCompletedStep) {
                // Next step is active
                const nextStep = project.service.steps.find(s => s.stepOrder === lastCompletedStep.stepOrder + 1);
                currentStepId = nextStep?.dataPointId;
            } else {
                // No completed steps? First step is active.
                currentStepId = project.service.steps[0]?.dataPointId;
            }
        }

        if (currentStepId) {
            // Get Master Data to find the Role
            const masterData = await prisma.masterDataPoint.findUnique({ where: { id: currentStepId } });

            if (masterData && masterData.role) {
                // Update managedBy
                await prisma.project.update({
                    where: { id: project.id },
                    data: { managedBy: masterData.role }
                });
                console.log(`Project ${project.id}: Set managedBy = ${masterData.role} (Step: ${masterData.label})`);
            } else {
                console.warn(`Project ${project.id}: Role not found for step ${currentStepId}`);
            }
        } else {
            console.warn(`Project ${project.id}: Could not determine active step.`);
        }
    }

    console.log('Visibility Fix Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
