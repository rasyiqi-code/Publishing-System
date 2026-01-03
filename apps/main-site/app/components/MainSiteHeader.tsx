import Link from "next/link";
import { auth } from "@repo/auth";
import { logoutAction } from "../logout-action";

export async function MainSiteHeader() {
    const session = await auth();

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl text-indigo-600">
                    Sistem Penerbitan
                </Link>

                <nav className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-600">
                                {session.user?.name}
                            </span>
                            {/* If Admin, link to Dashboard */}
                            {session?.user?.role?.name === 'super_admin' || session?.user?.role?.name === 'admin' ? (
                                <Link
                                    href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}
                                    className="text-sm font-bold text-indigo-600 hover:underline"
                                >
                                    Ke Panel Admin
                                </Link>
                            ) : null}

                            <form action={logoutAction}>
                                <button className="text-sm font-bold text-slate-500 hover:text-slate-800">
                                    Keluar
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Masuk
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
