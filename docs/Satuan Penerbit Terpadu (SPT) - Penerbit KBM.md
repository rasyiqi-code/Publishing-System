## **Satuan Penerbit Terpadu (SPT) \- Penerbit KBM**

Dokumen ini merancang antarmuka (Interface) yang memisahkan program jangka panjang (SPT) dan layanan parsial (Satuan) demi kenyamanan kerja Admin, dengan struktur B2B/B2C yang telah disempurnakan. Sekaligus mengclearkan 

### **1\. Definisi Terminologi Baru (Update)**

Agar hirarki data bersih, berikut adalah entitas yang diakui sistem:

| Istilah Baru | Kategori | Keterangan |
| :---- | :---- | :---- |
| **MITRA SPT** | B2B (Institusi) | Entitas Penerbit (Kampus/Umum) yang bekerjasama. KBM hanya berkomunikasi dengan Admin Penerbit ini, bukan penulisnya. |
| **PENULIS MITRA** | B2C (Perorangan) | Penulis mandiri yang datang langsung ke KBM (Self-publishing). |
| **LAYANAN SATUAN** | Produk Retail | Layanan eceran (Hanya Cetak / Hanya Cover). Bisa dipesan oleh Mitra SPT maupun Penulis Mitra. |

### **2\. Arsitektur Navigasi: "The Dual-Mode Workspace"**

Sistem dibagi menjadi dua **MODUL UTAMA** di sidebar sebelah kiri.

#### **MODUL A: SPT WORKSPACE (Program Terpadu)**

* **Fokus:** Layanan Full Package (Layout-Cover-Legalitas-Cetak).  
* **Tampilan:** Berbasis Timeline / Kanban Board (5 Fase).  
* **Pengguna:** Digunakan untuk project jangka panjang.

#### **MODUL B: SATUAN WORKSPACE (Layanan Satuan)**

* **Fokus:** Layanan Eceran (Cetak Saja, Desain Saja).  
* **Tampilan:** Berbasis List / Tabel (Tiket Antrean).  
* **Pengguna:** Digunakan untuk order cepat (Sprint).

### **3\. Strategi Identifikasi User & Pengelola (Final)**

Sistem Tagging (Label) disesuaikan dengan aturan bisnis: KBM tidak menangani customer milik Mitra.

* **CHIP (Label Warna) pada Kartu Project:**  
  * 🏷️ **MITRA SPT \- KAMPUS** (Ungu Tua)  
    * *Pengelola:* **Admin KBM**.  
    * *Deskripsi:* Order dari Kampus (bisa Full SPT atau Satuan).  
  * 🏷️ **MITRA SPT \- UMUM** (Ungu Muda)  
    * *Pengelola:* **Admin Non-KBM**.  
    * *Deskripsi:* Order dari Penerbit Swasta/Umum (bisa Full SPT atau Satuan).  
  * 🏷️ **PENULIS MITRA** (Biru Tua)  
    * *Pengelola:* **Admin KBM**.  
    * *Deskripsi:* Penulis mandiri yang langsung ke KBM.

**Catatan Penting:** Kategori "Penulis Mitra \- Umum" **DIHAPUS**. Jika ada penulis dari luar yang ingin cetak, mereka harus masuk lewat akun induk "Mitra SPT \- Umum" atau mendaftar mandiri sebagai "Penulis Mitra" di KBM.

### **4\. Flow Detail: MODUL SPT (Program Terpadu)**

*Alur lengkap 27 Data dengan 5 Fase.*

1. **Draft & Kontrak:**  
   * Admin Marketing input Data Order.  
   * Upload Dokumen Legalitas (Keaslian).  
2. **Gembok Finansial 1:**  
   * Menunggu **Konfirmasi DP** dari Keuangan.  
   * *Status UI:* Fase Kreatif berwarna Abu-abu (Locked).  
3. **Produksi Kreatif (Looping):**  
   * Admin Marketing klik "Assign Koordinator".  
   * Upload Draft \-\> Revisi \-\> Upload Ulang.  
   * **Mitra SPT (Adminnya)** atau **Penulis Mitra** klik "ACC Final".  
4. **Paralel Legalitas:**  
   * Admin Perijinan input ISBN & HAKI.  
5. **Gembok Finansial 2 & Manufaktur:**  
   * Menunggu **Konfirmasi Pelunasan**.  
   * Admin Cetak klik "Naik Cetak".  
6. **Closing:**  
   * Input Resi \-\> Kirim Aset Digital otomatis.

### **5\. Flow Detail: MODUL SATUAN (Layanan Satuan)**

*Alur pendek. Admin Non-KBM sering menggunakan ini untuk Mitra Umum yang hanya butuh cetak.*

#### **Skenario: Cetak Saja (Print Only)**

* **Tampilan:** Admin hanya melihat **3 Langkah Simpel**:  
  1. **Verifikasi File & Bayar:**  
     * Marketing upload File Siap Cetak (Data 25 langsung terisi).  
     * Keuangan klik "Konfirmasi Lunas".  
  2. **Produksi:**  
     * Admin Cetak klik "Naik Cetak" (Data 26).  
  3. **Kirim:**  
     * Admin Cetak input Resi (Data 27). **SELESAI.**

#### **Skenario: Desain Cover Saja**

* **Tampilan:** Fokus pada preview gambar.  
  1. **Brief & Bayar:** Input request & Konfirmasi Bayar.  
  2. **Desain:** Upload Draft \-\> Revisi (Data 11 & 13).  
  3. **Serah Terima:** Mitra/Penulis klik ACC \-\> Link Download Terkirim.

### **6\. Ringkasan Perbedaan UI**

| Komponen UI | Workspace SPT (Terpadu) | Workspace Satuan (Parsial) |
| :---- | :---- | :---- |
| **Visual Utama** | Progress Bar Panjang | Status Badge (List View) |
| **Kolom Data** | 27 Data Lengkap | 5-7 Data Relevan |
| **User Target** | Mitra/Penulis (Project Baru) | Mitra/Penulis (Repeat Order/Eceran) |

### **7\. Rekomendasi Teknis untuk Developer**

Struktur data final untuk mendukung logika akses ini:

1. **Kolom user\_category (Kategori Klien):**  
   * 'mitra\_kampus' \-\> Akses Admin KBM.  
   * 'mitra\_umum' \-\> Akses Admin Non-KBM.  
   * 'penulis\_mitra' \-\> Akses Admin KBM (Perorangan).  
2. **Kolom service\_mode (Jenis Layanan):**  
   * 'spt' \-\> Masuk Modul A (Timeline View).  
   * 'satuan' \-\> Masuk Modul B (List View).  
3. **Logic Dashboard:**  
   * Admin KBM melihat semua project dengan tag mitra\_kampus ATAU penulis\_mitra.  
   * Admin Non-KBM HANYA melihat project dengan tag mitra\_umum.