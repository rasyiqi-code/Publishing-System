import { Button, Card } from "@repo/ui";
import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { Users, Shield, ArrowUpRight, MoreHorizontal, Calendar, Activity } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await auth();

    const [userCount, roleCount, latestUsers] = await Promise.all([
        prisma.user.count(),
        prisma.role.count(),
        prisma.user.findMany({
            take: 4,
            include: { role: true }
        })
    ]);

    const growthData = [
        { label: 'Jan', value: 30 },
        { label: 'Feb', value: 45 },
        { label: 'Mar', value: 60 },
        { label: 'Apr', value: 80 },
        { label: 'May', value: 70 },
        { label: 'Jun', value: 90 },
    ];
    // TODO: Connect to real analytics data when available

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: System Health (Credit Assessment style) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center space-x-2 text-gray-500 mb-6">
                        <Activity className="w-5 h-5 bg-gray-100 rounded-full p-0.5" />
                        <span className="text-sm font-medium">System Health Check</span>
                    </div>

                    <div className="mb-2 flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">98.2%</span>
                        <span className="ml-2 text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">-0.4%</span>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">
                        System stability remains strong.
                        Your uptime reflects excellent server performance.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-600">Active Sessions</span>
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">+12.6%</span>
                    </div>
                    <div className="h-16 flex items-end justify-between space-x-1">
                        {/* Fake mini sparkline */}
                        {[20, 40, 30, 60, 50, 80, 70, 90].map((h, i) => (
                            <div key={i} className="w-full bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle/Right: Analytics (Portfolio Growth style) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-gray-500 mb-2">
                            <ArrowUpRight className="w-5 h-5 bg-gray-100 rounded-full p-0.5" />
                            <span className="text-sm font-medium">Annual User Growth</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{userCount} <span className="text-lg font-medium text-gray-400">Total Users</span></h2>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded inline-block mt-2">+$12,546.44 (Simulated Value)</span>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="rounded-xl h-8 border-gray-200 text-gray-500 text-xs">
                            <Calendar className="w-3 h-3 mr-2" /> 2024
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl h-8 border-gray-200 text-gray-500 text-xs">
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Simulated Bar Chart */}
                <div className="h-64 flex items-end justify-around space-x-4">
                    {growthData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center w-full group">
                            <div className="relative w-full max-w-[60px] flex flex-col items-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg mb-1">
                                    {data.value}%
                                </span>
                                <div
                                    className="w-full bg-brand-blue/10 rounded-t-xl group-hover:bg-brand-blue/20 transition-colors"
                                    style={{ height: `${data.value * 1.5}px`, minHeight: '20px' }}
                                ></div>
                                <div
                                    className="w-full bg-brand-blue rounded-t-xl mt-1 relative z-10"
                                    style={{ height: `${data.value * 2}px` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-400 mt-3 font-medium">{data.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Left: Recent Registrations (Top Contacts style) */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium">Recent Registrations</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {latestUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                                    {u.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{u.name || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500">{u.role?.name || 'No Role'}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full text-gray-400 hover:text-brand-blue">
                                <Users className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Link href="/admin/users" className="block text-center text-xs font-medium text-gray-400 hover:text-brand-blue mt-4">
                        View All Users
                    </Link>
                </div>
            </div>

            {/* Bottom Right: Quick Action / Dark Card */}
            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h3 className="text-white text-2xl font-bold mb-2">Optimize Workflow</h3>
                        <p className="text-gray-400 text-sm max-w-md">
                            Your system is running efficiently. Use our AI tools to further enhance role optimization and security access patterns.
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-8">
                    <div className="text-left">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Status</p>
                        <p className="text-white font-mono text-xl">OPTIMAL</p>
                    </div>
                    <Button className="bg-white hover:bg-gray-100 text-black px-8 py-6 rounded-2xl font-bold text-sm shadow-xl transition-transform hover:scale-105">
                        Get Started
                    </Button>
                </div>
            </div>
        </div>
    );
}
