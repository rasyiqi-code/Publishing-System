'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectDetail, DevRoleSwitcher } from "@repo/feature-timeline";
import { useState } from "react";

interface ProjectDetailClientProps {
    project: any;
    userRole: string;
    baseRole: string;
    permissions?: Record<string, string>; // [NEW]
    onUpdateStatus: (projectId: string, stepId: string, status: string, value?: string) => Promise<void>;
}

export function ProjectDetailClient({ project, userRole: initialRole, baseRole, permissions, onUpdateStatus }: ProjectDetailClientProps) {
    const router = useRouter();
    const [userRole, setUserRole] = useState(initialRole);

    return (
        <>
            <ProjectDetail
                project={project}
                userRole={userRole}
                permissions={permissions} // [NEW]
                onBack={() => router.push('/')}
                onUpdateStatus={onUpdateStatus}
            />
            {/* Contextual Role Switcher for Admins Only (Helper) */}
            {(baseRole === 'super_admin' || baseRole === 'admin') && (
                <DevRoleSwitcher currentRole={userRole} baseRole={baseRole} onRoleChange={setUserRole} />
            )}
        </>
    );
}
