import { notFound, redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { EditProjectForm } from "@repo/feature-timeline";
import { updateProject } from "../../../actions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) redirect('/login');

    // 1. Verify Permission
    let canEdit = false;
    if (session.user.role?.id) {
        const role = await prisma.role.findUnique({ where: { id: session.user.role.id } });
        try {
            const perms = JSON.parse(role?.permissions as string || '{}');
            if (role?.id === 'super_admin' || perms['manage_order'] === 'edit') {
                canEdit = true;
            }
        } catch (e) { }
    }

    if (!canEdit) {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized: You do not have permission to edit projects.</div>;
    }

    // 2. Fetch Project
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            product: true,
            author: true
        }
    });

    if (!project) notFound();

    // 3. Fetch Categories
    const categories = await prisma.productCategory.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <EditProjectForm
                initialData={{
                    ...project,
                    productName: project.product?.name
                }}
                categories={categories}
                onUpdate={updateProject}
            />
        </div>
    );
}
