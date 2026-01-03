import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import UserEditForm from "./UserEditForm";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: PageProps) {
    const { id } = await params;

    const isNew = id === 'new';

    // Fetch data in parallel (if not new)
    const [user, roles] = await Promise.all([
        isNew ? Promise.resolve(null) : prisma.user.findUnique({
            where: { id },
            include: { role: true }
        }),
        prisma.role.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    if (!isNew && !user) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-sans">
            <UserEditForm user={user} roles={roles} />
        </div>
    );
}
