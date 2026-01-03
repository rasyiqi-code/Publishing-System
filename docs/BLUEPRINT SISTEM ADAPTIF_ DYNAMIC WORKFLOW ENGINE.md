# **BLUEPRINT SISTEM ADAPTIF: DYNAMIC WORKFLOW ENGINE**

## **Satuan Penerbit Terpadu (SPT) \- Penerbit KBM**

Dokumen ini adalah spesifikasi teknis tingkat lanjut untuk membangun sistem manajemen produksi yang fleksibel, di mana Admin Utama dapat mengubah urutan kerja dan aturan bisnis tanpa bantuan programmer.

### **1\. Filosofi Inti: "Lego Architecture"**

Sistem tidak dibangun sebagai satu jalur kaku, melainkan sebagai kumpulan blok data yang bisa disusun ulang.

* **Bahan Baku (Fixed):** Inventaris Data Produksi (Kolom Database). Ini bersifat statis.  
* **Resep Layanan (Dynamic):** Urutan dan aturan mainnya. Ini bersifat dinamis dan bisa diedit via Admin Panel.

### **2\. Komponen 1: The Data Inventory (Inventaris Bahan Baku)**

*Developer wajib membuat ini sebagai Library Data Statis dengan nama variabel yang jelas.*

**Grup A: Identitas & Order**

* Identitas Pengirim  
* Nama Penulis  
* Judul Buku  
* Jenis Layanan (Paket)  
* Jumlah Oplah  
* Request Khusus  
* Keterangan Tambahan

**Grup B: Finansial**

* Tanggal Konfirmasi DP (Kunci Awal)  
* Tanggal Pelunasan (Kunci Akhir)

**Grup C: Kreatif & Produksi**

* Tanggal Naskah Masuk Kordinator  
* Tanggal Cover Masuk Desainer  
* Log Revisi Naskah  
* Log Revisi Cover  
* **Status ACC Cetak (Persetujuan Final)**

**Grup D: Legalitas**

* Verifikasi Dokumen Keaslian  
* Log Perubahan Judul/Penulis  
* Tanggal Pengajuan ISBN  
* Tanggal Terbit ISBN  
* Tanggal Pengajuan HAKI  
* Tanggal Terbit HAKI

**Grup E: Manufaktur & Logistik**

* Spesifikasi Teknis Cetak  
* Tanggal Naik Cetak  
* Nomor Resi Pengiriman  
* Alamat Tujuan Kirim

**Grup F: Aset Digital (After Sales)**

* Tanggal Kirim Sertifikat  
* Tanggal Kirim Link Penjualan  
* Tanggal Kirim Link Testimoni

### **3\. Komponen 2: The Workflow Builder (Fitur Admin Utama)**

*Ini adalah fitur di menu "Pengaturan" yang memungkinkan Anda membuat layanan baru.*

Cara Kerja:  
Admin Utama bisa membuat "Paket Layanan Baru" dengan logika Drag-and-Drop nama-nama data di atas.

#### **Simulasi: Membuat Alur "SPT FULL"**

1. **Nama Paket:** SPT Program Terpadu.  
2. **Mode UI:** Timeline View (5 Fase).  
3. **Susunan Alur:**  
   * *Step 1:* Ambil **Grup Identitas & Order** (Formulir Awal).  
   * *Step 2:* Ambil **Verifikasi Dokumen Keaslian**.  
   * *Step 3:* Ambil **Tanggal Konfirmasi DP**.  
   * *Step 4 (Paralel):* Ambil **Grup Kreatif** & **Grup Legalitas**.  
   * *Step 5:* Ambil **Status ACC Cetak**.  
   * *Step 6:* Ambil **Tanggal Pelunasan**.  
   * *Step 7:* Ambil **Tanggal Naik Cetak** & **Nomor Resi Pengiriman**.

#### **Simulasi: Membuat Alur "SATUAN CETAK"**

1. **Nama Paket:** Jasa Satuan Cetak.  
2. **Mode UI:** List View (Tiket).  
3. **Susunan Alur:**  
   * *Step 1:* Ambil **Grup Identitas & Order**.  
   * *Step 2:* Ambil **Status ACC Cetak** (Langsung Upload File Siap Cetak).  
   * *Step 3:* Ambil **Tanggal Pelunasan** (Langsung Lunas Full).  
   * *Step 4:* Ambil **Tanggal Naik Cetak** & **Nomor Resi Pengiriman**.  
   * *(Data Legalitas dan Revisi otomatis diabaikan).*

