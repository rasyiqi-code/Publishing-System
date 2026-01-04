
export interface StepViewModel {
    id: string;
    label: string;
    role: string;
    roleId?: string; // [NEW]
    requiredPermission?: string; // [NEW]
    status: 'completed' | 'active' | 'pending' | 'locked' | 'warning';
    isCurrent: boolean;
    isLocked?: boolean;
    lockReason?: string;
}

// Types for the Data Maps
export interface ServiceStepDefinition {
    id: string; // data point id
    dependencyRule?: string; // JSON string e.g. { "required": "dp_confirm", "status": "completed" }
}

export type MasterDataMap = Record<string, { id: string, label: string, role: string, requiredPermission?: string }>;
export type ServiceMap = Record<string, { id: string, name: string, type: string, steps: ServiceStepDefinition[] }>;


export function generateProjectViewModel(
    project: any,
    services: ServiceMap,
    masterData: MasterDataMap,
    roleMap: Record<string, string> = {}
) {
    const service = services[project.serviceId];
    if (!service) return null;

    let foundCurrent = false;

    // Specs Aggregation
    const specs: Record<string, any> = project.specs || {};
    // If project.logs is a map, iterate and extract specs
    if (project.logs && typeof project.logs === 'object') {
        Object.entries(project.logs).forEach(([k, v]: any) => {
            const md = masterData[k];
            // Check if group is 'specs'. We assume masterData has 'group' (it should)
            // However, MasterDataMap type definition (line 18) only has { id, label, role }. 
            // We cast md to any to access group, or update interface. 
            // Given I can't easily update interface across files right now without risk, I'll cast.
            if (md && (md as any).group === 'specs' && v.value) {
                specs[k] = v.value; // Use Key as ID (e.g. spec_kertas) or Label? UI expects key-value. 
                // UI uses Object.entries(project.specs).map(([key, value]) => ... key.replace(/_/g, ' ') ...
                // So using 'spec_kertas' is fine, it will become 'spec kertas'.
            }
        });
    }

    // Meta Quantity
    const meta = project.meta || {};
    if (project.quantity) {
        meta.quantity = project.quantity;
    }

    const steps: StepViewModel[] = service.steps.map((stepDef, i) => {
        const stepId = typeof stepDef === 'string' ? stepDef : stepDef.id;
        const masterDefinition = masterData[stepId];
        if (!masterDefinition) return { id: stepId, label: 'Unknown', role: '-', status: 'locked', isCurrent: false };

        const logData = project.logs?.[stepId];
        let status: StepViewModel['status'] = 'locked';
        let isCurrent = false;

        // Status Logic
        if (logData && logData.status === 'completed') {
            status = 'completed';
        } else if (stepId === project.currentStepId) {
            status = project.status === 'warning' ? 'warning' : 'active';
            isCurrent = true;
            foundCurrent = true;
        } else if (logData && logData.status === 'active') {
            status = 'active';
            isCurrent = true;
            foundCurrent = true;
        } else if (!foundCurrent) {
            status = 'completed';
        }

        // Gating Logic (The Rule Engine)
        let isLocked = false;
        let lockReason = '';

        // 1. Check Explicit Rules (JSON)
        if (stepDef.dependencyRule) {
            try {
                const rules = JSON.parse(stepDef.dependencyRule);
                if (rules.required) {
                    const reqStepId = rules.required;
                    const reqLog = project.logs?.[reqStepId];
                    if (!reqLog || reqLog.status !== 'completed') {
                        if (status !== 'completed') {
                            isLocked = true;
                            const reqLabel = masterData[reqStepId]?.label || reqStepId;
                            lockReason = `Syarat: ${reqLabel} harus selesai.`;
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to parse rule", e);
            }
        }

        // 2. Linear Dependency Check
        if (!isLocked && !stepDef.dependencyRule && i > 0) {
            const prevStepDef = service.steps[i - 1];
            const prevStepId = prevStepDef.id;
            const prevLog = project.logs?.[prevStepId];

            if (!prevLog || prevLog.status !== 'completed') {
                if (status !== 'completed') {
                    isLocked = true;
                    lockReason = `Menunggu: ${masterData[prevStepId]?.label}`;
                }
            }
        }

        // Resolve Role Name
        const roleId = masterDefinition.role;
        const roleName = roleMap[roleId] || roleId; // Fallback to ID if not found

        return {
            id: stepId,
            label: masterDefinition.label,
            role: roleName,
            roleId, // [NEW] Raw Role ID for logic check
            requiredPermission: masterDefinition.requiredPermission, // [NEW] Capability check
            status,
            date: logData?.value === 'active' ? 'Sedang Proses' : logData?.value,
            isCurrent,
            isLocked,
            lockReason
        };
    });

    return {
        ...project,
        serviceName: service.name,
        uiMode: service.type,
        steps,
        specs,
        meta
    };
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-green-500 text-white shadow-green-100';
        case 'active':
            return 'bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-50';
        case 'warning':
            return 'bg-amber-500 text-white animate-pulse';
        case 'locked':
        default:
            return 'bg-white border-2 border-slate-100 text-slate-300';
    }
}
