import { prisma } from "@repo/database";
import UserManager from "./UserManager";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const [users, roles] = await Promise.all([
        prisma.user.findMany({
            include: { role: true },
            orderBy: { name: 'asc' }
        }),
        prisma.role.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    return <UserManager initialUsers={users} roles={roles} />;
}