### **4\. Komponen 3: The Rule Engine (Mesin Gembok)**

*Fitur untuk mengatur syarat lanjut (Gating Logic).*

Admin bisa mengatur logika **"JIKA \- MAKA"** menggunakan nama data:

* **Rule A (Default SPT):**  
  * *Target:* **Tanggal Naskah Masuk Kordinator**.  
  * *Syarat:* Tanggal Konfirmasi DP harus **SUDAH TERISI**.  
  * *Aksi:* Jika belum terisi, tombol "Assign Layouter" dimatikan (Disabled).  
* **Rule B (Kustomisasi Masa Depan):**  
  * *Skenario:* Kebijakan berubah, cetak sedikit harus lunas di depan.  
  * *Target:* **Tanggal Naskah Masuk Kordinator**.  
  * *Syarat:* Tanggal Pelunasan harus **SUDAH TERISI**.  
  * *Aksi:* Tombol Assign mati sampai lunas.

### **5\. Integrasi UI/UX (Dual-Mode Adaptation)**

Walaupun alurnya dinamis, tampilan depan (Frontend) tetap menggunakan konsep **Dual-Mode Workspace** agar Admin nyaman.

1. **Jika Admin memilih Paket bertipe "Timeline View" (SPT):**  
   * Sistem merender Data Inventaris tersebut ke dalam visualisasi **Progress Bar 5 Fase**.  
2. **Jika Admin memilih Paket bertipe "List View" (Satuan):**  
   * Sistem merender data-data yang dipilih saja ke dalam visualisasi **Card/Tiket Ringkas**.  
3. **Segmentasi User (Tetap Berlaku):**  
   * Filter Klien: **Mitra SPT (Kampus/Umum)** & **Penulis Mitra**.  
   * Filter Admin: **Admin KBM** & **Admin Non-KBM** tetap hanya melihat data sesuai hak akses wilayah mereka.

### **6\. Spesifikasi Database (Panduan Developer)**

Untuk mendukung sistem adaptif ini, struktur database harus menggunakan penamaan yang jelas:

\-- Tabel Master Data (Inventaris Bahan Baku)  
TABLE master\_data\_points (  
    id INT PRIMARY KEY,  
    field\_name VARCHAR, \-- Contoh: "tanggal\_dp", "status\_acc\_cetak"  
    label\_id VARCHAR,   \-- Contoh: "Tanggal Konfirmasi DP"  
    input\_type VARCHAR  \-- Contoh: "Date", "Text", "File"  
);

\-- Tabel Definisi Layanan (Resep)  
TABLE service\_definitions (  
    id INT PRIMARY KEY,  
    service\_name VARCHAR, \-- Contoh: "SPT Full", "Cetak Satuan"  
    ui\_mode ENUM('timeline', 'list'), \-- Menentukan tampilan  
    is\_active BOOLEAN  
);

\-- Tabel Urutan Kerja (Langkah-langkah Resep)  
TABLE service\_steps (  
    service\_id INT,  
    step\_order INT, \-- Urutan ke-1, ke-2, dst  
    data\_point\_id INT, \-- Mengambil dari master\_data\_points  
    is\_mandatory BOOLEAN, \-- Wajib diisi atau tidak  
    dependency\_rule JSON \-- Logika gembok (Misal: "require\_field": "tanggal\_dp")  
);

\-- Tabel Project Nyata  
TABLE projects (  
    id INT PRIMARY KEY,  
    client\_segment ENUM('mitra\_kampus', 'mitra\_umum', 'penulis\_mitra'), \-- Penentu Admin Pengelola  
    service\_id INT, \-- Mengacu ke Resep yang dipakai  
    current\_step INT \-- Posisi progres sekarang  
);

### **Kesimpulan untuk Tim IT**

Sistem ini bukan sekadar aplikasi pencatat tanggal, melainkan **Platform Manajemen Alur Kerja (Workflow Management Platform)**.

* **Input:** Inventaris Data Produksi.  
* **Proses:** Diatur oleh *Workflow Builder* yang bisa dikustomisasi Admin.  
* **Output:** Tampilan Dual-Mode (Timeline/List) yang menyesuaikan diri dengan konfigurasi yang dibuat.

Dengan blueprint ini, Penerbit KBM memiliki aset teknologi yang **Future-Proof** (Tahan Masa Depan).