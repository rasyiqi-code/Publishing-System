"use client";
import React, { useState } from 'react';
import { SPTDashboard } from './components/dashboard/SPTDashboard';
import { ProjectDetail } from './components/detail/ProjectDetail';

import { MasterDataMap, ServiceMap } from './engine';
import { CreateProjectForm } from './components/dashboard/CreateProjectForm';

interface SPTControlPanelProps {
    projects?: any[];
    services?: ServiceMap;
    masterData?: MasterDataMap;
    onUpdateStatus?: (projectId: string, stepId: string, status: string, value?: string) => Promise<void>;
    onCreateProject?: (formData: FormData) => Promise<void>;
}

export const SPTControlPanel = ({ projects, services, masterData, onUpdateStatus, onCreateProject }: SPTControlPanelProps) => {
    const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [userRole, setUserRole] = useState('admin');

    const handleSelectProject = (project: any) => {
        setSelectedProject(project);
        setView('detail');
    };

    const handleBack = () => {
        setSelectedProject(null);
        setView('dashboard');
    };

    return (
        <>
            {isCreating && onCreateProject && services && (
                <CreateProjectForm
                    services={Object.values(services)}
                    onCancel={() => setIsCreating(false)}
                    onCreate={async (formData) => {
                        await onCreateProject(formData);
                        setIsCreating(false);
                    }}
                />
            )}

            {view === 'dashboard' ? (
                <SPTDashboard
                    onSelectProject={handleSelectProject}
                    userRole={userRole}
                    setUserRole={setUserRole}
                    projects={projects}
                    services={services}
                    masterData={masterData}
                    onCreateClick={() => setIsCreating(true)}
                />
            ) : (
                <ProjectDetail
                    project={selectedProject}
                    onBack={handleBack}
                    userRole={userRole}
                    onUpdateStatus={onUpdateStatus}
                />
            )}
        </>
    );
};
