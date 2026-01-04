import { notFound, redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { generateProjectViewModel } from "@repo/feature-timeline";
import { ProjectDetailClient } from "../ProjectDetailClient";
import { updateStepStatus } from "../../actions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;

    // Strict Access Control: Must be logged in
    if (!session?.user) {
        redirect('/login');
    }

    // Fetch Project
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
            logs: true,
            author: true,
            product: true // Fetch associated product
        }
    });

    if (!project) return notFound();

    // Check Access (RBAC: Database Driven)
    const sessionUserId = session?.user?.id;
    const userRoleId = session?.user?.role?.id;

    let canViewAll = false;
    let viewPermissions: string[] = [];

    if (userRoleId) {
        const userRoleDef = await prisma.role.findUnique({ where: { id: userRoleId } });
        if (userRoleDef) {
            // Permission Check
            try {
                const perms = typeof userRoleDef.permissions === 'string'
                    ? JSON.parse(userRoleDef.permissions)
                    : userRoleDef.permissions;

                canViewAll = userRoleDef.id === 'super_admin' || !!perms?.['view_all_projects'];

                // Collect all 'view_segment_*' permissions
                Object.keys(perms || {}).forEach(key => {
                    if (key.startsWith('view_segment_') && perms[key] === 'view') {
                        viewPermissions.push(key);
                    }
                });

            } catch (e) {
                console.error("Failed to parse role permissions", e);
            }
        }
    }

    // Access Logic:
    // 1. Super Admin or 'view_all_projects' -> ALLOW
    // 2. Author (Owner) -> ALLOW
    // 3. Managed By (Explicit Assignment) -> ALLOW
    // 4. Segment Permission (e.g. 'view_segment_kbm' for KBM projects) -> ALLOW

    let accessGranted = false;

    if (canViewAll) {
        accessGranted = true;
    } else if (sessionUserId && project.authorId === sessionUserId) {
        accessGranted = true;
    } else if (userRoleId && project.managedBy === userRoleId) {
        accessGranted = true;
    } else {
        // Segment Check
        // Need to fetch Segment Definition to map Code -> Permission Key
        // Example: 'kbm' -> 'view_segment_kbm'
        if (project.category) {
            const segmentDef = await prisma.clientSegment.findUnique({ where: { code: project.category } });
            if (segmentDef && segmentDef.viewPermission) {
                // Check if user has this specific permission
                // We need to re-fetch user permissions properly above if we want exact match, 
                // OR just check if the Key exists in our collected viewPermissions.
                // Re-parsing permissions above to be safe.
                if (viewPermissions.includes(segmentDef.viewPermission)) {
                    accessGranted = true;
                }
            }
        }
    }

    if (!accessGranted) {
        return notFound();
    }

    // Fetch Master Data
    const masterDataPoints = await prisma.masterDataPoint.findMany();
    const masterDataMap = masterDataPoints.reduce((acc: any, curr: any) => ({
        ...acc,
        [curr.id]: curr
    }), {});

    // Prepare Service Map for Engine
    const serviceMap = {
        [project.service.id]: {
            ...project.service,
            type: project.service.uiMode, // Explicit map for Engine which expects 'type'
            steps: project.service.steps.map((s: any) => ({
                id: s.dataPointId,
                dependencyRule: s.dependencyRule
            }))
        }
    };

    // Prepare Logs Map
    const logsMap = project.logs.reduce((acc: any, log: any) => ({
        ...acc,
        [log.dataPointId]: { value: log.value, status: log.status }
    }), {});

    // Fetch Role Map
    const roles = await prisma.role.findMany();
    const roleMap = roles.reduce((acc: any, curr: any) => ({
        ...acc,
        [curr.id]: curr.name
    }), {});

    // Generate ViewModel
    const projectViewModel = generateProjectViewModel(
        {
            ...project,
            logs: logsMap,
            currentStepId: null,
            author: project.author?.name || project.authorName || 'Unknown',
            productName: (project as any).product?.name || 'Custom Project' // Pass Product Name
        },
        serviceMap,
        masterDataMap,
        roleMap
    );

    // Parse Permissions for Client
    let userPermissions: Record<string, string> = {};
    if (userRoleId) {
        const userRoleDef = await prisma.role.findUnique({ where: { id: userRoleId } });
        if (userRoleDef) {
            try {
                userPermissions = typeof userRoleDef.permissions === 'string'
                    ? JSON.parse(userRoleDef.permissions)
                    : (userRoleDef.permissions || {});
            } catch (e) { console.error("Permission Parse Error", e); }
        }
    }

    if (!projectViewModel) return <div>Error generating project view.</div>;

    const finalUserRole = userRoleId || 'guest';

    return (
        <ProjectDetailClient
            project={projectViewModel}
            userRole={finalUserRole}
            baseRole={finalUserRole}
            permissions={userPermissions} // [NEW] Pass permissions
            onUpdateStatus={async (pId, sId, st, val) => {
                'use server';
                await updateStepStatus(pId, sId, st, val);
            }}
        />
    );
}
