"use client";
import React from 'react';
import { Phase } from '../types';

export const ProgressBar = ({ phases }: { phases: Phase[] }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                {phases.map((phase) => (
                    <div key={phase.id} className="text-center flex-1">
                        <div className={`text-xs font-bold mb-1 ${phase.status === 'completed' ? 'text-green-600' :
                                phase.status === 'active' ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                            Phase {phase.id}
                        </div>
                        <div className={`h-2 rounded-full mx-1 ${phase.status === 'completed' ? 'bg-green-500' :
                                phase.status === 'active' ? 'bg-blue-500 animate-pulse' :
                                    phase.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-200'
                            }`} />
                        <div className="text-[10px] mt-1 text-gray-500">{phase.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
