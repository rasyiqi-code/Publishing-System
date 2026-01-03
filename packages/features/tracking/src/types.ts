export type PhaseStatus = 'locked' | 'active' | 'completed' | 'warning' | 'critical';

export interface DataPoint {
    id: number;
    label: string;
    value: string | number | Date | null;
    required: boolean;
    phaseId: number;
    lastUpdated?: Date;
    updatedBy?: string;
    notes?: string;
}

export interface Phase {
    id: number;
    name: string;
    description: string;
    status: PhaseStatus;
    progress: number; // 0-100
    dataPoints: number[]; // IDs of data points in this phase
    isLocked: boolean;
}

export type SPTData = Record<number, DataPoint>;

// 27 Data Points Definition
export const DATA_POINT_CONFIG: Record<number, Omit<DataPoint, 'value' | 'lastUpdated' | 'updatedBy'>> = {
    // Phase 1: Order & DP
    1: { id: 1, label: 'Tanggal Order', required: true, phaseId: 1 },
    2: { id: 2, label: 'Nama Penulis', required: true, phaseId: 1 },
    3: { id: 3, label: 'Judul Naskah', required: true, phaseId: 1 },
    4: { id: 4, label: 'Paket Penerbitan', required: true, phaseId: 1 },
    5: { id: 5, label: 'Kontak Penulis', required: true, phaseId: 1 },
    6: { id: 6, label: 'Alamat Penulis', required: true, phaseId: 1 },
    7: { id: 7, label: 'Nominal DP', required: true, phaseId: 1 },
    8: { id: 8, label: 'Tanggal Input DP (Finance)', required: true, phaseId: 1 },

    // Phase 1: Pre-Production
    14: { id: 14, label: 'Form Keaslian Naskah', required: true, phaseId: 1 },

    // Phase 2: Distribution & Layout
    10: { id: 10, label: 'Tanggal Kirim Naskah ke Layouter', required: true, phaseId: 2 },
    11: { id: 11, label: 'Tanggal Kirim Brief Cover', required: true, phaseId: 2 },
    12: { id: 12, label: 'Draft Layout Uploaded', required: false, phaseId: 2 },
    13: { id: 13, label: 'Feedback/Revisi Penulis', required: false, phaseId: 2 },

    // Phase 2: Approval
    25: { id: 25, label: 'ACC Final Penulis', required: true, phaseId: 2 },

    // Phase 3: Legal
    15: { id: 15, label: 'Tanggal Pengajuan ISBN', required: true, phaseId: 3 },
    16: { id: 16, label: 'Nomor ISBN', required: true, phaseId: 3 },
    17: { id: 17, label: 'Tanggal Pengajuan HAKI', required: false, phaseId: 3 },
    18: { id: 18, label: 'Nomor HAKI', required: false, phaseId: 3 },
    19: { id: 19, label: 'Status HAKI', required: false, phaseId: 3 },

    // Phase 4: Payment & Spec
    9: { id: 9, label: 'Tanggal Pelunasan (Finance)', required: true, phaseId: 4 },
    23: { id: 23, label: 'Spesifikasi Cetak Final', required: true, phaseId: 4 },

    // Phase 4: Production
    26: { id: 26, label: 'Tanggal Naik Cetak', required: true, phaseId: 4 },

    // Phase 5: Delivery
    20: { id: 20, label: 'Sertifikat Penulis (Digital)', required: true, phaseId: 5 },
    21: { id: 21, label: 'Link Penjualan Buku', required: true, phaseId: 5 },
    22: { id: 22, label: 'E-Book / Aset Digital Lain', required: false, phaseId: 5 },
    24: { id: 24, label: 'Alamat Pengiriman Buku', required: true, phaseId: 5 },
    27: { id: 27, label: 'Nomor Resi Pengiriman', required: true, phaseId: 5 },
};

export const PHASES_CONFIG: Phase[] = [
    { id: 1, name: 'Pra-Produksi & Finance', description: 'Verifikasi Order & DP', status: 'locked', progress: 0, dataPoints: [1, 2, 3, 4, 5, 6, 7, 8, 14], isLocked: false },
    { id: 2, name: 'Pengembangan Kreatif', description: 'Layout, Desain & Revisi', status: 'locked', progress: 0, dataPoints: [10, 11, 12, 13, 25], isLocked: true },
    { id: 3, name: 'Administrasi Legal', description: 'ISBN & HAKI', status: 'locked', progress: 0, dataPoints: [15, 16, 17, 18, 19], isLocked: true },
    { id: 4, name: 'Produksi Fisik', description: 'Cetak & Penjilidan', status: 'locked', progress: 0, dataPoints: [9, 23, 26], isLocked: true },
    { id: 5, name: 'Logistik & Distribusi', description: 'Pengiriman & Aset Digital', status: 'locked', progress: 0, dataPoints: [20, 21, 22, 24, 27], isLocked: true },
];
