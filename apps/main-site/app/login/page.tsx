import { signIn, auth } from "@repo/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await auth();
    if (session) {
        redirect('/admin');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-zinc-100">
                <h1 className="text-2xl font-bold text-center mb-6 text-zinc-800">Masuk ke SPT</h1>

                <form
                    action={async (formData) => {
                        "use server";
                        await signIn("credentials", {
                            ...Object.fromEntries(formData),
                            redirectTo: "/admin",
                        });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="admin@spt.com"
                            defaultValue="admin@spt.com"
                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 mb-1">Kata Sandi</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="password"
                            defaultValue="password"
                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
                        Masuk
                    </button>
                </form>

                <p className="text-xs text-center text-zinc-400 mt-6">
                    Gunakan <b>admin@spt.com</b> / <b>password</b> untuk demo.
                </p>
            </div>
        </div>
    );
}
