// Re-export shared constants from @repo/core
import { CLIENT_SEGMENT_CODES, PERMISSION_KEYS, SYSTEM_ROLES } from '@repo/core';

export { CLIENT_SEGMENT_CODES, PERMISSION_KEYS, SYSTEM_ROLES };

export const CLIENT_SEGMENTS = [
    { code: CLIENT_SEGMENT_CODES.INSTITUTIONAL, label: 'Mitra Kampus (KBM)' },
    { code: CLIENT_SEGMENT_CODES.GENERAL, label: 'Mitra Umum/Swasta' },
    { code: CLIENT_SEGMENT_CODES.AUTHOR_PARTNER, label: 'Penulis Mitra' }
] as const;

export const LOGIN_ROLE_DEFAULTS = [
    { label: "Super Admin", email: "admin@spt.com", role: "Superuser" },
    { label: "Admin Penerbit KBM", email: "marketing_kbm@spt.com", role: "Front Office" },
    { label: "Marketing Umum", email: "marketing_ext@spt.com", role: "Front Office" },
    { label: "Finance", email: "finance@spt.com", role: "Operational" },
    { label: "Legal", email: "legal@spt.com", role: "Operational" },
    { label: "Print", email: "production@spt.com", role: "Operational" },
    { label: "Koor Layout", email: "coord_layout@spt.com", role: "Creative" },
    { label: "Layouter", email: "layouter@spt.com", role: "Creative" },
    { label: "Layouter", email: "layouter@spt.com", role: "Creative" },
];
