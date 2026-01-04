
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG STATE CHECKS ---');

    // 1. Check Project State
    const project = await prisma.project.findUnique({
        where: { id: 'SPT-KBM-001' },
        include: { logs: true } // See recent logs
    });
    console.log('PROJECT STATE:', JSON.stringify(project, null, 2));

    // 2. Check User & Role State
    const userEmail = 'klien_kbm@spt.com';
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { role: true }
    });
    console.log('USER STATE:', JSON.stringify(user, null, 2));

    // 3. Simulate Dashboard Logic
    if (user && user.role) {
        const roleId = user.role.id;
        let perms = {};
        try { perms = JSON.parse(user.role.permissions || '{}'); } catch (e) { }

        console.log('User Role ID:', roleId);
        console.log('User Permissions:', perms);

        // Check if logic matches
        const matchesManagedBy = project?.managedBy === roleId;
        // @ts-ignore
        const matchesSegment = perms[`view_segment_${project?.category}`] === 'view' || perms['view_segment_institutional'] === 'view'; // Assuming mapping

        console.log('--- VISIBILITY CALCULATION ---');
        console.log(`Matches ManagedBy (${project?.managedBy} == ${roleId})?`, matchesManagedBy);
        console.log(`Matches Segment (Category: ${project?.category})?`, matchesSegment);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
