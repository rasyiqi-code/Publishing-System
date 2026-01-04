'use server'

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLIENT_SEGMENT_CODES, SYSTEM_ROLES } from "../lib/constants";

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



    // Auth Check
    const sessionEmail = session.user.email;
    if (!sessionEmail) throw new Error("No Email in Session");

    // [SECURITY] Fetch Fresh User Data from DB (Don't trust Stale Session)
    const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
        include: { role: true }
    });

    const userRoleId = user?.roleId;

    // Parse User Permissions from DB
    let userPermissions: Record<string, string> = {};
    if (user?.role?.permissions) {
        try {
            userPermissions = typeof user.role.permissions === 'string'
                ? JSON.parse(user.role.permissions)
                : user.role.permissions;
        } catch (e) {
            console.error("Permission Parse Error", e);
        }
    }

    // 1. Check Capability (Preferred)
    if (dataPoint.requiredPermission) {
        console.log('[DEBUG] Checking Permission:', {
            required: dataPoint.requiredPermission,
            userRole: userRoleId,
            userPermissions: userPermissions,
            hasPermissionKey: !!userPermissions[dataPoint.requiredPermission],
            value: userPermissions[dataPoint.requiredPermission]
        });

        const hasCapability = userPermissions[dataPoint.requiredPermission] === 'edit' || userPermissions[dataPoint.requiredPermission] === 'view';
        // Note: Usually we require 'edit' to update status, but logic might vary. 
        // For 'updateStepStatus', 'edit' is implied necessary.
        const canEdit = userPermissions[dataPoint.requiredPermission] === 'edit';

        if (!canEdit && userRoleId !== SYSTEM_ROLES.SUPER_ADMIN) {
            throw new Error(`Unauthorized: You need permission '${dataPoint.requiredPermission}' (edit) to perform this action.`);
        }
    }
    // 2. Legacy Fallback (Role Match)
    else {
        if (userRoleId !== SYSTEM_ROLES.ADMIN && userRoleId !== SYSTEM_ROLES.SUPER_ADMIN && userRoleId !== dataPoint.role) {
            throw new Error(`Unauthorized (Legacy): This step requires role '${dataPoint.role}'`);
        }
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
            const isComplete = log?.status === 'completed';

            if (!isComplete) {
                console.log(`[ACTION BLOCKED] Missing Step: ${s.dataPointId} (Order: ${s.stepOrder})`);
                console.log(`[DEBUG] Current Step: ${stepId} (Order: ${targetStepDef.stepOrder})`);
            }
            return isComplete;
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

                    // [FIX] Update Project 'managedBy' for Dashboard Visibility
                    await prisma.project.update({
                        where: { id: projectId },
                        data: { managedBy: nextRoleName }
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

    // 2. Access Control (Permission Based)
    console.log('[DEBUG] Session User:', JSON.stringify(session.user, null, 2));

    let userRoleId = session.user.role?.id;

    // Fallback: If session is stale and missing roleId, fetch from DB using email
    if (!userRoleId && session.user?.email) {
        console.log('[DEBUG] Role ID missing in session, fetching from DB...');
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { roleId: true }
        });
        userRoleId = user?.roleId || undefined;
    }

    if (!userRoleId) {
        console.error('[DEBUG] Role ID still missing after DB fetch.');
        throw new Error("Unauthorized: No Role Assigned to User");
    }

    const userRole = await prisma.role.findUnique({
        where: { id: userRoleId }
    });

    if (!userRole) throw new Error("Unauthorized: Invalid Role");

    let hasPermission = false;
    try {
        const permissions = JSON.parse(userRole.permissions || '{}');
        if (permissions['manage_order'] === 'edit') {
            hasPermission = true;
        }
    } catch (e) {
        console.error("Failed to parse role permissions", e);
    }

    // Fallback for hardcoded system admins if DB permissions fail or are empty
    if (userRoleId === SYSTEM_ROLES.SUPER_ADMIN) hasPermission = true;

    if (!hasPermission) {
        throw new Error(`Unauthorized (Role: ${userRole.name}): You do not have 'manage_order' (edit) permission required to create projects.`);
    }

    // Determine Category Logic based on Role ID (still necessary for business logic, not access control)
    // REMOVED INFERENCE: Now we trust the Admin's input from the form, since they have permission to create.
    let category = formData.get('category') as string;

    // Validate against Dynamic Segments
    if (category) {
        const validSegment = await prisma.clientSegment.findUnique({ where: { code: category } });
        if (!validSegment) category = ''; // Invalid, force fallback
    }

    if (!category) {
        // Fallback to first available segment or default 'umum'
        const defaultSegment = await prisma.clientSegment.findFirst({ orderBy: { order: 'asc' } });
        category = defaultSegment?.code || 'umum';
    }

    // 3. Create Project
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Dynamic ID Prefix derived from Category (e.g. 'kbm' -> 'KBM', 'umum' -> 'UMU')
    // Ensure it's 3 chars
    const prefix = (category || 'GEN').substring(0, 3).toUpperCase();

    // Special handling if needed? No, let's keep it generic.
    // Maybe 'umum' maps to 'EXT' for backward compatibility? 
    // Let's stick to the generated prefix for consistency with new structure.
    const typeCode = prefix;

    const projectId = `SPT-${typeCode}-${new Date().getFullYear()}-${randomSuffix}`;

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
            productId: formData.get('productId') as string || null, // Capture Product ID
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

export async function updateProject(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const authorName = formData.get('authorName') as string;
    const publisher = formData.get('publisher') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 0;
    const category = formData.get('category') as string;

    // 1. Permission Check
    let userRoleId = session.user.role?.id;
    // Fallback if missing
    if (!userRoleId && session.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { roleId: true } });
        userRoleId = user?.roleId || undefined;
    }

    // Check Role
    const userRole = await prisma.role.findUnique({ where: { id: userRoleId } });
    if (!userRole) throw new Error("Unauthorized: Invalid Role");

    let hasPermission = false;
    try {
        const permissions = JSON.parse(userRole.permissions || '{}');
        if (permissions['manage_order'] === 'edit') hasPermission = true;
    } catch (e) { }
    if (userRoleId === SYSTEM_ROLES.SUPER_ADMIN) hasPermission = true;

    if (!hasPermission) throw new Error("Unauthorized: You do not have permission to edit projects.");

    // 2. Update Project
    await prisma.project.update({
        where: { id },
        data: {
            title,
            authorName,
            publisher,
            quantity,
            category
        }
    });

    revalidatePath('/');
    revalidatePath(`/project/${id}`);
    redirect('/dashboard');
}

export async function verifyProjectAccess(tokenOrId: string) {
    const project = await prisma.project.findFirst({
        where: {
            OR: [
                { id: tokenOrId },
                { publicToken: tokenOrId }
            ]
        },
        select: { title: true }
    });

    if (!project) {
        return { valid: false, error: 'Project tidak ditemukan. Pastikan ID/Token benar.' };
    }

    return { valid: true, title: project.title };
}
