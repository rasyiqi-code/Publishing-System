import { auth } from "@repo/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "./AdminShell";
import { getGlobalSettings } from "./settings/actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect('/login?callbackUrl=/admin');
    }

    const identitySettings = await getGlobalSettings('identity');
    const brandName = (identitySettings as any[])?.find((s: any) => s.key === 'brand_name')?.value || 'Kreasibu';

    return (
        <AdminShell user={session.user} brandName={brandName}>
            {children}
        </AdminShell>
    );
}
