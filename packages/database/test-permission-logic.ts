
const userRole = 'admin_kbm';
const permissions: Record<string, string> = {
    manage_order: 'view',
    approve_creative: 'edit',
    submit_draft: 'view',
    manage_digital_assets: 'edit'
};

const step = {
    id: 'isbn_input',
    requiredPermission: 'manage_isbn',
    roleId: 'legal'
};

const SYSTEM_ROLES = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

console.log('--- PERMISSION LOGIC TEST ---');

const permissionValue = permissions[step.requiredPermission];
const capabilityCheck = step.requiredPermission
    ? permissionValue === 'edit'
    : userRole === step.roleId;

const isSystemAdmin = userRole === SYSTEM_ROLES.ADMIN || userRole === SYSTEM_ROLES.SUPER_ADMIN;

const canAction = isSystemAdmin || capabilityCheck;

console.log({
    userRole,
    stepRequired: step.requiredPermission,
    userHasPermission: permissionValue,
    capabilityCheck,
    isSystemAdmin,
    canAction
});
