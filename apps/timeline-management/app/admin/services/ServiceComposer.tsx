'use client';
import React, { useState, useMemo } from 'react';
import { Package, ChevronRight, ChevronLeft, LayoutList } from 'lucide-react';
import { WorkflowCanvas } from "@repo/feature-timeline";

interface ServiceComposerProps {
    masterData: any[];
    services: any[];
    onCreate: (formData: FormData) => Promise<any>;
    onUpdate: (id: string, formData: FormData) => Promise<any>;
    onDelete: (id: string) => Promise<any>;
}

export const ServiceComposer = ({ masterData, services, onCreate, onUpdate, onDelete }: ServiceComposerProps) => {
    const [currentSteps, setCurrentSteps] = useState<any[]>([]);
    const [editingService, setEditingService] = useState<any>(null);
    const [serviceName, setServiceName] = useState('');
    const [uiMode, setUiMode] = useState('timeline');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Group masterData for Inventory Sidebar
    const inventory = useMemo(() => {
        return masterData.reduce((acc: any, curr: any) => {
            const group = curr.group || 'others';
            if (!acc[group]) acc[group] = [];
            acc[group].push(curr);
            return acc;
        }, {});
    }, [masterData]);

    const handleEdit = (service: any) => {
        setEditingService(service);
        setServiceName(service.name);
        setUiMode(service.uiMode);
        // Map steps and ensure they have dataPoint info for UI Label
        const sortedSteps = [...service.steps]
            .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
            .map((s: any) => ({
                ...s,
                id: s.dataPointId, // Use dataPointId as ID for canvas consistency with inventory
                // Use embedded dataPoint if available, or find in masterData
                label: s.dataPoint?.label || masterData.find(m => m.id === s.dataPointId)?.label || s.dataPointId,
                role: s.dataPoint?.role || masterData.find(m => m.id === s.dataPointId)?.role || 'unknown',
                // Fix: Parse dependencyRule if it comes as string from DB
                dependencyRule: (typeof s.dependencyRule === 'string' && s.dependencyRule)
                    ? JSON.parse(s.dependencyRule)
                    : s.dependencyRule
            }));
        setCurrentSteps(sortedSteps);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingService(null);
        setServiceName('');
        setUiMode('timeline');
        setCurrentSteps([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* BUILDER AREA (Main Editor) */}
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden h-fit sticky top-8 transition-all duration-300 ${isSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                {/* Header / Meta Config */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {!isSidebarOpen && (
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                                title="Buka Daftar Layanan"
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-600" />
                            {editingService ? `Sunting: ${editingService.name}` : 'Resep Baru'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {editingService && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="text-xs font-bold text-slate-400 hover:text-indigo-600"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white font-bold text-sm rounded-lg shadow-lg transition-all active:scale-95 ${editingService ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                            form="service-form"
                        >
                            {editingService ? '💾 Perbarui' : '✨ Simpan'}
                        </button>
                    </div>
                </div>

                <form id="service-form" action={async (formData) => {
                    // Send JSON config of steps
                    formData.append('stepsConfig', JSON.stringify(currentSteps));

                    if (editingService) {
                        await onUpdate(editingService.id, formData);
                        handleCancel();
                    } else {
                        await onCreate(formData);
                        handleCancel();
                    }
                }} className="flex flex-col h-full">

                    {/* Basic Info Inputs */}
                    <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Layanan</label>
                            <input
                                name="name"
                                value={serviceName}
                                onChange={e => setServiceName(e.target.value)}
                                required
                                placeholder="e.g. Express Printing"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mode Tampilan</label>
                            <select
                                name="type"
                                value={uiMode}
                                onChange={e => setUiMode(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="timeline">Timeline (Proyek)</option>
                                <option value="ticket">Tiket (Satuan)</option>
                            </select>
                        </div>
                    </div>

                    {/* The Canvas */}
                    <div className="p-6 bg-slate-50 min-h-[600px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Konfigurasi Alur & Aturan
                        </p>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <WorkflowCanvas
                                initialSteps={currentSteps}
                                inventory={inventory}
                                onChange={setCurrentSteps}
                                serviceName={serviceName}
                                uiMode={uiMode}
                            // No onSave passed here, handled by parent Form
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    {/* Footer Actions Removed - Moved to Header */}

                </form>
            </div>

            {/* LIST SIDEBAR (Existing Services) */}
            {isSidebarOpen && (
                <div className="space-y-4 lg:col-span-1 h-fit sticky top-8 max-h-screen overflow-y-auto animate-in slide-in-from-right-10 fade-in cursor-default">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Layanan Tersedia</h3>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-300 hover:text-slate-500">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={handleCancel} className="text-xs font-bold text-indigo-600 hover:underline">+ Baru</button>
                    </div>

                    {services.map(s => (
                        <div key={s.id} className={`bg-white p-4 rounded-xl border transition-all cursor-pointer group relative ${editingService?.id === s.id ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 shadow-sm hover:border-indigo-200'}`} onClick={() => handleEdit(s)}>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                                <span className="text-[9px] uppercase font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{s.uiMode}</span>
                            </div>
                            <div className="flex items-center gap-0.5 overflow-hidden mb-3">
                                {s.steps.sort((a: any, b: any) => a.stepOrder - b.stepOrder).slice(0, 8).map((st: any) => (
                                    <div key={st.id} className="h-1 w-4 bg-indigo-200 rounded-full first:bg-indigo-500" />
                                ))}
                                {s.steps.length > 8 && <span className="text-[9px] text-slate-400 ml-1">...</span>}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">{s.steps.length} tahapan</span>
                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (confirm('Apakah Anda yakin? Ini akan menghapus semua proyek yang terkait!')) onDelete(s.id);
                                        }}
                                        className="text-slate-300 hover:text-red-500"
                                        title="Hapus"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
