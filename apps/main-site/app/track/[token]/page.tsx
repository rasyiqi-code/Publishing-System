import { prisma } from "@repo/database";
import { PublicTimeline } from "@repo/feature-timeline";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function PublicTrackingPage({ params }: PageProps) {
    const { token } = await params;

    const project = await prisma.project.findUnique({
        where: { publicToken: token },
        include: {
            service: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
            logs: true,
            author: true
        }
    });

    if (!project) return notFound();

    // Prepare Master Data Map for the component
    const masterDataPoints = await prisma.masterDataPoint.findMany();
    const masterDataMap = masterDataPoints.reduce((acc: any, curr: any) => ({
        ...acc,
        [curr.id]: curr
    }), {});

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Project Tracker</p>
                    <h1 className="text-2xl font-black leading-tight mb-2">{project.title}</h1>
                    <div className="flex items-center gap-2 opacity-90">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 ring-2 ring-indigo-400 flex items-center justify-center text-[10px] font-bold">
                            {project.authorName?.charAt(0) || 'U'}
                        </div>
                        <p className="text-sm font-medium">{project.authorName || 'Unknown Author'}</p>
                    </div>
                </div>

                {/* Timeline Component */}
                <PublicTimeline
                    project={project}
                    service={project.service}
                    masterData={masterDataMap}
                />

                {/* Footer */}
                <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        &copy; 2025 Solusi Publishing Technology.<br />
                        <span className="font-bold text-slate-300">UTTS Monorepo v1.0</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
