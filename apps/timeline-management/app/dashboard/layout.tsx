import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { getGlobalSettings } from "../admin/actions";
import { DashboardShell } from "../components/DashboardShell";
import { redirect } from 'next/navigation';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        redirect('/');
    }

    const [settings, services, dbUser] = await Promise.all([
        getGlobalSettings('identity'),
        prisma.serviceDefinition.findMany({
            select: { id: true, name: true, uiMode: true },
            orderBy: { name: 'asc' }
        }),
        prisma.user.findUnique({
            where: { id: user.id },
            include: { role: true }
        })
    ]);

    const brandName = (settings.find((s: any) => s.key === 'brand_name')?.value as string)?.replace(/"/g, '') || 'TimelineManager';
    const roleId = dbUser?.role?.id;
    const isAdmin = roleId === 'super_admin' || roleId === 'admin_layout' || roleId === 'admin_publisher' || roleId === 'admin_legal' || roleId === 'admin_finance' || roleId === 'admin_print';

    return (
        <DashboardShell user={user} brandName={brandName} isAdmin={isAdmin} services={services}>
            {children}
        </DashboardShell>
    );
}
