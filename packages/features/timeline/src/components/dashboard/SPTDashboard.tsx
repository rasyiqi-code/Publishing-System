"use client";
import React, { useState } from 'react';
import { Package, FileText, Truck, AlertCircle, User, Layers, Ticket } from 'lucide-react';
import { generateProjectViewModel, MasterDataMap, ServiceMap } from '../../engine';

interface SPTDashboardProps {
    onSelectProject: (project: any) => void;
    userRole: string;
    setUserRole: (role: string) => void;
    projects?: any[];
    services?: ServiceMap;
    masterData?: MasterDataMap;
    onCreateClick?: () => void;
}

export const SPTDashboard = ({
    onSelectProject,
    userRole,
    setUserRole,
    projects = [],
    services,
    masterData,
    onCreateClick
}: SPTDashboardProps) => {
    // Generate View Models if needed
    const processedProjects = (projects || []).map(p => {
        if (services && masterData && !p.steps) {
            return generateProjectViewModel(p, services, masterData);
        }
        return p;
    }).filter(Boolean);

    // Split projects by visual mode
    const sptProjects = processedProjects.filter((p: any) => p.uiMode === 'timeline');
    const satuanProjects = processedProjects.filter((p: any) => p.uiMode !== 'timeline');

    const hasNoProjects = processedProjects.length === 0;

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Dashboard Produksi</h1>
                    <p className="text-slate-500 font-medium text-lg">Monitoring status proyek secara real-time.</p>
                </div>
                <div>
                    <button
                        onClick={onCreateClick}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 active:scale-95 transition-all text-sm md:text-base"
                    >
                        + Buat Project
                    </button>
                </div>
            </header>

            {/* Empty State */}
            {hasNoProjects && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada proyek</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        Belum ada proyek saat ini. Mulai proyek baru untuk melacak progres.
                    </p>
                    <button
                        onClick={onCreateClick}
                        className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm"
                    >
                        + Buat Project Baru
                    </button>
                </div>
            )}

            {/* SECTION A: SATUAN / TICKET VIEW (Priority if exists, usually simpler) */}
            {satuanProjects.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Ticket className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Layanan Satuan & Antrian</h2>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Project ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Judul / Layanan</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Proses Saat Ini</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {satuanProjects.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => onSelectProject(p)}
                                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-slate-500">{p.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.title}</div>
                                            <div className="text-xs text-slate-500">{p.serviceName} • {p.authorName || p.author}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                                                    ${p.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                    p.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                                <span className="text-sm font-bold text-indigo-700">
                                                    {p.steps.find((s: any) => s.isCurrent)?.label || 'Menunggu'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-bold text-indigo-600 hover:underline">Lihat Detail →</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECTION B: SPT / TIMELINE VIEW */}
            {sptProjects.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Workspace Terpadu (SPT)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sptProjects.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => onSelectProject(p)}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 cursor-pointer group flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">{p.id}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                                                ${p.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                p.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                                            {p.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2 leading-tight">
                                        {p.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[10px] text-white font-bold">
                                            {p.author?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="font-medium truncate">{p.author}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                                        <span className="text-xs font-bold text-indigo-600">
                                            {Math.round((p.steps.filter((s: any) => s.status === 'completed').length / p.steps.length) * 100)}%
                                        </span>
                                    </div>

                                    <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        {p.steps.map((s: any, i: number) => (
                                            <div
                                                key={i}
                                                className={`flex-1 transition-all duration-300 ${s.status === 'completed' ? 'bg-indigo-500' : s.status === 'active' ? 'bg-indigo-300 animate-pulse' : 'bg-transparent'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
