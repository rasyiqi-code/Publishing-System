import Link from "next/link";
import { auth } from "@repo/auth";
import { logoutAction } from "../logout-action";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

export async function AppHeader() {
    const session = await auth();
    const user = session?.user;

    if (!user) return null;

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-6">
                <Link href="/" className="font-black text-xl text-indigo-600 tracking-tight">
                    Timeline<span className="text-slate-800">Manager</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
                    <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                    <Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin Console</Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-700">{user.name || 'User'}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role?.name || 'Guest'}</p>
                </div>

                <NotificationBell />

                <form action={logoutAction}>
                    <button type="submit" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </header>
    );
}
