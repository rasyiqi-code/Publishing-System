import { notFound } from "next/navigation";
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

    // Fetch Project
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
            logs: true,
            author: true
        }
    });

    if (!project) return notFound();

    // Check Access (RBAC: Database Driven)
    const sessionUserId = session?.user?.id;
    const userRoleId = session?.user?.role?.id;

    let canViewAll = false;
    if (userRoleId) {
        const userRoleDef = await prisma.role.findUnique({ where: { id: userRoleId } });
        if (userRoleDef) {
            // Permission Check
            try {
                const perms = typeof userRoleDef.permissions === 'string'
                    ? JSON.parse(userRoleDef.permissions)
                    : userRoleDef.permissions; // Handle if schema changed to Json type

                canViewAll = userRoleDef.id === 'super_admin' || !!perms?.['view_all_projects'];
            } catch (e) {
                console.error("Failed to parse role permissions", e);
            }
        }
    }

    // Enforce Isolation for Non-Staff (Partners/Clients)
    if (userRoleId && !canViewAll && sessionUserId && project.authorId !== sessionUserId) {
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
            author: project.author?.name || project.authorName || 'Unknown'
        },
        serviceMap,
        masterDataMap,
        roleMap
    );

    if (!projectViewModel) return <div>Error generating project view.</div>;

    const finalUserRole = userRoleId || 'guest';

    return (
        <ProjectDetailClient
            project={projectViewModel}
            userRole={finalUserRole}
            baseRole={finalUserRole}
            onUpdateStatus={async (pId, sId, st, val) => {
                'use server';
                await updateStepStatus(pId, sId, st, val);
            }}
        />
    );
}
