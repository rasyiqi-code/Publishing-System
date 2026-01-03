export type AccessLevel = 'none' | 'view' | 'edit';

export type ModuleId = 'system' | 'order' | 'finance' | 'creative' | 'legal' | 'production';

export interface Permission {
    id: string; // e.g., 'manage_order'
    label: string; // e.g., 'Manage Order (Data 1-7)'
    moduleId: ModuleId;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Record<string, AccessLevel>; // permissionId -> level
    isSystem?: boolean; // Cannot be deleted
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
    avatarUrl?: string;
}

// Master Permissions Configuration
// End of types definitions.
// Constants moved to constants.ts
