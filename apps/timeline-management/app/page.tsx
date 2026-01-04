import { AppHeader } from './components/AppHeader';
import { PublicTrackingClient } from './PublicTrackingClient';
import { PublicTrackingResult } from './PublicTrackingResult';
import { PublicTimeline } from './PublicTimeline';
import { prisma } from "@repo/database";
import { generateProjectViewModel } from "@repo/feature-timeline";
import { updateStepStatus } from "./actions";

import { auth } from "@repo/auth";

interface PageProps {
    searchParams: Promise<{ ticket?: string; track?: string }>;
}

export default async function PublicTrackingPage({ searchParams }: PageProps) {
    const session = await auth();
    const { ticket, track } = await searchParams;

    // Check Permissions for Edit (server-side)
    let canEdit = false;
    if (session?.user?.role?.id) {
        const role = await prisma.role.findUnique({ where: { id: session.user.role.id } });
        try {
            const perms = JSON.parse(role?.permissions as string || '{}');
            if (role?.id === 'super_admin' || perms['manage_order'] === 'edit') {
                canEdit = true;
            }
        } catch (e) { }
    }

    let projectViewModel = null;
    let ongoingProjects: any[] = [];

    if (ticket || track) {
        const id = ticket || track;

        // Fetch the main project
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
                logs: true,
                author: true
            }
        });

        // Fetch other ongoing projects for sidebar
        ongoingProjects = await prisma.project.findMany({
            where: {
                status: {
                    in: ['active', 'warning']
                },
                id: { not: id } // Exclude current
            },
            take: 10,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true, // Needed for edit link
                title: true,
                authorName: true,
                author: {
                    select: { name: true }
                },
                status: true,
                updatedAt: true,
                logs: {
                    select: {
                        dataPointId: true,
                        status: true
                    }
                },
                service: {
                    select: {
                        steps: {
                            orderBy: { stepOrder: 'asc' },
                            select: {
                                dataPointId: true,
                                stepOrder: true,
                                dataPoint: {
                                    select: { label: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log(`[PublicTracking] Found ${ongoingProjects.length} other projects for sidebar.`);

        if (project) {
            // Fetch Master Data
            const masterDataPoints = await prisma.masterDataPoint.findMany();
            const masterDataMap = masterDataPoints.reduce((acc: any, curr: any) => ({
                ...acc,
                [curr.id]: curr
            }), {});

            // Prepare Service Map
            const serviceMap = {
                [project.service.id]: {
                    ...project.service,
                    type: project.service.uiMode,
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
            projectViewModel = generateProjectViewModel(
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
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AppHeader />

            <main>
                {projectViewModel ? (
                    ticket ? (
                        <PublicTrackingResult project={projectViewModel} />
                    ) : (
                        <PublicTimeline
                            project={projectViewModel}
                            canEdit={canEdit}
                            sidebarProjects={ongoingProjects.map((p: any) => {
                                // Logic: Find the first step that is NOT completed
                                const steps = p.service?.steps || [];
                                const logsMap = new Map((p.logs || []).map((l: any) => [l.dataPointId, l.status]));

                                let currentStatusLabel = 'Menunggu';
                                let isComplete = false;

                                // Find the first step that is NOT completed
                                const activeStep = steps.find((s: any) => logsMap.get(s.dataPointId) !== 'completed');

                                if (!activeStep) {
                                    // All steps completed
                                    isComplete = true;
                                    currentStatusLabel = 'Selesai';
                                } else {
                                    currentStatusLabel = activeStep.dataPoint?.label || 'Sedang Proses';
                                }

                                return {
                                    title: p.title,
                                    author: p.author?.name || p.authorName || 'Unknown',
                                    status: currentStatusLabel,
                                    isComplete: isComplete, // Pass boolean flag for styling
                                    date: p.updatedAt,
                                    id: p.id,
                                    canEdit: canEdit
                                };
                            })}
                        />
                    )
                ) : (
                    <PublicTrackingClient
                        error={(ticket || track) ? `Project tidak ditemukan. Kode "${ticket || track}" mungkin salah atau tidak valid.` : undefined}
                    />
                )}
            </main>
        </div>
    );
}
