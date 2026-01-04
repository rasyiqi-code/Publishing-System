# Route Permission Analysis

This document analyzes the access control implementation for key application routes requested by the user.

## 1. Summary of Findings

| Route | Auth Guard | Role/Permission Check | Status | Logic Location |
| :--- | :--- | :--- | :--- | :--- |
| `public /` | None | None | ✅ Public | `app/page.tsx` |
| `/?track={id}` | None | None (Public Data) | ✅ Public | `app/page.tsx` |
| `/dashboard` | Implicit | **Robust** (Dynamic permissions) | ✅ Secure | `app/dashboard/page.tsx` |
| `/project/[id]` | Session | **Robust** (Author OR `view_all`) | ✅ Secure | `app/project/[id]/page.tsx` |
| `/admin` | Session | **Weak** (`Active Role` only) | ⚠️ Partial | `app/admin/layout.tsx` |
| `/admin/master-data` | Derived | **Missing** | ❌ Insecure | `app/admin/master-data/page.tsx` |
| `/admin/services` | Derived | **Missing** | ❌ Insecure | `app/admin/services/page.tsx` |
| `/admin/products` | Derived | **Missing** | ❌ Insecure | `app/admin/products/page.tsx` |
| `/admin/categories` | Derived | **Missing** | ❌ Insecure | `app/admin/categories/page.tsx` |

## 2. Detailed Vulnerability Analysis

### A. Admin Dashboard (`/admin`) & Sub-routes
**Current Logic (`app/admin/layout.tsx`)**:
```typescript
if (Object.keys(permissions).length === 0) { redirect('/'); }
```
*   **The Issue**: ANY user with ANY permission (e.g., a "Layout Coordinator" who only has `manage_creative_flow`) can access `/admin` and clicking on links to `/admin/master-data`.
*   **The Sub-pages**: `master-data/page.tsx`, `services/page.tsx` etc., do **not** perform any additional checks. They rely solely on the layout's weak check.
*   **Impact**: A Layouter could theoretically browse and (if UI allows) attempt to edit Master Data or Product Prices, though Server Actions *might* block them (needs verification).

### B. Project Detail (`/project/[id]`)
**Current Logic**:
```typescript
canViewAll = userRoleDef.id === 'super_admin' || !!perms?.['view_all_projects'];
if (!canViewAll && project.authorId !== sessionUserId) return notFound();
```
*   **Status**: **Secure**. It correctly isolates data between clients and staff.

### C. Public Tracking (`/?track=`)
*   **Current Logic**: Renders public tracking view if ID exists.
*   **Status**: **Secure**. Intended public behavior.

## 3. Recommended Fixes

### Fix 1: Strengthen `AdminLayout` / Add Page-Level Guards
We need to ensure that specific admin sub-pages require specific permissions.

**Proposed Logic for `MasterData`, `Services` (System Config group):**
```typescript
// app/admin/master-data/page.tsx
const session = await auth();
const role = await prisma.role.findUnique({ ... });
const perms = JSON.parse(role.permissions);

if (perms['manage_system_config'] !== 'edit' && role.id !== 'super_admin') {
    return <div>Unauthorized</div>; // or redirect
}
```

**Proposed Logic for `Products`, `Categories` (Commercial group):**
```typescript
if (perms['manage_order'] !== 'edit' && ... ) { ... }
```
(Or a new `manage_products` permission if we want to separate it).

### Fix 2: Refactor Admin Layout Sidebar
The Sidebar should strictly hide links that the user doesn't have permissions for.

## 4. Server Action Validation (Double Check)
We must ensure `admin/actions.ts` (createProduct, updateMasterData) enforces these permissions again on the server side, just in case someone bypasses the UI.

*   `createService`, `updateMasterData` -> Should require `manage_system_config`.
*   `createProduct` -> Should require `manage_order` (or similar).

**Next Step**: Apply "Fix 1" to the Admin sub-pages to secure them immediately.
