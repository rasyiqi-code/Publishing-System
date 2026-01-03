"use client";

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DependencySelector } from './DependencySelector';
import { GripVertical, X, Lock, Package, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';

// --- SUB COMPONENT: Sortable Item ---
function SortableItem({
    id,
    label,
    role,
    onRemove,
    onConfigure,
    hasRule,
    allowRemove
}: {
    id: string,
    label: string,
    role: string,
    onRemove?: () => void,
    onConfigure?: () => void,
    hasRule?: boolean,
    allowRemove?: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all mb-3">
            <div className="flex items-center gap-3">
                <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 p-1">
                    <GripVertical className="w-5 h-5" />
                </button>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] uppercase font-bold text-slate-400">{role} • {id}</p>
                        {hasRule && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                                <Lock className="w-3 h-3" /> Aturan Aktif
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onConfigure && (
                    <button type="button" onClick={onConfigure} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Konfigurasi Aturan">
                        <Lock className="w-4 h-4" />
                    </button>
                )}
                {onRemove && allowRemove && (
                    <button type="button" onClick={onRemove} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// --- SUB COMPONENT: Inventory Group ---
function InventoryGroup({ group, items, onAdd }: { group: string, items: any[], onAdd: (item: any) => void }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-3">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <h3 className="text-xs font-bold text-slate-700 capitalize flex items-center gap-2">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    {group.replace('_', ' ')}
                </h3>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {items.length}
                </span>
            </button>

            {isOpen && (
                <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                    {items.map((item: any) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => onAdd(item)}
                            className="w-full text-left p-2.5 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all group/item flex items-center justify-between transition-colors"
                        >
                            <div>
                                <div className="text-xs font-bold text-slate-600 group-hover/item:text-indigo-700">{item.label}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{item.role}</div>
                            </div>
                            <PlusCircle className="w-4 h-4 text-slate-300 group-hover/item:text-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- MAIN COMPONENT: Workflow Canvas ---
interface WorkflowCanvasProps {
    serviceId?: string;
    serviceName?: string;
    uiMode?: string;
    initialSteps: any[];
    inventory?: any;
    onSave?: (serviceId: string, steps: any[]) => Promise<any>;
    onChange?: (steps: any[]) => void;
}

export function WorkflowCanvas({ serviceId, serviceName, uiMode, initialSteps, inventory, onSave, onChange }: WorkflowCanvasProps) {
    const [steps, setSteps] = useState(initialSteps);
    const [isSaving, setIsSaving] = useState(false);
    const [editingRuleStepId, setEditingRuleStepId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update steps when initialSteps changes (e.g. switching services)
    React.useEffect(() => {
        setSteps(initialSteps);
    }, [initialSteps]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = steps.findIndex(i => i.id === active.id);
            const newIndex = steps.findIndex(i => i.id === over?.id);
            const newSteps = arrayMove(steps, oldIndex, newIndex);

            setSteps(newSteps);
            if (onChange) onChange(newSteps);
        }
    }

    const removeStep = (id: string) => {
        // 1. Filter out the removed step
        const filteredSteps = steps.filter(s => s.id !== id);

        // 2. Clear rules that depend on the removed step
        const newSteps = filteredSteps.map(s => {
            const rule = s.dependencyRule;
            if (rule && rule.required === id) {
                // Remove the dependency rule if it pointed to the deleted step
                const { dependencyRule, ...rest } = s;
                return rest;
            }
            return s;
        });

        setSteps(newSteps);
        if (onChange) onChange(newSteps);
    };

    const handleSave = async () => {
        if (!serviceId || !onSave) return;
        setIsSaving(true);
        try {
            await onSave(serviceId, steps);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveRule = (rule: any) => {
        if (!editingRuleStepId) return;

        const newSteps = steps.map(s => {
            if (s.id === editingRuleStepId) {
                if (!rule) {
                    const { dependencyRule, ...rest } = s;
                    return rest;
                }
                return { ...s, dependencyRule: rule };
            }
            return s;
        });

        setSteps(newSteps);
        if (onChange) onChange(newSteps);

        setEditingRuleStepId(null);
    };

    const addStep = (item: any) => {
        // Prevent dupes if necessary, but some workflows might repeat steps? Assuming unique per ID for now or allow multiple.
        // For simple workflow, let's assume one instance per data point for now to avoid ID collision in dnd-kit.
        // But dnd-kit uses 'id' which is from serviceStep.id usually.
        // We need to generate a temp ID for new item.

        const newStep = {
            id: item.id, // Using DataPoint ID as Step ID initially. This works if we don't have duplicates.
            label: item.label,
            role: item.role,
            dataPointId: item.id,
            dataPoint: item, // Embed full object for UI
            isNew: true
        };

        // Check if already exists?
        if (steps.find(s => s.id === newStep.id)) {
            alert("Tahap ini sudah ada dalam alur kerja.");
            return;
        }

        const nextSteps = [...steps, newStep];
        setSteps(nextSteps);
        if (onChange) onChange(nextSteps);
    };

    return (
        <>
            {/* RULE CONFIG MODAL */}
            {editingRuleStepId && (
                <DependencySelector
                    currentStepId={editingRuleStepId}
                    steps={steps.map(s => ({ id: s.id, label: s.label || s.dataPoint?.label || s.id }))}
                    currentRule={steps.find(s => s.id === editingRuleStepId)?.dependencyRule}
                    onSave={handleSaveRule}
                    onCancel={() => setEditingRuleStepId(null)}
                />
            )}

            <div className="grid grid-cols-12 gap-8">
                {/* INVENTORY SIDEBAR - Only show if inventory is provided */}
                {inventory && (
                    <div className="col-span-4 border-r border-slate-200 bg-slate-50/30 flex flex-col h-full max-h-[800px]">
                        <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-indigo-500" />
                                PUSTAKA TAHAPAN
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium ml-6 mt-0.5">
                                Klik item untuk menambahkan
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {Object.entries(inventory).map(([group, items]: any) => (
                                <InventoryGroup key={group} group={group} items={items} onAdd={addStep} />
                            ))}
                        </div>
                    </div>
                )}

                {/* CANVAS AREA */}
                <div className={`${inventory ? "col-span-8" : "col-span-12"} py-6 pr-6 pl-2`}>
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{serviceName || 'Layanan Tanpa Judul'}</h3>
                            <p className="text-slate-400 text-sm">Mode: {uiMode || 'Tidak Diketahui'}</p>
                        </div>
                        {onSave && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !serviceId}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-100"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Alur Kerja'}
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-2xl border-2 border-dashed border-slate-200 min-h-[500px]">
                        {isMounted ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={steps.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3 pb-20">
                                        {steps.map((step, index) => (
                                            <div key={step.id} className="relative">
                                                {/* Order Badge */}
                                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <SortableItem
                                                    id={step.id}
                                                    label={step.label || step.dataPoint?.label || step.id}
                                                    role={step.role || step.dataPoint?.role || '-'}
                                                    onRemove={() => removeStep(step.id)}
                                                    onConfigure={() => setEditingRuleStepId(step.id)}
                                                    hasRule={!!step.dependencyRule && Object.keys(step.dependencyRule).length > 0}
                                                    allowRemove={!!inventory}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </SortableContext></DndContext>
                        ) : null}

                        {steps.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                                <p className="font-medium">Alur Kerja Belum Dikonfigurasi</p>
                                <p className="text-sm opacity-70">{inventory ? "Pilih komponen dari panel kiri untuk mulai menyusun alur kerja." : "Kembali ke 'Resep Layanan' untuk menambahkan tahapan."}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
