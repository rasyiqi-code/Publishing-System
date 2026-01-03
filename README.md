# Universal Timeline & Tracking System (UTTS)
## Satuan Penerbit Terpadu (SPT)

**UTTS** adalah platform manajemen proyek penerbitan berbasis timeline yang dirancang untuk Penerbit KBM. Sistem ini memadukan **Project Management** internal (untuk staff) dan **Public Tracking** (untuk klien/penulis), menggunakan arsitektur **Monorepo** yang modern dan scalable.

![License](https://img.shields.io/badge/license-Private-red.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)

---

## 🚀 Fitur Utama

### 1. Dual-Mode Workspace
Sistem membedakan antarmuka berdasarkan jenis layanan:
- **Full SPT (Timeline View)**: Untuk proyek penerbitan lengkap (Naskah -> Buku Jadi). Menampilkan 5 Fase Workflow.
- **Satuan (Ticket View)**: Untuk layanan eceran (Cetak Saja / Desain Saja). Tampilan lebih ringkas seperti tiket antrean.

### 2. Dynamic Gating & Rule Engine
Tidak ada langkah yang bisa diloncati tanpa izin.
- **Workflow Gating**: Langkah selanjutnya terkunci (Locked) sampai langkah prasyarat selesai (misal: "Assign Layout" terkunci sebelum "Konfirmasi DP").
- **Role-Based Access**: Tombol aksi hanya muncul untuk Role yang berwenang (misal: tombol "Validasi Bayar" hanya untuk Finance).

### 3. Database-Driven RBAC
Sistem Access Control yang sepenuhnya dinamis.
- **Role & Permission disimpan di Database**: Tidak ada hardcoded logic `isAdmin` di kode.
- **Capability-Based**: Pengecekan dilakukan berdasarkan kemampuan (e.g., `can('verify_dp')`), bukan nama role.
- **Single System Preset**: Hanya `Super Admin` yang dikunci dari kode. Role operasional lain (Finance, Marketing, dll) bisa diedit via Admin Panel.

### 4. Public Tracking
Halaman pelacakan publik yang bisa diakses user tanpa login.
- Cukup masukkan **Project ID** di halaman depan.
- Menampilkan progress realtime tanpa mengekspos data sensitif internal.

---

## 🛠 Teknologi

Project ini dibangun menggunakan **TurboRepo** (Monorepo) dengan stack:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (Dev) / PostgreSQL (Prod) via Prisma ORM
- **Styling**: Tailwind CSS + Shadcn UI
- **Auth**: NextAuth.js (Database Session)
- **Package Manager**: pnpm

### Struktur Monorepo
```
.
├── apps/
│   ├── main-site/          # Landing Page & Admin Panel (RBAC Management)
│   └── timeline-management/# Aplikasi Utama (Project Workflow Dashboard)
├── packages/
│   ├── database/           # Prisma Schema & Seed Scripts
│   ├── features/           # Modular Features (Timeline Engine, Access Control)
│   ├── ui/                 # Shared UI Components
│   └── auth/               # Shared Authentication Logic
```

---

## 🏁 Mulai (Getting Started)

### 1. Prasyarat
- Node.js >= 18
- pnpm (`npm install -g pnpm`)

### 2. Instalasi
```bash
# Install dependencies
pnpm install
```

### 3. Setup Lingkungan (Environment)
Copy file `.env.example` ke `.env` di root (jika ada) atau pastikan variabel berikut tersedia:
```env
# Di apps/timeline-management/.env dan apps/main-site/.env
DATABASE_URL="file:../../packages/database/dev.db"
NEXTAUTH_SECRET="supersecret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Inisialisasi database dan isi dengan data awal (Role, User, Master Data).
```bash
# Dari root
pnpm db:push --force-reset
pnpm db:seed
```

### 5. Jalankan Development Server
```bash
pnpm dev
# Aplikasi akan berjalan di:
# - Main Site: http://localhost:3000
# - Timeline App: http://localhost:3001 (Port bisa bervariasi tergantung turbo)
```

---

## 👥 Role & Akses (Default Seed)

Gunakan akun berikut untuk login (Password default: `password`).

| Role ID | Email | Deskripsi |
| :--- | :--- | :--- |
| **Super Admin** | `admin@spt.com` | Akses Penuh Sistem & Konfigurasi |
| **Marketing KBM** | `marketing_kbm@spt.com` | Input Order, Kelola Klien KBM |
| **Marketing Umum** | `marketing_ext@spt.com` | Input Order, Kelola Klien Umum |
| **Finance** | `finance@spt.com` | Validasi Pembayaran (DP/Lunas) |
| **Legal** | `legal@spt.com` | Input ISBN & HAKI |
| **Produksi** | `production@spt.com` | Kelola Cetak & Logistik |
| **Layouter** | `layouter@spt.com` | Upload Draft & Revisi |
| **Admin Klien** | `klien_kbm@spt.com` | Akun milik Kampus (View Only / ACC) |

---

## 🔒 Security Note

- **Git Standard**: Repository ini menggunakan `.gitignore` yang ketat. File sensitif (`.env`, `*.db`) dan folder build (`node_modules`, `.next`) tidak akan ter-upload.
- **Factory Reset**: Fitur "Reset Roles" di Admin Panel telah dinonaktifkan untuk keamanan production. Reset hanya bisa dilakukan via terminal (`pnpm db:seed`).

---

© 2024 **Universal Timeline & Tracking System**. Dev by Rasyiqi.
