
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SIMULATING DASHBOARD LOGIC ---');

    // 1. Setup Context (Coordinator)
    const sessionEmail = 'coord_layout@spt.com';
    const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
        include: { role: true }
    });

    if (!user) throw new Error("User not found");

    const userRoleId = user.roleId;

    // Parse permissions
    let userPermissions: Record<string, string> = {};
    if (user.role?.permissions) {
        try {
            userPermissions = JSON.parse(user.role.permissions);
        } catch (e) {
            console.error("Permission Parse Error", e);
        }
    }

    console.log('User:', sessionEmail);
    console.log('Permissions:', userPermissions);

    // 2. Logic from page.tsx
    const visibleConditions: any[] = [];

    // Dynamic Segments
    const dynamicSegments = await prisma.clientSegment.findMany();
    console.log('Segments:', dynamicSegments); // Verify segments exist

    dynamicSegments.forEach(segment => {
        // [CRITICAL CHECK]
        const hasPerm = segment.viewPermission && userPermissions[segment.viewPermission] === 'view';
        console.log(`Checking Segment ${segment.code}: Permission Key '${segment.viewPermission}' -> Has it? ${hasPerm}`);

        if (hasPerm) {
            visibleConditions.push({ category: segment.code });
        }
    });

    if (userRoleId) {
        visibleConditions.push({ managedBy: userRoleId });
    }

    const whereClause: any = {};
    if (visibleConditions.length > 0) { // Assume not super admin
        whereClause.OR = visibleConditions;
    }

    console.log('Generated WhereClause:', JSON.stringify(whereClause, null, 2));

    // 3. Run Query
    const projects = await prisma.project.findMany({
        where: whereClause
    });

    console.log(`Found ${projects.length} projects.`);
    if (projects.length > 0) {
        console.log('Project IDs:', projects.map(p => p.id));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
