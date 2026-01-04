
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- REPRODUCING LOCK ---');

    // Simulate updateStepStatus params
    const projectId = 'SPT-KBM-001';
    const stepId = 'client_acc'; // Target Step

    // Fetch Project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            logs: true,
            service: {
                include: { steps: true }
            }
        }
    });

    if (!project) throw new Error("Project not found");

    const targetStepDef = project.service.steps.find(s => s.dataPointId === stepId);
    if (!targetStepDef) throw new Error("Step not found in service");

    console.log(`Target Step: ${stepId} (Order: ${targetStepDef.stepOrder})`);

    // Logic Copy-Paste from actions.ts
    const previousSteps = project.service.steps.filter((s: any) => s.stepOrder < targetStepDef.stepOrder);

    console.log(`Found ${previousSteps.length} previous steps.`);

    const allPreviousCompleted = previousSteps.every((s: any) => {
        const log = project.logs.find((l: any) => l.dataPointId === s.dataPointId);
        const isComplete = log?.status === 'completed';

        console.log(`- Checking ${s.dataPointId} (Order ${s.stepOrder}): ${isComplete ? '✅' : '❌'}`);

        return isComplete;
    });

    if (!allPreviousCompleted) {
        console.log("RESULT: LOCKED 🔒");
    } else {
        console.log("RESULT: UNLOCKED 🔓");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
