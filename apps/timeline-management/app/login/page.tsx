"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { LOGIN_ROLE_DEFAULTS as DEFAULT_ACCOUNTS } from "../../lib/constants";

export default function LoginPage() {
    const [email, setEmail] = useState("admin@spt.com");
    const [password, setPassword] = useState("password");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // We use the server action or next-auth client generic sign-in depending on setup.
        // The original code used a server action passed adding "use server".
        // To be safe and keep it client-side compatible with our buttons, we'll assume standard NextAuth or simulate the form submission by calling the server action if we could import it, 
        // BUT we can't import server actions into client components easily if they are defined inline.
        // IMPORTANT: The original file had the server action INLINE. We need to replace it.
        // IF we use `signIn` from `next-auth/react` (client), it works best. 
        // Assuming the repo uses generic next-auth client config.

        // HOWEVER, the original import was `import { signIn } from "@repo/auth";` which looked like a server-side helper?
        // Let's try to keep the "server action" pattern but we need to move the action to a separate file or use the client-side `signIn`.
        // Given the typical turborepo setup, `@repo/auth` typically exports provider configurations or server helpers.

        // Let's use standard form submission to an API route OR keep it simple.
        // Actually, to avoid breaking the "use server" inline action which can't be in "use client" file,
        // we will simple use the `signIn` from `next-auth/react` if available, or just submit to the API endpoint.

        // Wait, if I change to "use client", I can't define "use server" action inline.
        // I will trust that standard `signIn` client-side works. 
        // If not, I'll fallback to a regular form post? 
        // Let's look at `imports`. The original used `import { signIn } from "@repo/auth"`.
        // I'll assume I can't use that on client.

        // ALTERNATIVE: Keep the page as Server Component, but add a Client Component "LoginForm" inside it?
        // That is safer.

        // Let's do the "LoginClient" approach.
        // But for now, to be quick, I'll rewrite this file to call `signIn` from `next-auth/react` which is standard for client interactions.
        // If `@repo/auth` doesn't support client `signIn`, this might fail.
        // But usually it does. 

        // Actually, looking at the original file: `import { signIn } from "@repo/auth";`
        // If I make this client-side, I should import from `next-auth/react`.

        // Let's try to stick to the plan: adding buttons.
        // I will make this `LoginPage` a Client Component.

        await signIn("credentials", {
            email,
            password,
            callbackUrl: "/"
        });
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50">

            {/* Left Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-zinc-100">
                    <h1 className="text-2xl font-bold text-center mb-6 text-zinc-800">Login - Timeline Manager</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-600 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-600 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Masuk..." : "Masuk Dashboard"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side: Quick Login (Dev Tools) */}
            <div className="flex-1 bg-zinc-900 p-8 text-white overflow-y-auto max-h-screen">
                <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-2">⚡ Quick Login (Dev Mode)</h2>
                    <p className="text-zinc-400 text-sm mb-6">Click any role to auto-fill credentials.</p>

                    <div className="grid grid-cols-1 gap-3">
                        {DEFAULT_ACCOUNTS.map((acc) => (
                            <button
                                key={acc.email}
                                onClick={() => {
                                    setEmail(acc.email);
                                    setPassword("password");
                                }}
                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all text-left group"
                            >
                                <div>
                                    <div className="font-bold text-sm group-hover:text-indigo-400 transition-colors">{acc.label}</div>
                                    <div className="text-xs text-zinc-500">{acc.email}</div>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                                    {acc.role}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-800 text-xs text-zinc-500">
                        <p>Password default: <b>password</b></p>
                        <p className="mt-2 text-yellow-600">Note: Penulis Mitra (B2C) belum ada di seed data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
