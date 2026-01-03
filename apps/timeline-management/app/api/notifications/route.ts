
import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from "@repo/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {


        if (!session?.user?.id) {
            return NextResponse.json({ error: 'User ID missing in session' }, { status: 401 });
        }

        // Cast to any because TS is struggling to pick up the new model in the monorepo context immediately
        const notifications = await (prisma as any).notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
