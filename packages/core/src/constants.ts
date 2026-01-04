
export const SYSTEM_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin'
} as const;

/**
 * @deprecated Use `prisma.clientSegment.findMany()` instead.
 * These values are now seeded into the Database.
 * Kept for fallback/legacy compatibility only.
 */
export const CLIENT_SEGMENT_CODES = {
    INSTITUTIONAL: 'kbm',
    GENERAL: 'umum',
    AUTHOR_PARTNER: 'penulis'
} as const;

// Permission Keys (Matching seed.ts)
export const PERMISSION_KEYS = {
    VIEW_INSTITUTIONAL: 'view_segment_institutional',
    VIEW_GENERAL: 'view_segment_general'
} as const;
