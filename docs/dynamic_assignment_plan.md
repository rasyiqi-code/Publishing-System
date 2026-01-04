# Plan: Dynamic Admin Assignment (Adaptive System)

## 1. Goal
Implement a flexible assignment system that defaults to "Client-Centric" logic but allows manual "Dynamic Overrides".

## 2. Default Logic (The "Base Rule")
*   **User Category** determines the default Admin Group.
    *   User `mitra_kampus` -> Project Category `kbm` -> Manager: **Admin KBM**.
    *   User `mitra_umum` -> Project Category `umum` -> Manager: **Admin Non-KBM**.

## 3. Dynamic Override (The "Adaptivity")
We introduce a mechanism to override this default.
*   **New Field**: Add `managedBy` (String?) to `Project` model.
*   **Behavior**:
    *   If `managedBy` is NULL -> Use Default Rule.
    *   If `managedBy` is SET (e.g., 'marketing_external') -> That specific role/group manages it, regardless of the Client Category.

## 4. Implementation Steps

### Step 1: Schema Update (Optional / Phase 2)
To fully support manual assignment, we would add:
```prisma
model Project {
  ...
  managedBy String? // Override: 'marketing_kbm', 'marketing_external'
}
```
*(For now, we can rely on the existing `category` field if we just want to change the category manually).*

### Step 2: Logic Refactor (`dashboard/page.tsx`)
Create a standardized "Visibility Resolver" function to replace the hardcoded `if/else`.

```typescript
// lib/permissions.ts
export function getProjectVisibilityFilter(userRole: Role) {
    if (userRole.permissions['view_all_projects']) {
       // Check for SCOPED view_all
       if (userRole.id === 'marketing_kbm') return { 
           OR: [ { category: 'kbm' }, { category: 'penulis' }, { managedBy: 'marketing_kbm' } ] 
       };
       if (userRole.id === 'marketing_external') return { 
           OR: [ { category: 'umum' }, { managedBy: 'marketing_external' } ] 
       };
       return {}; // True View All (Super Admin)
    }
    // ... default author filter
}
```

## 5. Answer to User
"Yes, we can make it Adaptive. We use the Client Category as the default, but we can add a 'Managed By' override for special cases."
