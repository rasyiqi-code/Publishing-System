import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import { AdminShell } from "./AdminShell";
import { getGlobalSettings } from "./actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/admin');
    }

    // Dynamic RBAC: Fetch latest permissions from DB
    // We don't trust the session role name alone, we check the actual capabilities
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });

    if (!user || !user.role) {
        redirect('/');
    }

    // Parse Permissions
    let permissions = {};
    try {
        if (user.role.permissions) {
            permissions = JSON.parse(user.role.permissions);
        }
    } catch (e) {
        // invalid json, assume no permissions
        permissions = {};
    }

    // Role Guard: 
    // If the user has NO permission keys defined, they are treated as a regular user (Client/Author)
    // and denied access to the Admin Dashboard.
    // 'super_admin' is also covered because they have all permissions in the DB.
    if (Object.keys(permissions).length === 0) {
        redirect('/');
    }

    const identitySettings = await getGlobalSettings('identity');
    // Using any for now to bypass type inference issues until restart
    const brandName = (identitySettings as any[])?.find((s: any) => s.key === 'brand_name')?.value || 'Timeline Mgmt';

    return (
        <AdminShell user={session.user} brandName={brandName} permissions={permissions}>
            {children}
        </AdminShell>
    );
}
