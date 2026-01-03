"use client";

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface DependencySelectorProps {
    currentStepId: string;
    steps: { id: string, label: string }[];
    currentRule?: { required?: string }; // Keep it simple for now matching engine.ts
    onSave: (rule: { required?: string }) => void;
    onCancel: () => void;
}

export function DependencySelector({ currentStepId, steps, currentRule, onSave, onCancel }: DependencySelectorProps) {
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    // Only allow selecting steps BEFORE the current one to prevent cycles
    const availableSteps = steps.slice(0, currentIndex);

    const [selectedId, setSelectedId] = useState<string | undefined>(currentRule?.required);

    const handleSelect = (id: string) => {
        // Toggle selection (single select for now as per engine limit)
        if (selectedId === id) {
            setSelectedId(undefined);
        } else {
            setSelectedId(id);
        }
    };

    const handleSave = () => {
        onSave(selectedId ? { required: selectedId } : {});
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Atur Ketergantungan</h3>
                    <button type="button" onClick={onCancel} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-500 mb-4">
                        Tahap ini akan TERKUNCI hingga tahap yang dipilih selesai.
                        <br />
                        <span className="text-xs text-slate-400">(Hanya tahap sebelumnya yang dapat dipilih)</span>
                    </p>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {availableSteps.length === 0 && (
                            <p className="text-center text-slate-400 italic text-sm py-8">
                                Tidak ada tahap sebelumnya yang tersedia.
                            </p>
                        )}

                        {availableSteps.map(step => (
                            <button
                                type="button"
                                key={step.id}
                                onClick={() => handleSelect(step.id)}
                                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${selectedId === step.id
                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`font-medium ${selectedId === step.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                                    {step.label}
                                </span>
                                {selectedId === step.id && (
                                    <Check className="w-4 h-4 text-indigo-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95"
                        >
                            Simpan Aturan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
