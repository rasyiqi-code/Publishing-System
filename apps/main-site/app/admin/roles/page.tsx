import { Card } from "@repo/ui";
import { prisma } from "@repo/database";
import RoleManager from "./RoleManager";

export default async function RolesPage() {
    const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Peran</h1>
            </div>

            <Card className="mb-10 p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl border-none shadow-xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                        <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Panduan Hak Akses (RBAC)</h3>
                        <p className="text-gray-300 leading-relaxed max-w-3xl">
                            Atur hak akses granular untuk berbagai modul seperti Order, Finance, dan Creative.
                            Peran yang dibuat di sini akan tersedia untuk seluruh ekosistem aplikasi.
                            Gunakan level <strong>View Only</strong> untuk pemantauan dan <strong>Full Access</strong> untuk supervisor.
                        </p>
                    </div>
                </div>
            </Card>

            <RoleManager initialRoles={roles} />
        </div>
    );
}
