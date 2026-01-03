'use server'

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateStepStatus(projectId: string, stepId: string, status: string, value?: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    // 1. Fetch Project with Logs and Service
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            logs: true,
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } } // Need service to know order
        }
    });

    if (!project || !project.service) throw new Error("Project Invalid");

    // 2. Role Check
    const targetStepDef = project.service.steps.find(s => s.dataPointId === stepId);
    if (!targetStepDef) throw new Error("Step not found in service");

    // Fetch DataPoint to get the Role
    const dataPoint = await prisma.masterDataPoint.findUnique({ where: { id: stepId } });
    if (!dataPoint) throw new Error("Master Data corrupt");

    // Role Check
    const userRoleId = session.user.role?.id;
    if (userRoleId !== 'admin' && userRoleId !== 'super_admin' && userRoleId !== dataPoint.role) {
        throw new Error(`Unauthorized: This step requires role '${dataPoint.role}'`);
    }

    // 3. Dynamic Gating Check (Rule Engine)
    const ruleJson = targetStepDef.dependencyRule;
    let isLocked = false;
    let lockReason = "";

    if (ruleJson) {
        // A. Parse Lock Rule
        try {
            const rule = JSON.parse(ruleJson);
            if (rule.required) {
                // Check if the REQUIRED step is completed
                const requiredLog = project.logs.find((l: any) => l.dataPointId === rule.required);
                if (!requiredLog || requiredLog.status !== 'completed') {
                    isLocked = true;
                    // Try to find label for better error message
                    const requiredStep = project.service.steps.find((s: any) => s.dataPointId === rule.required);
                    // We might need to fetch MasterData label if not available in project.service.steps relation 
                    // (but usually dataPoint relation is not included in this deep nested query unless we asked)
                    // Let's assume we can just show the ID or generic message for now. 
                    // Better: Fetch label implicitly or just generic.
                    lockReason = `Step ini terkunci. Pastikan tahap sebelumnya (${rule.required}) sudah selesai.`;
                }
            }
        } catch (e) {
            console.error("Failed to parse dependency rule", e);
            // Fallback to sequential if rule is corrupt? Or strict fail? 
            // Let's fail safe: Block it.
            isLocked = true;
            lockReason = "System Error: Dependency Rule Validation Failed.";
        }
    } else {
        // B. Fallback: Strict Sequential (Legacy)
        // Only if NO rule is defined, we enforce strict 1-2-3 sequence.
        // This maintains backward compatibility.
        const previousSteps = project.service.steps.filter((s: any) => s.stepOrder < targetStepDef.stepOrder);
        const allPreviousCompleted = previousSteps.every((s: any) => {
            const log = project.logs.find((l: any) => l.dataPointId === s.dataPointId);
            return log?.status === 'completed';
        });
        if (!allPreviousCompleted) {
            isLocked = true;
            lockReason = "Mohon selesaikan tahap sebelumnya secara berurutan.";
        }
    }

    if (isLocked) {
        throw new Error(`Action Locked: ${lockReason}`);
    }

    // 4. Update Status
    // 4. Update Status
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await prisma.projectLog.upsert({
        where: { projectId_dataPointId: { projectId, dataPointId: stepId } },
        create: { projectId, dataPointId: stepId, status, value: value || today },
        update: { status, value: value || today }
    });

    // 5. Activate NEXT step & Notify
    if (status === 'completed') {
        const nextStep = project.service.steps.find((s: any) => s.stepOrder === targetStepDef.stepOrder + 1);
        if (nextStep) {
            // A. Activate Step
            await prisma.projectLog.upsert({
                where: { projectId_dataPointId: { projectId, dataPointId: nextStep.dataPointId } },
                create: { projectId, dataPointId: nextStep.dataPointId, status: 'active', value: 'active' },
                update: { status: 'active', value: 'active' }
            });

            // B. Send Notification to next role
            try {
                // Get role name for next step from MasterData
                const nextStepDataPoint = await prisma.masterDataPoint.findUnique({ where: { id: nextStep.dataPointId } });

                if (nextStepDataPoint) {
                    const nextRoleName = nextStepDataPoint.role;

                    // Find users with this role (We search by ID now as per fix)
                    // Wait, masterData.role stores the Role ID (e.g. 'finance'), correct?
                    // Let's check seed.ts... yes, masterData role stores 'marketing_kbm', 'finance', etc.
                    // The Role Model ID is 'marketing_kbm', 'finance'.
                    // So we should search where: { role: { id: nextRoleName } }
                    const usersToNotify = await prisma.user.findMany({
                        where: { role: { id: nextRoleName } },
                        include: { pushSubscriptions: true }
                    });

                    // Prepare Notification
                    const title = `Antrian Baru: ${project.title}`;
                    const message = `Project ${project.title} siap untuk tahap: ${nextStepDataPoint.label}`;
                    const url = `/project/${projectId}`;

                    // Send to all eligible users
                    const notificationPromises = usersToNotify.map(async (user) => {
                        // 1. In-App
                        await prisma.notification.create({
                            data: { userId: user.id, title, message, link: url }
                        });

                        // 2. Web Push
                        if (user.pushSubscriptions.length > 0) {
                            const payload = JSON.stringify({ title, body: message, url });
                            const webpush = require('web-push'); // Dynamic import to avoid build issues if not used elsewhere

                            // Config (Same as in route.ts - ideally centralized)
                            const publicVapidKey = 'BMrFAwWMmKmcOk_LFGnTdilXQxBh9_M7tKNmNu2gvXRGHq_MuZid5Ne6nS16trCGfcj3lwTLmI3MBYdwvwt51xc';
                            const privateVapidKey = 'xtVRtRAwZfpRXNXyhK38LUN_j1mGdLWhpJVWeI38D48';

                            webpush.setVapidDetails(
                                'mailto:admin@spt.com',
                                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || publicVapidKey,
                                process.env.VAPID_PRIVATE_KEY || privateVapidKey
                            );

                            for (const sub of user.pushSubscriptions) {
                                try {
                                    await webpush.sendNotification({
                                        endpoint: sub.endpoint,
                                        keys: { p256dh: sub.p256dh, auth: sub.auth }
                                    }, payload);
                                } catch (error: any) {
                                    if (error.statusCode === 410) {
                                        await prisma.pushSubscription.delete({ where: { id: sub.id } });
                                    } else {
                                        console.error('Push failed', error);
                                    }
                                }
                            }
                        }
                    });

                    await Promise.all(notificationPromises);
                }
            } catch (err) {
                console.error("Notification failed", err);
                // Don't block the main action
            }
        }
    }

    revalidatePath('/'); // Refresh the dashboard/detail
    return { success: true };
}

