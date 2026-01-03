import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";

export async function checkPermission(permissionId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized: No active session");
    }

    // Dynamic RBAC: Fetch latest permissions from DB
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });

    if (!user || !user.role) {
        throw new Error("Unauthorized: User has no role assigned");
    }

    // Parse Permissions
    let permissions: Record<string, string> = {};
    try {
        if (user.role.permissions) {
            permissions = JSON.parse(user.role.permissions);
        }
    } catch (e) {
        permissions = {};
    }

    // Check if user has explicit 'edit' or 'view' permission for this ID
    // We strictly check for existence for now. If distinguishing 'view' vs 'edit' needed, add arg.
    const accessLevel = permissions[permissionId];

    if (accessLevel !== 'edit') {
        // Super admin fallback check is implicit via permissions list if properly set up,
        // but if we want to be safe we can explicit check (though data-driven is better).
        // Since super_admin role has ALL permissions as 'edit' via the constants/seeder, 
        // we just need to ensure the DB reflects that.
        throw new Error(`Forbidden: Missing '${permissionId}' permission.`);
    }

    return true;
}
