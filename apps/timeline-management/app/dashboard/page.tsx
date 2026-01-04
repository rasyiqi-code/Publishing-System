import { DashboardClient } from "../DashboardClient";
import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { createProject } from "../actions";
import { CLIENT_SEGMENT_CODES, PERMISSION_KEYS, SYSTEM_ROLES } from "../../lib/constants";
import { getGlobalSettings } from "../admin/actions";

export const dynamic = 'force-dynamic';

export default async function Page(props: { searchParams: Promise<{ serviceId?: string }> }) {
    const session = await auth();
    const user = session?.user;

    // Filter Projects by Role & Category
    // Filter Projects by Role & Category
    const whereClause: any = {};
    const roleId = user?.role?.id; // Use ID, not Name (Name is human readable)

    // Handle Service Filtering from Sidebar
    const searchParams = await props.searchParams;
    const serviceId = searchParams?.serviceId;
    if (serviceId) {
        whereClause.serviceId = serviceId;
    }

    // ---------------------------------------------------------
    // DYNAMIC ASSIGNMENT LOGIC (THE "ADAPTIVE" ENGINE)
    // ---------------------------------------------------------

    // 1. Fetch Role Details
    let userPermissions: Record<string, string> = {};
    let isSuperAdmin = false;

    if (roleId) {
        const fullRole = await prisma.role.findUnique({ where: { id: roleId } });
        if (fullRole) {
            isSuperAdmin = fullRole.id === SYSTEM_ROLES.SUPER_ADMIN;
            try {
                userPermissions = typeof fullRole.permissions === 'string'
                    ? JSON.parse(fullRole.permissions)
                    : (fullRole.permissions || {});
            } catch (e) {
                console.error("Permission Parse Error", e);
            }
        }
    }

    // 2. Define "Visibility Rules" based on Role
    // This implements the "Systematic Randomness" user requested.

    const hasViewAll = isSuperAdmin || userPermissions['view_all_projects'] === 'view';

    // Default: User sees only their own projects
    if (!hasViewAll) {
        if (user?.id) whereClause.authorId = user.id;
    }
    else {
        // Special Handling for "Segmented Admins"
        // Uses GENERIC Permission Keys + Dynamic Assignment.

        const visibleConditions: any[] = [];

        // [REFRACTOR] Use Dynamic Client Segments from Database
        const dynamicSegments = await prisma.clientSegment.findMany();

        dynamicSegments.forEach(segment => {
            if (segment.viewPermission && userPermissions[segment.viewPermission] === 'view') {
                visibleConditions.push({ category: segment.code });
            }
        });

        // 3. Dynamic Override (The "Random" Factor)
        // If a project is explicitly assigned to THIS Role, show it.
        if (roleId) {
            visibleConditions.push({ managedBy: roleId });
        }

        // Apply Filters if any exist. 
        if (visibleConditions.length > 0 && !isSuperAdmin) {
            whereClause.OR = visibleConditions;
        }
    }
    // ---------------------------------------------------------


    const [rawProjects, rawServices, rawMasterData, settings] = await Promise.all([
        prisma.project.findMany({
            where: whereClause,
            include: { logs: true }
        }),
        prisma.serviceDefinition.findMany({ include: { steps: { orderBy: { stepOrder: 'asc' } } } }),
        prisma.masterDataPoint.findMany(),
        getGlobalSettings('identity')
    ]);

    const brandName = (settings.find((s: any) => s.key === 'brand_name')?.value as string)?.replace(/"/g, '') || 'TimelineManager';

    const masterDataMap: Record<string, any> = {};
    rawMasterData.forEach((md: any) => { masterDataMap[md.id] = md; });

    const serviceMap: Record<string, any> = {};
    rawServices.forEach((svc: any) => {
        serviceMap[svc.id] = {
            id: svc.id,
            name: svc.name,
            type: svc.uiMode,
            steps: svc.steps.map((s: any) => ({
                id: s.dataPointId,
                dependencyRule: s.dependencyRule
            }))
        };
    });

    const projects = rawProjects.map((p: any) => {
        const logsMap: Record<string, any> = {};
        p.logs.forEach((l: any) => { logsMap[l.dataPointId] = { value: l.value, status: l.status }; });
        return {
            ...p,
            meta: { publisher: p.publisher, quantity: p.quantity, health: p.status === 'warning' ? 'warning' : 'healthy' },
            specs: Object.entries(logsMap)
                .filter(([key]) => key.startsWith('spec_'))
                .reduce((acc, [key, val]: any) => ({ ...acc, [key.replace('spec_', '')]: val.value }), {}),
            logs: logsMap,
            currentStepId: p.logs.find((l: any) => l.status === 'active' || l.status === 'pending')?.dataPointId
        };
    });

    const isAdmin = roleId === 'super_admin' || roleId === 'layout_coordinator' || roleId === 'legal' || roleId === 'finance' || roleId === 'production';

    return (
        <DashboardClient
            projects={projects}
            services={serviceMap}
            masterData={masterDataMap}
            baseRole={user?.role?.name || 'guest'}
            createProjectAction={createProject}
        />
    );
}