export async function createProject(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const title = formData.get('title') as string;
    const authorName = formData.get('authorName') as string; // Simple string for now, or ID if we have a picker
    const serviceId = formData.get('serviceId') as string;
    const publisher = formData.get('publisher') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 0;

    // 1. Get the Service Recipe
    const service = await prisma.serviceDefinition.findUnique({
        where: { id: serviceId },
        include: { steps: { orderBy: { stepOrder: 'asc' } } }
    });

    if (!service) throw new Error("Service not found");

    // 2. Validate User Role vs Category
    const userRoleId = session.user.role?.id;
    const isSuperAdmin = userRoleId === 'super_admin';
    const isMarketingKBM = userRoleId === 'marketing_kbm';
    const isMarketingUmum = userRoleId === 'marketing_external';

    if (!isSuperAdmin && !isMarketingKBM && !isMarketingUmum) {
        throw new Error("Unauthorized: Only Marketing or Super Admin can create projects.");
    }

    // Determine Category
    let category = 'umum';
    if (isMarketingKBM) category = 'kbm';
    if (isMarketingUmum) category = 'umum';
    if (isSuperAdmin) {
        // Default or could be passed from form if we had a field. For now default to 'umum' or infer from something else.
        category = 'kbm'; // Let Super Admin create KBM by default for tests
    }

    // 3. Create Project
    const projectId = `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`; // Simple ID gen

    // Determine Author ID if possible (for now assume the creator is the author if role matches, else just string)
    // For MVP, we'll just store the string name or link to current user if they are author.
    // Let's keep it flexible: Admin creates for someone else.

    await prisma.project.create({
        data: {
            id: projectId,
            title,
            authorName,
            // authorId: ... (Feature for later: User Picker)
            serviceId,
            status: 'active',
            publisher,
            category,
            quantity,
            logs: {
                create: service.steps.map((step: any, index: number) => ({
                    dataPointId: step.dataPointId,
                    status: index === 0 ? 'active' : 'pending', // First step active, others pending
                    value: index === 0 ? 'active' : 'pending'
                }))
            }
        }
    });

    revalidatePath('/');
    redirect(`/project/${projectId}`);
}
