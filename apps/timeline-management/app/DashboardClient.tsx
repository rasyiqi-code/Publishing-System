'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SPTDashboard, DevRoleSwitcher } from "@repo/feature-timeline";

interface DashboardClientProps {
    projects: any[];
    services: any;
    masterData: any;
    baseRole: string;
    createProjectAction: (formData: FormData) => Promise<void>;
}

export function DashboardClient({
    projects,
    services,
    masterData,
    baseRole,
    createProjectAction
}: DashboardClientProps) {
    const router = useRouter();
    console.log('DashboardClient baseRole:', baseRole); // DEBUG
    const [userRole, setUserRole] = useState(baseRole);
    // const [showCreateModal, setShowCreateModal] = useState(false); // Removed for page-based flow

    // Convert Services Map to Array for Dropdown
    const servicesList = Object.values(services || {});

    return (
        <>
            <SPTDashboard
                projects={projects}
                services={services}
                masterData={masterData}
                userRole={userRole}
                setUserRole={setUserRole}
                onSelectProject={(p) => router.push(`/project/${p.id}`)}
                onCreateClick={() => router.push('/project/new')}
            />

            {/* Modal Removed - uses /project/new page now */}

            <DevRoleSwitcher currentRole={userRole} baseRole={baseRole} onRoleChange={setUserRole} />
        </>
    );
}
