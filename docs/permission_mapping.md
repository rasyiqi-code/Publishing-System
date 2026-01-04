# Permission Analysis & Mapping

This document maps the defined permissions to the specific Codebase artifacts (`routes`, `components`, `server actions`) in `apps/timeline-management`.

## Legend
- **Route**: Page URL / File Path
- **Action**: Server Action (`actions.ts`)
- **Component**: UI Element (Button/Form)

---

## 1. System & User Management

| Permission | Type | Mapped Feature / Artifact | Notes |
| :--- | :--- | :--- | :--- |
| **`manage users`** | `edit` | **Route**: `/admin/users` (Create/Edit)<br>**Action**: `createUser`, `updateUser` (`app/admin/actions.ts`) | Capability to add new users or modify roles. |
| | `view` | **Route**: `/admin/users` (List View) | Read-only list of users and their roles. |
| **`manage system config`** | `edit` | **Route**: `/admin/settings`<br>**Action**: `updateGlobalSettings` | Changing Brand Name, Default Settings, etc. |
| | `view` | **Route**: `/admin/settings` | Viewing current system configuration. |

## 2. Project Management

| Permission | Type | Mapped Feature / Artifact | Notes |
| :--- | :--- | :--- | :--- |
| **`view all projects`** | `view` | **Route**: `/dashboard` (All Projects)<br>**Logic**: `app/dashboard/page.tsx` | Overrides Author/Category filters to show everything. |
| | `edit` | *N/A (Implicit in `manage order`)* | Usually implies ability to access bulk edit tools if any. |
| **`manage ordered`** | `edit` | **Action**: `createProject`, `updateProject`<br>**Component**: `CreateProjectForm`, `EditProjectForm` | Creating new projects, changing title/author/qty. |
| | `view` | **Route**: `/project/[id]` | Viewing project details (read-only for non-authors). |
| **`manage products`** | `edit` | **Route**: `/admin/products`, `/admin/categories`<br>**Action**: `createProduct`, `createCategory` | Managing Service Packages & Prices. |
| | `view` | **Route**: `/admin/products` | Viewing product list. |
| **`manage digital assets`** | `edit` | **Action**: `updateStepStatus` (After Sales) | Sending certificates and sale links. |
| **`view_segment_institutional`** | `view` | **Scope**: Institutional/Ex-KBM | Enforced in `dashboard/page.tsx`. |
| **`view_segment_general`** | `view` | **Scope**: General/Commercial | Enforced in `dashboard/page.tsx`. |

## 3. Workflow Execution (Step-Based)

These permissions map to specific **Steps** in the timeline service definition and their corresponding `actions`.

| Permission | Type | Mapped Feature / Artifact | Notes |
| :--- | :--- | :--- | :--- |
| **`manage creative flow`** | `edit` | **Action**: `updateStepStatus` (for Creative steps)<br>**Steps**: `cover_design`, `layouting` | Uploading/Updating creative assets. |
| **`submit draft`** | `edit` | **Action**: `updateStepStatus` (for Draft steps)<br>**Steps**: `draft_submission`, `proofreading` | Uploading initial manuscript. |
| **`approve creative`** | `edit` | **Action**: `updateStepStatus` (Approval)<br>**Steps**: `cover_approval`, `layout_approval` | Clicking "Approve" button on design proofs. |
| **`verify dp`** | `view` | **Route**: `/finance/payments` (or Project Detail)<br>**Step**: `dp_verification` | Viewing payment proof. |
| | `edit` | **Action**: `verifyPayment` (`verify_dp`) | Marking DP as "Paid/Verified". |
| **`verify settlement`** | `edit` | **Action**: `verifyPayment` (`settlement`) | Marking Final Payment (Pelunasan) as Verified. |
| **`manage isbn`** | `edit` | **Action**: `updateStepStatus`<br>**Step**: `isbn_process` | Inputting ISBN number. |
| **`manage haki`** | `edit` | **Action**: `updateStepStatus`<br>**Step**: `haki_process` | HAKI registration inputs. |
| **`manage printing`** | `edit` | **Action**: `updateStepStatus`<br>**Step**: `printing_process` | Updating print status (Plate, Cetak, Binding). |
| **`manage logistics`** | `edit` | **Action**: `updateStepStatus`<br>**Step**: `shipping` | Inputting Resi / Delivery status. |
| **`verify auth`** | `view` | **Component**: `AuthGuard` | Viewing protected content. |
| | `edit` | **Action**: `verifySession` | Force session validation (rarely used manually). |

## 4. Reporting

| Permission | Type | Mapped Feature / Artifact | Notes |
| :--- | :--- | :--- | :--- |
| **`view finance reports`** | `view` | **Route**: `/admin/finance` or `/reports`<br>**Component**: `RevenueChart` | Accessing financial dashboards. |

---

## Implementation Status

- [x] **`view all projects`**: Implemented in `app/dashboard/page.tsx` (Dynamic RBAC Check).
- [x] **`manage order` (edit)**: Implemented in `createProject` and `updateProject` (`actions.ts`).
- [x] **`manage order` (view)**: Implicit in Dashboard view.
- [x] **Workflow Permissions**: Implemented generically in `updateStepStatus` via `step.role` check.
    - *Improvement*: Only checks Role ID match. Needs to be updated to check `user.permissions[step.permission_key]` for full flexibility.
- [x] **Admin Routes**: `/admin/*` routes are now **SECURED** with explicit permission gates on each page.
    - `master-data` -> `manage_system_config`
    - `services` -> `manage_system_config`
    - `products` -> `manage_products`
    - `categories` -> `manage_products`
    - `layout` -> `any_admin_permission` + Sidebar Filter
