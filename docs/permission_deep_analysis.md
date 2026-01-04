# Deep Analysis: Permission System vs. Requirement

## 1. Executive Summary
The current system operates on a **Role-Based** locking mechanism (`Role ID Match`), whereas the requirement demands a **Capability-Based** locking mechanism (`Permission Key Match`).

Currently, a step like "Konfirmasi DP" is hardcoded to belong to the `finance` role. If a user has the `verify_dp` permission but their role ID is not `finance` (e.g., `super_marketing`), they are blocked. This breaks the flexibility of the dynamic RBAC system you are building.

## 2. Gap Analysis

| Feature | Current Implementation | Requirement | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Logic Basis** | `user.role.id === step.role_id` | `user.permissions.includes(step.permission)` | **Critical** |
| **Flexibility** | Rigid. Only the 'owner' role can act. | Flexible. Any role with the right permission can act. | **High** |
| **Schema** | `MasterDataPoint` stores `role` (ID). | `MasterDataPoint` needs to map to a `permission`. | **Medium** |
| **Validation** | Hardcoded check in `actions.ts`. | Needs dynamic lookup in `actions.ts`. | **Medium** |

## 3. Detailed Mapping (Step ID to Permission Key)

To bridge this gap, we must map every Step ID (from `MasterData`) to the specific Permission Key defined in your requirement.

| Step ID (DB) | Existing Owner (Role ID) | Required Permission (New) |
| :--- | :--- | :--- |
| `input_order` | `marketing_kbm` | `manage_order` |
| `upload_legal` | `marketing_kbm` | `manage_order` (or `manage_legal`?) |
| `dp_confirm` | `finance` | `verify_dp` |
| `assign_layout` | `marketing_kbm` | `manage_creative_flow` |
| `upload_draft` | `layout_coordinator` | `submit_draft` |
| `client_acc` | `admin_kbm` | `approve_creative` |
| `isbn_input` | `legal` | `manage_isbn` |
| `upload_print_file` | `production` | `manage_printing` |
| `full_payment` | `finance` | `verify_settlement` |
| `print_exec` | `production` | `manage_printing` |
| `shipping_resi` | `production` | `manage_shipping` |
| `send_certificate` | `admin_kbm` | `manage_order` (or `digital_delivery`) |
| `spec_*` (All Specs) | `marketing_kbm` | `manage_order` |

## 4. Technical Recommendation

We can fix this **without** a massive database migration immediately by implementing a **Mapping Layer** in the `updateStepStatus` server action.

### Plan of Action:
1.  **Define the Map**: Create a constant object `STEP_PERMISSION_MAP` in `actions.ts`.
2.  **Refactor Authorization Logic**:
    *   Fetch the user's `Role` (and its `permissions` JSON).
    *   Look up the required permission for the current `stepId`.
    *   Check if `userPermissions[requiredPermission] === 'edit'`.
3.  **Fallback**: If the step is not in the map, fall back to the existing `Role ID` check (backward compatibility).

### Impact
*   **Admins**: `super_admin` retains full access.
*   **Multi-Role Users**: A "Manager" role with `verify_dp` and `manage_order` can now execute both Finance and Marketing steps without switching accounts.
*   **Security**: More granular control. You can revoke `verify_dp` from a user without changing their entire role.
