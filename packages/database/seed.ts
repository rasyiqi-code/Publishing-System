import { PRESET_ROLES } from '@repo/feature-access-control';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting KBM Seed...');

    // 1. Clean up
    await prisma.projectLog.deleteMany();
    await prisma.project.deleteMany();
    await prisma.product.deleteMany();          // Moved up
    await prisma.productCategory.deleteMany();  // Moved up
    await prisma.serviceStep.deleteMany();
    await prisma.serviceDefinition.deleteMany();
    await prisma.masterDataPoint.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();


    // 2. Auth & RBAC Setup (KBM Specific)
    console.log('... creating Roles from Preset (System)');
    for (const role of PRESET_ROLES) {
        await prisma.role.create({
            data: {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: JSON.stringify(role.permissions)
            }
        });
    }

    console.log('... creating Roles from Definition (Operational)');

    const ROLES_DEFINITION = [
        // 1. Admin Marketing Penerbit KBM (Internal)
        {
            id: 'marketing_kbm',
            name: 'Admin Marketing Penerbit KBM',
            description: 'Menangani Mitra Kampus & Penulis Mitra',
            permissions: {
                'view_all_projects': 'view',
                'manage_users': 'view',
                'manage_order': 'edit', // Can input order
                'manage_shipping': 'view',
                'manage_creative_flow': 'edit', // Assign Koordinator
                'submit_draft': 'view',
                'verify_dp': 'view',
                'verify_settlement': 'view'
            }
        },
        // 2. Admin Penerbit KBM (Client - Kampus)
        {
            id: 'admin_kbm',
            name: 'Admin Penerbit KBM',
            description: 'Mitra Institusi / Kampus',
            permissions: {
                'manage_order': 'view',
                'approve_creative': 'edit', // Client ACC
                'submit_draft': 'view'
            }
        },
        // 3. Admin Marketing Penerbit Luar KBM (Internal/External Marketing for General)
        {
            id: 'marketing_external',
            name: 'Admin Marketing Penerbit Luar KBM',
            description: 'Menangani Mitra Umum / Swasta',
            permissions: {
                'view_all_projects': 'view', // Should be limited by logic code, but has view access
                'manage_order': 'edit',
                'manage_shipping': 'view',
                'verify_dp': 'view',
                'verify_settlement': 'view'
            }
        },
        // 4. Admin Penerbit Luar KBM (Client - Umum/Swasta)
        {
            id: 'admin_external',
            name: 'Admin Penerbit Luar KBM',
            description: 'Mitra Umum / Swasta',
            permissions: {
                'manage_order': 'view',
                'approve_creative': 'edit',
                'submit_draft': 'view'
            }
        },
        // 5. Admin Keuangan
        {
            id: 'finance',
            name: 'Admin Keuangan',
            description: 'Validasi Pembayaran',
            permissions: {
                'verify_dp': 'edit',
                'verify_settlement': 'edit',
                'view_finance_reports': 'edit',
                'view_all_projects': 'view'
            }
        },
        // 6. Admin Perijinan
        {
            id: 'legal',
            name: 'Admin Perijinan',
            description: 'ISBN, HAKI, Legalitas',
            permissions: {
                'verify_auth': 'edit',
                'manage_isbn': 'edit',
                'manage_haki': 'edit',
                'view_all_projects': 'view'
            }
        },
        // 7. Admin Cetak
        {
            id: 'production',
            name: 'Admin Cetak',
            description: 'Produksi & Logistik',
            permissions: {
                'manage_printing': 'edit',
                'manage_logistics': 'edit',
                'manage_shipping': 'edit',
                'view_all_projects': 'view'
            }
        },
        // 8. Layouter
        {
            id: 'layouter',
            name: 'Layouter',
            description: 'Staff Layout & Design',
            permissions: {
                'submit_draft': 'edit', // Upload draft assignments
                'manage_creative_flow': 'view'
            }
        },
        // 9. Kordinator Layout
        {
            id: 'layout_coordinator',
            name: 'Kordinator Layout',
            description: 'Lead Creative',
            permissions: {
                'manage_creative_flow': 'edit', // Assign to layouter
                'submit_draft': 'edit',
                'approve_creative': 'view'
            }
        }
    ];

    for (const role of ROLES_DEFINITION) {
        await prisma.role.create({
            data: {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: JSON.stringify(role.permissions)
            }
        });
    }


    console.log('... creating Users');

    const users = [
        // Level A: Superuser
        { email: 'admin@spt.com', name: 'Super Admin (Owner)', roleId: 'super_admin' },

        // 1. Marketing KBM
        { email: 'marketing_kbm@spt.com', name: 'Staff Marketing KBM', roleId: 'marketing_kbm' },

        // 2. Admin KBM (Client)
        { email: 'klien_kbm@spt.com', name: 'Admin Universitas Terbuka', roleId: 'admin_kbm' },

        // 3. Marketing External
        { email: 'marketing_ext@spt.com', name: 'Staff Marketing Umum', roleId: 'marketing_external' },

        // 4. Admin External (Client)
        { email: 'klien_umum@spt.com', name: 'Admin Indie Publisher X', roleId: 'admin_external' },

        // 5. Finance
        { email: 'finance@spt.com', name: 'Staff Keuangan', roleId: 'finance' },

        // 6. Legal
        { email: 'legal@spt.com', name: 'Staff Perijinan', roleId: 'legal' },

        // 7. Production
        { email: 'production@spt.com', name: 'Staff Cetak', roleId: 'production' },

        // 8. Layouter
        { email: 'layouter@spt.com', name: 'Budi Layouter', roleId: 'layouter' },

        // 9. Coordinator
        { email: 'coord_layout@spt.com', name: 'Siti Kordinator', roleId: 'layout_coordinator' },
    ];

    for (const u of users) {
        await prisma.user.create({
            data: {
                email: u.email,
                name: u.name,
                roleId: u.roleId,
                password: 'password' // Default password
            }
        });
    }

    // 3. Master Data (Bahan Baku Workflow)
    console.log('... creating Master Data');
    const masterData = [
        // Phase 1: Draft & Kontrak
        { id: 'input_order', label: 'Input Order', role: 'marketing_kbm', group: 'marketing' },
        { id: 'upload_legal', label: 'Upload Dokumen Legalitas', role: 'marketing_kbm', group: 'marketing' },

        // Phase 2: Gembok Finansial 1
        { id: 'dp_confirm', label: 'Konfirmasi DP', role: 'finance', group: 'finance' },

        // Phase 3: Produksi Kreatif
        { id: 'assign_layout', label: 'Assign Koordinator', role: 'marketing_kbm', group: 'marketing' },
        { id: 'upload_draft', label: 'Upload Draft Layout', role: 'layout_coordinator', group: 'production' },
        { id: 'client_acc', label: 'ACC Final (Klien)', role: 'admin_kbm', group: 'client' }, // Or Penulis Mitra

        // Phase 4: Paralel Legalitas
        { id: 'isbn_input', label: 'Input ISBN & HAKI', role: 'legal', group: 'legal' },

        // Phase 5: Gembok Finansial 2 & Manufaktur
        { id: 'upload_print_file', label: 'Upload File Siap Cetak', role: 'production', group: 'production' },
        { id: 'full_payment', label: 'Konfirmasi Pelunasan', role: 'finance', group: 'finance' },
        { id: 'print_exec', label: 'Naik Cetak', role: 'production', group: 'production' },

        // Phase 6: Closing
        { id: 'shipping_resi', label: 'Input Resi Pengiriman', role: 'production', group: 'logistics' },

        // Phase 7: Digital Assets (After Sales)
        { id: 'send_certificate', label: 'Tanggal Kirim Sertifikat', role: 'admin_kbm', group: 'digital_assets' },
        { id: 'send_sale_link', label: 'Tanggal Kirim Link Penjualan', role: 'marketing_kbm', group: 'digital_assets' },
        { id: 'send_testimony_link', label: 'Tanggal Kirim Link Testimoni', role: 'marketing_kbm', group: 'digital_assets' },

        // Specs (Data Only)
        { id: 'spec_kertas', label: 'Jenis Kertas', role: 'marketing_kbm', group: 'specs', inputType: 'text' },
        { id: 'spec_cover', label: 'Jenis Cover', role: 'marketing_kbm', group: 'specs', inputType: 'text' },
        { id: 'spec_dimensi', label: 'Ukuran Buku', role: 'marketing_kbm', group: 'specs', inputType: 'text' },
        { id: 'spec_finishing', label: 'Finishing', role: 'marketing_kbm', group: 'specs', inputType: 'text' },
    ];

    await prisma.masterDataPoint.createMany({ data: masterData });

    // 4. Service Definitions (Resep Workflow)
    console.log('... creating Services');

    // SPT Workspace (Full Package)
    const sptFull = await prisma.serviceDefinition.create({
        data: { id: 'spt_full', name: 'SPT - Full Package', uiMode: 'timeline' }
    });

    // Sequence for SPT
    const sptSequence = [
        'input_order',
        'upload_legal',
        'dp_confirm',      // Locks creative
        'assign_layout',
        'upload_draft',
        'client_acc',
        'isbn_input',
        'full_payment',    // Locks print
        'upload_print_file',
        'print_exec',
        'shipping_resi'
    ];

    for (const [index, stepId] of sptSequence.entries()) {
        let rule = null;
        if (stepId === 'assign_layout') rule = JSON.stringify({ required: 'dp_confirm' }); // Gembok 1
        if (stepId === 'print_exec') rule = JSON.stringify({ required: 'full_payment' }); // Gembok 2

        await prisma.serviceStep.create({
            data: {
                serviceId: sptFull.id,
                dataPointId: stepId,
                stepOrder: index + 1,
                dependencyRule: rule
            }
        });
    }

    // Satuan Workspace (Print Only)
    const satuanPrint = await prisma.serviceDefinition.create({
        data: { id: 'satuan_print', name: 'Layanan Satuan - Cetak Saja', uiMode: 'ticket' }
    });

    const satuanSequence = [
        'upload_print_file', // Reused from master data
        'full_payment',
        'print_exec',
        'shipping_resi'
    ];

    await prisma.serviceStep.createMany({
        data: satuanSequence.map((stepId, index) => ({
            serviceId: satuanPrint.id,
            dataPointId: stepId,
            stepOrder: index + 1
        }))
    });

    // 5. Products (Definisi Paket)
    console.log('... creating Products');

    // Category: Paket Penerbitan
    const catPenerbitan = await prisma.productCategory.create({
        data: {
            name: 'Paket Penerbitan',
            slug: 'paket_penerbitan',
            order: 1
        }
    });

    const products = [
        {
            name: 'Nusantara',
            price: 500000,
            features: JSON.stringify(['5 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Wrapping', 'Terbit 30 Hari', 'E-Certificate']),
            specs: JSON.stringify({ quantity: 5, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Terima Beres',
            price: 1000000,
            features: JSON.stringify(['5 Eksemplar', 'Layout & Cover Premium', 'ISBN & Barcode', 'Hard Cover (Optional)', 'Promosi Media Sosial']),
            specs: JSON.stringify({ quantity: 5, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Mataram',
            price: 1250000,
            features: JSON.stringify(['25 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Bonus 2 Eks', 'Gratis Ongkos Kirim']),
            specs: JSON.stringify({ quantity: 25, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Majapahit',
            price: 2250000,
            features: JSON.stringify(['50 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Bonus 2 Eks', 'Gratis Ongkos Kirim', 'Royalty 25%']),
            specs: JSON.stringify({ quantity: 50, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Pajajaran',
            price: 3750000,
            features: JSON.stringify(['100 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Bonus 2 Eks', 'Gratis Ongkos Kirim', 'Royalty 25%']),
            specs: JSON.stringify({ quantity: 100, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Sriwijaya',
            price: 5025000,
            features: JSON.stringify(['150 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Bonus 3 Eks', 'Gratis Ongkos Kirim', 'Royalty 25%']),
            specs: JSON.stringify({ quantity: 150, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Samudera Pasai',
            price: 7500000,
            features: JSON.stringify(['300 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Bonus 5 Eks', 'Gratis Ongkos Kirim', 'Royalty 25%']),
            specs: JSON.stringify({ quantity: 300, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        },
        {
            name: 'Kutai Kartanegara',
            price: 10000000,
            features: JSON.stringify(['500 Eksemplar', 'Layout & Cover', 'ISBN & Barcode', 'Bonus 10 Eks', 'Gratis Ongkos Kirim', 'Royalty 25%']),
            specs: JSON.stringify({ quantity: 500, size: 'A5/Unesco', pages: 'Up to 150' }),
            serviceId: sptFull.id
        }
    ];

    for (const p of products) {
        await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                features: p.features,
                specs: p.specs,
                serviceId: p.serviceId,
                categoryId: catPenerbitan.id
            }
        });
    }

    // Category: Layanan Satuan
    const catSatuan = await prisma.productCategory.create({
        data: {
            name: 'Layanan Satuan',
            slug: 'layanan_satuan',
            order: 2
        }
    });

    const satuanProducts = [
        {
            name: 'Cover Jalur Cepat',
            price: 125000,
            features: JSON.stringify(['1 Hari Jadi', '1 Pilihan Cover', 'Revisi Minor 1x', 'File JPG/PDF']),
            specs: JSON.stringify({ quantity: 1, type: 'Digital' }),
            serviceId: satuanPrint.id
        },
        {
            name: 'Jasa Layout (Mitra)',
            price: 500,
            features: JSON.stringify(['Harga Per Halaman', 'Sesuai Ukuran', 'Standar Penerbitan']),
            specs: JSON.stringify({ unit: 'per_page' }),
            serviceId: satuanPrint.id
        },
        {
            name: 'Jasa Cetak Isi (Mitra)',
            price: 75,
            features: JSON.stringify(['Harga Per Halaman', 'BW / Bookpaper 57gr', 'Kualitas Cetak Tinggi']),
            specs: JSON.stringify({ unit: 'per_page', paper: 'Bookpaper 57gr' }),
            serviceId: satuanPrint.id
        },
        {
            name: 'Desain Cover (Mitra)',
            price: 75000,
            features: JSON.stringify(['Harga Per Jilid', '1 Pilihan Opsional', 'Standar KBM']),
            specs: JSON.stringify({ type: 'Design' }),
            serviceId: satuanPrint.id
        },
        {
            name: 'Finishing (Mitra)',
            price: 5500,
            features: JSON.stringify(['Harga Per Eksemplar', 'Jilid Lem Panas', 'Wrapping Plastik']),
            specs: JSON.stringify({ type: 'Finishing' }),
            serviceId: satuanPrint.id
        }
    ];

    for (const p of satuanProducts) {
        await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                features: p.features,
                specs: p.specs,
                serviceId: p.serviceId,
                categoryId: catSatuan.id
            }
        });
    }

    // 6. Create Dummy Projects
    console.log('... creating Projects');

    // Project KBM (Institusi)
    await prisma.project.create({
        data: {
            id: 'SPT-KBM-001',
            title: 'Modul Ajar Teknik Informatika',
            authorName: 'Universitas Terbuka',
            authorId: (await prisma.user.findUnique({ where: { email: 'klien_kbm@spt.com' } }))?.id || '',
            serviceId: 'spt_full',
            status: 'active',
            publisher: 'Penerbit KBM',
            // @ts-ignore
            category: 'kbm',
            quantity: 1000,
            logs: {
                create: [
                    { dataPointId: 'input_order', value: '2025-01-01', status: 'completed' },
                    { dataPointId: 'upload_legal', value: 'active', status: 'active' },
                    // Specs
                    { dataPointId: 'spec_kertas', value: 'Bookpaper 57gr', status: 'completed' },
                    { dataPointId: 'spec_cover', value: 'Softcover Doff', status: 'completed' },
                    { dataPointId: 'spec_dimensi', value: 'A5 (14 x 21cm)', status: 'completed' },
                    { dataPointId: 'spec_finishing', value: 'Wrap Shrink', status: 'completed' }
                ]
            }
        }
    });

    // Project Umum (Swasta) - Satuan
    await prisma.project.create({
        data: {
            id: 'SAT-UMUM-001',
            title: 'Novel Misteri Tahun Baru',
            authorName: 'Indie Publisher X',
            authorId: (await prisma.user.findUnique({ where: { email: 'klien_umum@spt.com' } }))?.id || '',
            serviceId: 'satuan_print',
            status: 'active',
            publisher: 'Indie X',
            // @ts-ignore
            category: 'umum',
            quantity: 50,
            logs: {
                create: [
                    { dataPointId: 'upload_print_file', value: 'active', status: 'active' }
                ]
            }
        }
    });

    console.log('✅ KBM Seed Completed Successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
