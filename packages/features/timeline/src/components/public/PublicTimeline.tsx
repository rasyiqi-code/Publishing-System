'use client';
import React from 'react';
import { generateProjectViewModel } from '../../engine';
import { CheckCircle2, Circle, Lock, Clock } from 'lucide-react';

export const PublicTimeline = ({ project, service, masterData }: any) => {
    // Utilize the existing engine to get the View Model (status logic)
    // We mock the 'services' map structure required by the engine
    const servicesMap = {
        [service.id]: {
            ...service,
            steps: service.steps.map((s: any) => ({
                id: s.dataPointId,
                dependencyRule: s.dependencyRule
            }))
        }
    };

    // Normalize logs for engine if needed (engine handles it if passed correctly)
    // The engine expects project.logs as a Map or Array.
    // Let's pass normalized logs to be safe.
    const logsMap = project.logs.reduce((acc: any, log: any) => ({
        ...acc,
        [log.dataPointId]: log
    }), {});

    const projectViewModel = generateProjectViewModel(
        { ...project, logs: logsMap, currentStepId: null }, // currentStepId null as we rely on logs
        servicesMap,
        masterData
    );

    if (!projectViewModel) return <div>Error loading timeline.</div>;

    // Calculate Progress
    // Calculate Progress
    const totalSteps = projectViewModel?.steps?.length || 0;
    const completedSteps = projectViewModel?.steps?.filter((s: any) => s.status === 'completed')?.length || 0;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
        <div className="p-0">
            {/* Progress Bar */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-2xl font-black text-indigo-600">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Steps List */}
            <div className="p-4 space-y-4">
                {projectViewModel.steps.map((step: any, index: number) => {
                    const isLast = index === projectViewModel.steps.length - 1;

                    let icon = <Circle className="w-5 h-5 text-slate-300" />;
                    let lineColor = "bg-slate-200";
                    let textColor = "text-slate-500";
                    let bgColor = "bg-white";
                    let borderColor = "border-slate-100";

                    if (step.status === 'completed') {
                        icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                        lineColor = "bg-emerald-200";
                        textColor = "text-emerald-900";
                        bgColor = "bg-emerald-50";
                        borderColor = "border-emerald-100";
                    } else if (step.status === 'active') {
                        icon = <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />;
                        lineColor = "bg-slate-200";
                        textColor = "text-indigo-900";
                        bgColor = "bg-indigo-50";
                        borderColor = "border-indigo-100";
                    } else if (step.status === 'locked') {
                        icon = <Lock className="w-4 h-4 text-slate-300" />;
                    }

                    return (
                        <div key={step.id} className="relative pl-4">
                            {/* Vertical Line */}
                            {!isLast && (
                                <div className={`absolute left-[23px] top-8 bottom-[-16px] w-0.5 ${lineColor} -z-10`} />
                            )}

                            <div className={`relative flex gap-4 p-4 rounded-xl border ${borderColor} ${bgColor} transition-all`}>
                                <div className="mt-0.5 bg-white p-1 rounded-full shadow-sm max-h-fit">
                                    {icon}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${textColor}`}>{step.label}</h3>

                                    {step.status === 'completed' && (
                                        <p className="text-xs text-emerald-600 font-medium mt-0.5">Selesai pada {step.date}</p>
                                    )}
                                    {step.status === 'active' && (
                                        <p className="text-xs text-indigo-500 font-medium mt-0.5">Sedang dikerjakan</p>
                                    )}
                                    {step.status === 'locked' && (
                                        <p className="text-xs text-slate-400 mt-0.5">Menunggu antrian</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
