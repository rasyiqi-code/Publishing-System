import { prisma } from "@repo/database";
import { ServiceComposer } from "./ServiceComposer";
import { createService, updateService, deleteService } from "../actions";

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
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
