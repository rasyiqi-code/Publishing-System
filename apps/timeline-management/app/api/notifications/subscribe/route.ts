
import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { auth } from "@repo/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    try {
        const subscription = await req.json();

        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId: userId,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                userId: userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        });

        return new NextResponse('Subscribed', { status: 201 });
    } catch (error) {
        console.error('Subscription error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
