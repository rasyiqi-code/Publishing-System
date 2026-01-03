import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import RoleEditClient from "./RoleEditClient";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RoleEditPage({ params }: PageProps) {
    const { id } = await params;

    let role = null;

    if (id !== 'new') {
        role = await prisma.role.findUnique({
            where: { id }
        });

        if (!role) {
            notFound();
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-sans">
            <RoleEditClient role={role} />
        </div>
    );
}
