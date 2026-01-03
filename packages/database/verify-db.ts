
import { PrismaClient } from '@prisma/client';
import { generateProjectViewModel } from '../../packages/features/timeline/src/engine';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Real Database Data & Engine ---");

    // 1. Fetch Project
    const projectId = 'SPT-2025-001';
    console.log(`Fetching ${projectId}...`);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
            logs: true,
            author: true
        }
    });

    if (!project) {
        console.error("❌ Project not found in DB! Did seeding work?");
        return;
    }
    console.log(`Found project: ${project.title} (Service: ${project.serviceId})`);

    // 2. Fetch Master Data
    const masterDataPoints = await prisma.masterDataPoint.findMany();
    const masterDataMap = masterDataPoints.reduce((acc: any, curr: any) => ({
        ...acc,
        [curr.id]: curr
    }), {});
    console.log(`Loaded ${masterDataPoints.length} master data points.`);

    // 3. Prepare Engine Inputs
    const servicesMap = {
        [project.service.id]: {
            ...project.service,
            steps: project.service.steps.map((s: any) => ({
                id: s.dataPointId,
                dependencyRule: s.dependencyRule
            }))
        }
    };

    const logsMap = project.logs.reduce((acc: any, log: any) => ({
        ...acc,
        [log.dataPointId]: log
    }), {});

    // 4. Run Engine
    console.log("Running Engine...");
    const viewModel = generateProjectViewModel(
        { ...project, logs: logsMap, currentStepId: null },
        servicesMap as any,
        masterDataMap
    );

    const layoutStep = viewModel?.steps.find((s: any) => s.id === 'layout_draft');

    console.log(`Step [layout_draft] Status: ${layoutStep?.status}`);
    console.log(`Step [layout_draft] Locked: ${layoutStep?.isLocked}`);
    console.log(`Step [layout_draft] Reason: ${layoutStep?.lockReason}`);

    if (layoutStep?.isLocked === false || layoutStep?.status === 'active') {
        console.log("✅ SUCCESS: Engine works with Real DB Data!");
    } else {
        console.log("❌ FAILURE: Step is locked unexpectedly.");
    }

    await prisma.$disconnect();
}

main().catch(console.error);
