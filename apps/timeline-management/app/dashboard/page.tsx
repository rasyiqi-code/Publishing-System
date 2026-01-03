import { DashboardClient } from "../DashboardClient";
import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { createProject } from "../actions";
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

    // Role Logic Mapping matched with Seed.ts
    // Clients: admin_kbm, admin_external
    if ((roleId === 'admin_kbm' || roleId === 'admin_external') && user?.id) {
        whereClause.authorId = user.id;
    }
    // Marketing Internal
    else if (roleId === 'marketing_kbm') {
        whereClause.OR = [
            { category: 'kbm' },
            { category: 'penulis' } // Penulis Mitra treated as KBM scope
        ];
    }
    // Marketing External
    else if (roleId === 'marketing_external') {
        whereClause.category = 'umum';
    }
    // Super Admin & Functional Admins (Finance, Legal, Print) see ALL by default


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
