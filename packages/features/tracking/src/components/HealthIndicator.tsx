"use client";
import React from 'react';
import { PhaseStatus } from '../types';

export const HealthIndicator = ({ status }: { status: PhaseStatus }) => {
    const getColor = () => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getLabel = () => {
        switch (status) {
            case 'completed': return 'Healthy (Selesai)';
            case 'active': return 'On Track (Berjalan)';
            case 'warning': return 'Warning (Terhenti > 3 Hari)';
            case 'critical': return 'Critical (Masalah Data)';
            default: return 'Locked';
        }
    };

    return (
        <div className={`px-3 py-1 rounded-full border text-sm font-medium inline-block ${getColor()}`}>
            {getLabel()}
        </div>
    );
};
