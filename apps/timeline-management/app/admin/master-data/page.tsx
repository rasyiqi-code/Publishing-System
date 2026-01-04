import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { MasterDataList } from "./MasterDataList";
import { deleteMasterData, updateMasterData } from "../actions";
import { MasterDataForm } from "./MasterDataForm";

export const dynamic = 'force-dynamic';

export default async function MasterDataPage() {
    const session = await auth(); // Need auth import
    const user = session?.user;

    // Permission Gate
    let canAccess = false;
    if (user?.role?.id === 'super_admin') {
        canAccess = true;
    } else if (user?.role?.id) {
        const fullRole = await prisma.role.findUnique({ where: { id: user.role.id } });
        const perms = JSON.parse(fullRole?.permissions as string || '{}');
        if (perms['manage_system_config']) canAccess = true;
    }

    if (!canAccess) {
        return <div className="p-10 text-center text-red-600 font-bold">Unauthorized Access</div>;
    }

    const [dataPoints, roles] = await Promise.all([
        prisma.masterDataPoint.findMany({ orderBy: { id: 'asc' } }),
        prisma.role.findMany({ orderBy: { name: 'asc' } })
    ]);

    return (
        <div>
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Data (Lego Blocks)</h1>
                    <p className="text-slate-500 font-medium">Define the atomic steps available for services.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-8">
                    <h2 className="font-bold text-lg mb-4 text-slate-800">Add New Block</h2>
                    <MasterDataForm roles={roles} />
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <MasterDataList
                        dataPoints={dataPoints}
                        roles={roles}
                        onDelete={deleteMasterData}
                        onUpdate={updateMasterData}
                    />
                </div>
            </div>
        </div>
    );
}
