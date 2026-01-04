import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { ServiceComposer } from "./ServiceComposer";
import { createService, updateService, deleteService } from "../actions";

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const session = await auth();
    const user = session?.user;

    // Permission Gate
    let canAccess = false;
    if (user?.role?.id === 'super_admin') canAccess = true;
    else if (user?.role?.id) {
        const fullRole = await prisma.role.findUnique({ where: { id: user.role.id } });
        const perms = JSON.parse(fullRole?.permissions as string || '{}');
        if (perms['manage_system_config']) canAccess = true;
    }

    if (!canAccess) return <div className="p-10 text-center text-red-600 font-bold">Unauthorized Access</div>;

    const [masterData, services] = await Promise.all([
        prisma.masterDataPoint.findMany({ orderBy: { id: 'asc' } }),
        prisma.serviceDefinition.findMany({ include: { steps: true } })
    ]);

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Recipes</h1>
                <p className="text-slate-500 font-medium">Compose services from Lego blocks.</p>
            </header>

            <ServiceComposer
                masterData={masterData}
                services={services}
                onCreate={createService}
                onUpdate={async (id, fd) => {
                    'use server'
                    await updateService(id, fd)
                }}
                onDelete={async (id) => {
                    'use server'
                    await deleteService(id)
                }}
            />
        </div>
    );
}
