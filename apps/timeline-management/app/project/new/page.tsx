import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { CreateProjectForm } from "@repo/feature-timeline";
import { createProject } from "../../actions";
import { redirect } from "next/navigation";

export default async function NewProjectPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const services = await prisma.serviceDefinition.findMany({
        include: { steps: { orderBy: { stepOrder: 'asc' } } }
    });

    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    const categories = await prisma.productCategory.findMany({
        orderBy: { order: 'asc' }
    });

    const servicesList = services.map(s => ({
        id: s.id,
        name: s.name,
        type: s.uiMode
    }));

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 flex flex-col items-center justify-center">
            <CreateProjectForm services={servicesList} products={products} categories={categories} onCreate={createProject} />
        </div>
    );
}
