# Permission Completeness Analysis

Based on the comparison between your provided list and the application features (`seed.ts` + `admin routes`), here are the findings:

## 1. Missing Areas (Gaps)

### A. Digital Assets / After Sales (Phase 7)
The workflow includes steps for sending certificates and sales links after completion.
*   **Current Steps**: `send_certificate`, `send_sale_link`, `send_testimony_link`
*   **Missing Permission**: You have no permission covering "Digital Delivery" or "After Sales".
*   **Recommendation**: Add **`manage_digital_assets (edit/view)`**.

### B. Product & Catalog Management
Currently, you have `manage system config` and `manage order`.
*   **Feature**: Managing "Paket Penerbitan" (Products), Prices, and Categories (`/admin/products`).
*   **Ambiguity**: Does this fall under `manage_system_config` (IT Admin) or `manage_order` (Sales Admin)?
*   **Recommendation**: Add **`manage_products (edit/view)`** to distinguish between "Technical Settings" and "Commercial Catalog".

### C. Legal Documents (Pre-Production)
*   **Current Steps**: `upload_legal` (Upload Dokumen Legalitas - Phase 1).
*   **Ambiguity**: You have `manage_isbn` and `manage_haki`, but this is usually general contract/MoU.
*   **Recommendation**: Can map to `manage_order`, or add **`manage_contracts (edit/view)`**.

## 2. Refined Permission List Recommendation

To be 100% complete, I suggest adding the following **[NEW]** items to your list:

| Permission | Type | Usage |
| :--- | :--- | :--- |
| **`manage_digital_assets`** | `edit` | Sending E-Certificates, Sale Links, Testimony forms. |
| **`manage_products`** | `edit` | Creating/Editing Products, Prices, and Categories. |
| **`manage_contracts`** | `edit` | (Optional) If separate from Order taking, for Legal Doc upload. |

## 3. Completeness Verification Table

| App Feature | Your Permission | Status |
| :--- | :--- | :--- |
| dashboard | `view_all_projects` | ✅ Covered |
| create project | `manage_order` | ✅ Covered |
| admin/users | `manage_users` | ✅ Covered |
| admin/services | `manage_system_config` | ✅ Covered |
| admin/master-data| `manage_system_config` | ✅ Covered |
| **admin/products** | ??? | ⚠️ Ambiguous (Rec: `manage_products`) |
| step: shipping | `manage_shipping` | ✅ Covered |
| step: printing | `manage_printing` | ✅ Covered |
| step: draft | `submit_draft` | ✅ Covered |
| step: layout | `manage_creative_flow`| ✅ Covered |
| step: finance | `verify_dp`, `settlement`| ✅ Covered |
| **step: after sales**| ??? | ❌ Missing (`manage_digital_assets`) |

**Conclusion**: Your list is **90% Complete**. Adding `manage_digital_assets` and `manage_products` will make it 100%.
