# Marketing Role Analysis (KBM vs Non-KBM)

This document analyzes the implementation of **Admin Marketing Penerbit KBM** vs **Admin Marketing Penerbit Luar KBM** relative to the codebase.

## 1. Role Definitions (from `seed.ts`)

| Role ID | Name | Scope Intent | Permissions |
| :--- | :--- | :--- | :--- |
| **`marketing_kbm`** | Admin Marketing Penerbit KBM | Mitra Kampus & Penulis Mitra | `view_all_projects`, `manage_order` ... |
| **`marketing_external`** | Admin Marketing Penerbit Luar KBM | Mitra Umum / Swasta | `view_all_projects`, `manage_order` ... |

## 2. Implementation Logic (`dashboard/page.tsx`)

**Current Logic**:
```typescript
if (perms['view_all_projects'] === 'view') {
    hasViewAll = true;
}

if (!hasViewAll) {
    // Apply Filters (KBM vs Umum)
} else {
    // Show EVERYTHING
}
```

**The Issue (Data Leak)**:
Both roles possess the `view_all_projects` permission in `seed.ts`.
Consequently, the logic sets `hasViewAll = true` for **BOTH** roles.
The filtering logic (lines 46-55) which strictly segments 'kbm' users to KBM projects and 'external' users to Umum projects is **SKIPPED**.

**Result**:
*   Admin Marketing KBM can see "Novel Misteri" (Umum).
*   Admin Marketing External can see "Modul Ajar" (KBM).
*   **This violates the intended data isolation.**

## 3. Recommended Fix

We need to treat `view_all_projects` as "View All **Within Scope**" for these specific roles, or differentiates the permission key.

### Option A: Refine Dashboard Logic (Recommended)
Modify `apps/timeline-management/app/dashboard/page.tsx` to enforce category filters **even if** `hasViewAll` is true, specifically for these known segmented roles.

```typescript
// If KBM Admin, enforce KBM filter even if they have view_all
if (roleId === 'marketing_kbm') {
    whereClause.OR = [{ category: 'kbm' }, { category: 'penulis' }];
}
// If External Admin, enforce Umum filter
else if (roleId === 'marketing_external') {
    whereClause.category = 'umum';
}
// For Super Admin / Finance / Production, leave empty (True View All)
```

### Option B: Split Permissions
Rename `view_all_projects` to `view_kbm_projects` and `view_external_projects`. This requires DB migration/seed update.

## 4. Conclusion
The current implementation works technologically (you can see projects), but fails business logic (segmentation). Fixing the Dashboard logic is required to ensure Admin Marketing KBM only focuses on their assigned sector.
