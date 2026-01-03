
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, RefreshCw } from 'lucide-react';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

// Hardcoded for now, same as in send/route.ts
const PUBLIC_VAPID_KEY = 'BMrFAwWMmKmcOk_LFGnTdilXQxBh9_M7tKNmNu2gvXRGHq_MuZid5Ne6nS16trCGfcj3lwTLmI3MBYdwvwt51xc';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationBell = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    // UI state
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register SW
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch(err => {
                console.error('Service Worker registration failed:', err);
            });

            setPermission(Notification.permission);
        }

        // Initial fetch
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
            });

            // Send subscription to backend
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });

            setIsSubscribed(true);
            setPermission(Notification.permission);
            alert('Notifications enabled!');
        } catch (e: any) {
            console.error('Subscription failed', e);
            if (e.message?.includes('upsert')) {
                alert('Server Database Not Ready. Please try again later or contact admin.');
            } else {
                alert('Failed to enable notifications.');
            }
        }
    };

    const handleBellClick = () => {
        // Toggle dropdown
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleEnableClick = () => {
        if (permission === 'default' || permission === 'denied') {
            Notification.requestPermission().then(perm => {
                setPermission(perm);
                if (perm === 'granted') {
                    subscribeToPush();
                }
            });
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
                className="p-2 text-slate-400 hover:text-indigo-600 bg-white hover:bg-slate-50 rounded-full border border-slate-200 shadow-sm transition-all relative"
                title={permission === 'granted' ? 'Notifications' : 'Enable Notifications'}
            >
                {unreadCount > 0 ? <BellRing className="w-5 h-5 text-indigo-600" /> : <Bell className="w-5 h-5" />}

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        <div className="flex gap-2">
                            <button onClick={fetchNotifications} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            {permission !== 'granted' && (
                                <button
                                    onClick={handleEnableClick}
                                    className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-full font-bold hover:bg-indigo-700 transition"
                                >
                                    Enable Push
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                Tak ada notifikasi baru.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className={`p-4 hover:bg-slate-50 transition flex gap-3 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}>
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{notif.title}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                                            {notif.link && (
                                                <a href={notif.link} className="text-[10px] font-bold text-indigo-600 hover:underline mt-1 block">
                                                    Lihat Detail →
                                                </a>
                                            )}
                                            <p className="text-[10px] text-slate-400 font-medium pt-1">
                                                {new Date(notif.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>
            )}
        </div>
    );
};
