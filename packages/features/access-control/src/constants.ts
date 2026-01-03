import { Permission, Role, ModuleId } from './types';

// Master Permissions Configuration
export const MASTER_PERMISSIONS: Permission[] = [
    // A. System & User Management
    { id: 'manage_users', label: 'Kelola User & Role', moduleId: 'system', description: 'Buat/Edit User dan Role' },
    { id: 'manage_system_config', label: 'Konfigurasi Sistem', moduleId: 'system', description: 'Master Data, Services, & Products' },
    { id: 'view_all_projects', label: 'Lihat Semua Project', moduleId: 'system', description: 'Melihat semua project tanpa perlu ditugaskan' },

    // B. Order & Administration
    { id: 'manage_order', label: 'Kelola Order (Data 1-7)', moduleId: 'order', description: 'Data Client, Paket, Detail Naskah' },
    { id: 'manage_shipping', label: 'Kelola Pengiriman (Data 27)', moduleId: 'order', description: 'Alamat Kirim & Resi' },

    // C. Finance
    { id: 'verify_dp', label: 'Verifikasi DP (Data 8 & 30)', moduleId: 'finance', description: 'Validasi Bukti Bayar DP' },
    { id: 'verify_settlement', label: 'Verifikasi Pelunasan (Data 9 & 31)', moduleId: 'finance', description: 'Validasi Bukti Bayar Pelunasan' },
    { id: 'view_finance_reports', label: 'Lihat Laporan Keuangan', moduleId: 'finance', description: 'Omzet dan Status Pembayaran' },

    // D. Creative (Dapur Kreatif)
    { id: 'manage_creative_flow', label: 'Assign Tim Kreatif', moduleId: 'creative', description: 'Menunjuk Layouter/Desainer (Data 10-13)' },
    { id: 'submit_draft', label: 'Upload Draft/Preview', moduleId: 'creative', description: 'Upload Preview Layout/Cover' },
    { id: 'approve_creative', label: 'Approval Final (Data 25/39)', moduleId: 'creative', description: 'ACC Final / Upload File Siap Cetak' },

    // E. Legal (Legalitas)
    { id: 'manage_isbn', label: 'Input ISBN', moduleId: 'legal', description: 'Submit & Input ISBN (Data 16-17)' },
    { id: 'manage_haki', label: 'Input HAKI', moduleId: 'legal', description: 'Pendaftaran & Sertifikat HAKI (Data 18-19)' },
    { id: 'verify_auth', label: 'Verifikasi Keaslian', moduleId: 'legal', description: 'Cek Surat Keaslian Naskah (Data 14)' },

    // F. Production
    { id: 'manage_printing', label: 'Kelola Cetak', moduleId: 'production', description: 'Set Spesifikasi & Naik Cetak (Data 23, 26)' },
    { id: 'manage_logistics', label: 'Logistik', moduleId: 'production', description: 'Input Resi / Tracking (Data 27)' },
];


export const PRESET_ROLES: Role[] = [
    // 0. Super Admin (Full Access / IT Owner)
    {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Akses Penuh (Owner / IT)',
        isSystem: true,
        permissions: MASTER_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.id]: 'edit' }), {})
    }
];

export const MODULE_LABELS: Record<ModuleId | 'system', string> = {
    system: 'System & Admin',
    order: 'Administrasi & Order',
    finance: 'Keuangan',
    creative: 'Dapur Kreatif (Layout/Cover)',
    legal: 'Legalitas (ISBN/HAKI)',
    production: 'Produksi & Logistik'
};
