'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TrackingCard } from './components/TrackingCard';

interface PublicTrackingResultProps {
    project: any;
}

export function PublicTrackingResult({ project }: PublicTrackingResultProps) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-8 md:mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <TrackingCard project={project} />

            <button
                onClick={handleBack}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center gap-2 transition-colors hover:underline decoration-2 underline-offset-4"
            >
                <ArrowLeft size={16} /> Kembali ke Pencarian
            </button>
        </div>
    );
}
