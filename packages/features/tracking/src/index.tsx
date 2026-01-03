"use client";
import React, { useState } from 'react';
import { useSPTStatus } from './hooks/useSPTStatus';
import { ProgressBar } from './components/ProgressBar';
import { HealthIndicator } from './components/HealthIndicator';
import { DATA_POINT_CONFIG, SPTData } from './types';
import { Button } from '@repo/ui';

export const SPTTrackingWidget = () => {
    // Mock Data for Visualization
    const [mockData, setMockData] = useState<SPTData>({
        1: { ...DATA_POINT_CONFIG[1], value: "2023-10-01" }, // Order Date
        2: { ...DATA_POINT_CONFIG[2], value: "Ahmad Fulan" }, // Author
        8: { ...DATA_POINT_CONFIG[8], value: "2023-10-02" }, // DP Verified
    } as SPTData);

    const { phases, overallProgress } = useSPTStatus(mockData);
    const currentPhase = phases.find(p => p.status === 'active' || p.status === 'warning');

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Tracking Buku (SPT)</h2>
                    <p className="text-sm text-gray-500">Milestone-Based Progress</p>
                </div>
                <HealthIndicator status={currentPhase?.status || 'locked'} />
            </div>

            <div className="mb-8">
                <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span className="font-bold">{overallProgress}%</span>
                </div>
                <ProgressBar phases={phases} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phases.map(phase => (
                    <div key={phase.id} className={`p-4 rounded border ${phase.status === 'active' ? 'border-blue-300 bg-blue-50' :
                            phase.status === 'locked' ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-200'
                        }`}>
                        <div className="flex justify-between mb-2">
                            <h3 className="font-semibold">{phase.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded bg-white border">{phase.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                        <div className="space-y-1">
                            {phase.dataPoints.map(dpid => {
                                const config = DATA_POINT_CONFIG[dpid];
                                const filled = mockData[dpid]?.value;
                                return (
                                    <div key={dpid} className="flex items-center text-xs">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${filled ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className={filled ? 'text-gray-900' : 'text-gray-400'}>
                                            {config.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-gray-400 mb-2">Debug Controls (Simulate Actions)</p>
                <div className="flex gap-2">
                    <Button onClick={() => setMockData(prev => ({ ...prev, 25: { ...DATA_POINT_CONFIG[25], value: new Date() } }))}>
                        Simulate ACC Final (Phase 2 Done)
                    </Button>
                    <Button onClick={() => setMockData(prev => ({ ...prev, 9: { ...DATA_POINT_CONFIG[9], value: new Date() } }))}>
                        Simulate Pelunasan (Unlock Print)
                    </Button>
                </div>
            </div>
        </div>
    );
};
