
import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import type { PushSubscription } from '@repo/database';
import webpush from 'web-push';
import { auth } from "@repo/auth";

// --- CONFIG ---
// In a real app, these should be in .env
// Generated via `web-push generate-vapid-keys`
const publicVapidKey = 'BMrFAwWMmKmcOk_LFGnTdilXQxBh9_M7tKNmNu2gvXRGHq_MuZid5Ne6nS16trCGfcj3lwTLmI3MBYdwvwt51xc';
const privateVapidKey = 'xtVRtRAwZfpRXNXyhK38LUN_j1mGdLWhpJVWeI38D48';

webpush.setVapidDetails(
    'mailto:admin@spt.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || publicVapidKey,
    process.env.VAPID_PRIVATE_KEY || privateVapidKey
);

export async function POST(req: Request) {
    const session = await auth();
    // In real app, restrict this to admin or server-server calls
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { userId, title, message, url } = await req.json();

        // 1. Save to Database (In-App Notification)
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                link: url
            }
        });

        // 2. Send Web Push
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        const payload = JSON.stringify({ title, body: message, url });

        const sendPromises = subscriptions.map((sub: PushSubscription) => {
            return webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }, payload).catch(err => {
                if (err.statusCode === 410) {
                    // Subscription expired, delete it
                    return prisma.pushSubscription.delete({ where: { id: sub.id } });
                }
                console.error('Push error:', err);
            });
        });

        await Promise.all(sendPromises);

        return new NextResponse('Notification Sent', { status: 200 });
    } catch (error) {
        console.error('Send Notification Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
