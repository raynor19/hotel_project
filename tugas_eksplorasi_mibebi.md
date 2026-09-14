# Tugas Eksplorasi Produk dan Perancangan Fitur Bernilai Tambah
## Belajar dari Mibebi Kasir sebelum Menyusun PRD dan Melakukan Vibe Coding

| Metadata | Keterangan |
| :--- | :--- |
| **Mata Kuliah / Tugas** | Tugas Akhir / Skripsi — Rekayasa Produk Perangkat Lunak |
| **Penyusun / Mahasiswa** | Muhammad Raynor Athaillah (23523055) |
| **Studi Kasus Transfer** | Aplikasi Reservasi Hotel (**HotelKu Yogyakarta**) |
| **Tautan Prototipe** | [hotel-project-five-peach.vercel.app](https://hotel-project-five-peach.vercel.app) |
| **Fokus Peran Pengguna** | 3 Peran: **Tamu**, **Resepsionis**, dan **Administrator** |
| **Tanggal Pembaruan** | 13 September 2026 |

---

# BAGIAN I — EKSPLORASI MIBEBI KASIR

## A. Hasil Eksplorasi Aplikasi Mibebi Kasir
Simulasi penggunaan dilakukan dengan memosisikan diri sebagai pemilik usaha F&B (restoran/kafe) yang mengoperasikan Mibebi KasirResto (`kasir.mibebi.com`) untuk operasional harian. Aktivitas eksplorasi yang dijalankan meliputi:
1. **Melihat dan Mengelola Data Menu:** Menu dikelompokkan secara terstruktur berdasarkan kategori (makanan utama, camilan, minuman) lengkap dengan foto, harga, dan varian; data menu dapat diinput secara instan menggunakan fitur **Scan Menu AI** (memotret lembar menu fisik lalu nama dan harga terisi otomatis).
2. **Membuat Pesanan Pelanggan:** Pesanan dapat dibuat langsung oleh kasir (*dine-in / take-away*) atau secara mandiri oleh pelanggan menggunakan fitur **QR Meja & Self-Order** tanpa harus memanggil pelayan.
3. **Simulasi Transaksi & Cetak Dapur:** Transaksi pembayaran diproses di kasir (tunai, QRIS, transfer), dan tiket pesanan langsung terkirim otomatis ke printer dapur (**Cetak Pesanan Dapur Otomatis**) sehingga meminimalisir kesalahan komunikasi antarstaf.
4. **Melihat Riwayat Transaksi:** Seluruh transaksi yang selesai tersimpan kronologis dan dapat dicari ulang berdasarkan tanggal, nomor meja, atau metode bayar untuk keperluan rekonsiliasi kas harian.
5. **Menganalisis Laporan Penjualan (Dashboard BI):** Menampilkan metrik omzet harian, jumlah struk, produk terlaris (*best seller*), dan jam-jam sibuk (*peak hours*).
6. **Eksplorasi Fitur Bernilai Tambah Tambahan:** Mencoba pengiriman struk digital ramah lingkungan via **WhatsApp Struk + Link Review Google Maps**, serta sistem **Reminder Pelanggan Lama** untuk mengundang kembali konsumen yang sudah lama tidak berkunjung.

---

## B. Identifikasi Fitur Inti Mibebi Kasir

| No | Fitur Inti | Fungsi Utama | Mengapa Mutlak Dibutuhkan? |
| :---: | :--- | :--- | :--- |
| 1 | **Manajemen Menu & Harga** | Mengelola daftar menu, kategori, varian, dan harga jual produk. | Kasir membutuhkan data produk dan harga yang sah sebelum transaksi apa pun dapat dibuat. |
| 2 | **Manajemen Pesanan (*Order Taking*)** | Mencatat rincian item pesanan pelanggan, jumlah, dan instruksi khusus meja. | Siklus bisnis F&B dimulai dari pesanan; tanpa pencatatan pesanan, tagihan tidak dapat dihitung. |
| 3 | **Transaksi Pembayaran (*Billing & Checkout*)** | Menghitung total tagihan, pajak, diskon, dan memproses pelunasan pembayaran. | Ini adalah esensi dasar sebuah mesin kasir (POS), yaitu menyelesaikan akad transaksi jual-beli. |
| 4 | **Riwayat Transaksi (*Transaction Log*)** | Menyimpan arsip data seluruh transaksi yang telah berhasil maupun dibatalkan. | Mutlak dibutuhkan untuk audit kasir, pembuktian jika ada komplain pelanggan, dan tutup buku harian. |
| 5 | **Laporan Penjualan Dasar** | Merangkum total pendapatan uang masuk, volume transaksi, dan metode pembayaran. | Pemilik usaha (*owner*) membutuhkan laporan rekapitulasi agar mengetahui posisi kas bisnis setiap hari. |

### Jawaban Analisis:
> **Jika fitur-fitur tersebut tidak tersedia, apakah Mibebi masih dapat disebut sebagai aplikasi kasir?**  
> **Tidak.** Tanpa kelima fitur tersebut, aplikasi kehilangan kapabilitas dasarnya untuk mencatat dan menyelesaikan transaksi pertukaran nilai (uang dengan makanan/minuman). Jika salah satu dihilangkan (misalnya tanpa manajemen pesanan atau tanpa pencatatan transaksi), aplikasi tersebut hanyalah katalog digital statis atau kalkulator biasa, bukan sebuah sistem kasir F&B (*Point of Sale*).

---

## C. Identifikasi Fitur Bernilai Tambah Mibebi Kasir

5 Fitur yang memberikan nilai tambah di luar pencatatan transaksi dasar:
1. **Struk WhatsApp + Link Review Google Maps Otomatis**
2. **Reminder Pelanggan Lama + Voucher Retur**
3. **QR Meja & Self-Order Berbasis Web**
4. **Platform Promo & Pengurangan Food Waste (*Lastbite*)**
5. **Scan Menu AI untuk Onboarding Cepat**

---

### Analisis Mendalam 3 Fitur Bernilai Tambah Terbaik Mibebi

#### 1. Struk WhatsApp + Pesan AI + Review Google Maps
- **Masalah:** Struk kertas thermal mudah hilang, memakan biaya cetak, dan transaksi selesai begitu saja tanpa ada upaya membangun reputasi digital toko.
- **Cara Kerja:** Begitu kasir menekan tombol lunas, sistem meminta nomor WhatsApp tamu dan otomatis mengirim struk digital dalam hitungan detik. Di bawah rincian struk disematkan ucapan terima kasih yang dipersonalisasi AI serta tautan langsung untuk memberi rating bintang 5 di Google Maps restoran.
- **Pengguna yang Memperoleh Manfaat:** Pelanggan (struk tersimpan rapi di ponsel) dan Pemilik Usaha (mendapatkan lonjakan ulasan positif di Google Maps secara gratis).
- **Dampak Bisnis:** Meningkatkan visibilitas resto di pencarian lokal Google Maps sehingga mendatangkan pelanggan baru, menghemat biaya kertas struk hingga $40\%$, serta meningkatkan repeat purchase sebesar $15\%$.
- **Nilai Tambah:** Fitur ini mengubah akhir transaksi yang pasif menjadi kanal *marketing & reputation engine* aktif.

#### 2. Reminder Pelanggan Lama + Voucher Retur
- **Masalah:** Pelanggan yang pernah makan seringkali lupa atau beralih ke tempat lain, sementara pemilik restoran tidak memiliki cara untuk menghubungi kembali pelanggan lama secara efisien.
- **Cara Kerja:** Sistem secara otomatis mendeteksi riwayat transaksi pelanggan. Jika pelanggan tercatat tidak berkunjung kembali selama > 30 hari, sistem secara cerdas mengirimkan pesan WhatsApp pengingat disertai voucher diskon khusus ("*Kami rindu Anda, nikmati diskon 15% untuk kunjungan minggu ini*").
- **Pengguna yang Memperoleh Manfaat:** Pelanggan pasif (mendapat diskon eksklusif) dan Pemilik Usaha (mengaktifkan kembali basis pelanggan yang sudah ada).
- **Dampak Bisnis:** Meningkatkan frekuensi kunjungan ulang (*repeat order*) hingga $25\%$ dan memaksimalkan *Customer Lifetime Value (CLV)* tanpa biaya iklan akuisisi yang mahal.
- **Nilai Tambah:** Mengubah basis data transaksi pasif menjadi mesin retensi pelanggan otomatis.

#### 3. QR Meja & Self-Order Berbasis Web
- **Masalah:** Antrean panjang di kasir pada jam makan siang/malam membuat pelanggan frustrasi, pelayan kewalahan mencatat menu ke meja-meja, dan potensi pesanan salah catat cukup tinggi.
- **Cara Kerja:** Di setiap meja ditempel stiker QR Code unik. Pelanggan memindai QR menggunakan kamera ponsel, langsung membuka web menu restoran, memilih pesanan, dan memesan langsung tanpa antre dan tanpa harus mengunduh aplikasi tambahan.
- **Pengguna yang Memperoleh Manfaat:** Pelanggan (bebas memilih menu dengan leluasa) dan Staf Restoran (fokus menyajikan makanan tanpa terbebani bolak-balik mencatat pesanan).
- **Dampak Bisnis:** Meningkatkan perputaran meja (*table turnover*) sebesar $30\%$, mengurangi beban kerja pelayan, dan menaikkan nilai keranjang belanja (*basket size*) karena pelanggan lebih leluasa memesan menu tambahan.
- **Nilai Tambah:** Merevolusi alur pemesanan konvensional menjadi layanan mandiri modern (*contactless self-service*).

---

## D. Memahami Value Proposition

1. **Perbedaan Aplikasi Kasir Pencatat Transaksi vs Pembantu Bisnis Berkembang:**
   - *Kasir Pencatat Transaksi:* Bersifat **reaktif dan administratif**. Hanya bertindak sebagai pencatat pasif dari kejadian yang sudah terjadi (berapa mangkuk mie yang dibayar, berapa kembaliannya).
   - *Kasir Pembantu Bisnis Berkembang:* Bersifat **proaktif dan strategis**. Memanfaatkan data dari setiap transaksi untuk menghasilkan keuntungan baru (mendorong *upselling*, mengingatkan pelanggan kembali, mengumpulkan review positif, dan mencegah pemborosan bahan baku).

2. **Tiga Nilai Utama Mibebi Kasir bagi Pemilik Bisnis F&B:**
   - **Meningkatkan Pendapatan & Retensi:** Melalui mekanisme upsell cerdas dan pesan pengingat pelanggan pasif.
   - **Efisiensi Operasional & Penghematan Biaya:** Melalui fitur QR self-order, cetak pesanan dapur otomatis, dan struk digital tanpa kertas.
   - **Kemudahan Adopsi Teknologi:** Tidak memerlukan perangkat mahal dan input menu rumit (cukup foto menu fisik dengan Scan Menu AI).

3. **Apakah Semua Fitur Menarik Otomatis Menjadi Fitur Bernilai Tambah?**
   - **Tidak.** Fitur baru hanya bernilai tambah apabila secara nyata **menyelesaikan friksi bisnis pengguna** dan **menghasilkan dampak yang terukur** (efisiensi waktu, kenaikan omzet, kepuasan pelanggan). Fitur yang canggih secara visual namun tidak menyelesaikan masalah riil hanya merupakan *gimmick* teknis.

4. **Contoh Fitur Menarik secara Teknis tetapi Dampak Bisnis Relatif Kecil:**
   - *Percantik Menu AI (Filter foto makanan otomatis):* Secara teknis menggunakan generative AI canggih, namun dampaknya terhadap keputusan beli pelanggan F&B relatif kecil jika rasa makanan, harga, dan kecepatan pelayanan tidak memuaskan.

5. **Contoh Fitur Sederhana tetapi Berpotensi Dampak Bisnis Besar:**
   - *Reminder Pelanggan Lama via WhatsApp:* Secara teknis logika algoritmanya sangat sederhana (hanya memfilter `tanggal_sekarang - tanggal_terakhir_kunjung > 30`), namun dampak bisnisnya sangat masif karena langsung mengembalikan pelanggan lama tanpa biaya pemasaran berbayar.

---

## E. Product Teardown Mibebi Kasir

| Kategori Kontribusi | Daftar Fitur Teridentifikasi | Fokus & Peran terhadap Bisnis |
| :--- | :--- | :--- |
| **Core Transaction** | Manajemen Menu, POS Kasir, Pembayaran (Tunai/QRIS), Cetak Struk, Riwayat Transaksi | Menjalankan proses inti operasional jual-beli setiap hari. |
| **Sales Growth** | Rekomendasi Menu Pendamping (Upselling), Platform Promo Lastbite | Meningkatkan rata-rata nilai belanja per transaksi (*Average Order Value*). |
| **Customer Retention** | Reminder Pelanggan Lama Otomatis, Member & Poin Loyalitas, Kupon Retur | Menjaga pelanggan agar tidak beralih ke kompetitor dan rutin berkunjung kembali. |
| **Customer Experience** | QR Meja & Self-Order, Struk WhatsApp Digital, Pesan Personalisasi AI | Memberikan pengalaman bersantap yang modern, cepat, dan berkesan. |
| **Operational Efficiency** | Scan Menu AI, Cetak Pesanan Tiket Dapur Otomatis, Manajemen Hak Akses Staf | Mempercepat alur kerja staf dan menghilangkan risiko salah catat pesanan. |
| **Business Intelligence** | Dashboard Ringkasan Penjualan, Laporan Produk Terlaris, Notifikasi Omzet Harian | Memberikan data komprehensif bagi pemilik untuk menentukan strategi usaha. |

---

# BAGIAN II — TRANSFER KE PROYEK SKRIPSI (HOTELKU YOGYAKARTA)

## F. Judul dan Deskripsi Produk

### 1. Judul Skripsi
> **"Pengembangan Prototipe Aplikasi Hotel untuk Reservasi Kamar, Manajemen Check-In/Check-Out, dan Layanan Tamu Real-Time (Studi Kasus: HotelKu Yogyakarta)"**

### 2. Deskripsi Produk
**HotelKu Yogyakarta** (`hotel-project-five-peach.vercel.app`) adalah platform manajemen dan reservasi hotel berbasis web yang dirancang untuk mengintegrasikan kebutuhan tamu, resepsionis (*front office*), dan manajemen hotel (*administrator*). Aplikasi ini tidak hanya memfasilitasi pemesanan kamar secara daring, tetapi juga mengotomatisasi layanan kepulangan tamu dan menyajikan data operasional secara real-time.

- **3 Peran Pengguna (Roles) & Hak Akses Utama:**

| Peran (Role) | Deskripsi & Hak Akses Utama |
| :--- | :--- |
| **Tamu (Guest)** | Mencari dan memesan kamar, melihat tiket/voucher pesanan pada menu 'Pesanan Saya', mengelola profil akun, menerima pengingat check-in/out, serta mengajukan permohonan *late check-out*. |
| **Resepsionis (Front Desk)** | Memverifikasi reservasi masuk, memproses transaksi kedatangan (*Check-In*) dan kepulangan (*Check-Out*), memantau kamar mendekati batas check-out, serta merespons permohonan bantuan tamu. |
| **Administrator (Admin)** | Mengelola inventaris kamar (harga, tipe, fasilitas, foto), mengelola data pengguna hotel, memantau metrik performa okupansi, dan laporan finansial bisnis. |
- **Masalah Utama:** Kurangnya sistem komunikasi proaktif menjelang waktu kepulangan tamu yang memicu keterlambatan check-out, ketidakpastian status kesiapan kamar saat kedatangan tamu yang memicu antrean di meja resepsionis, serta lambatnya pemantauan tingkat okupansi hotel secara real-time.
- **Proses Bisnis Utama:** Tamu reservasi kamar online $\rightarrow$ Resepsionis verifikasi & proses Check-In saat kedatangan $\rightarrow$ Tamu menikmati kamar $\rightarrow$ Pengingat otomatis 2 jam sebelum batas check-out (pukul 10:00 WIB) $\rightarrow$ Tamu konfirmasi siap keluar / ajukan late check-out $\rightarrow$ Resepsionis memproses Check-Out $\rightarrow$ Status kamar kembali tersedia (*Available*).
- **Manfaat Aplikasi:** Meminimalisir keterlambatan kepulangan tamu, mempercepat alur pelayanan resepsionis, dan memberi manajemen visibilitas data okupansi serta omzet secara akurat.

---

### 3. Identifikasi Masalah Nyata pada Domain Hotel

1. **Keterlambatan Check-Out Tanpa Konfirmasi (*Unplanned Late Check-Out*):**  
   Banyak tamu tidak menyadari telah mendekati jam 12:00 WIB karena sedang tertidur atau berkemas santai. Keterlambatan check-out tanpa konfirmasi mengganggu jadwal perputaran kamar untuk tamu berikutnya dan menimbulkan potensi denda keterlambatan yang membuat tamu tidak nyaman.
2. **Ketidakpastian Kesiapan Kamar saat Kedatangan (*Uncertain Room Readiness*):**  
   Tamu yang datang lebih awal (*early arrival*) atau sedang menunggu di lobi hotel seringkali tidak mengetahui apakah kamar yang dipesan sudah selesai disiapkan atau belum. Hal ini menyebabkan tamu harus berulang kali mendatangi meja resepsionis untuk bertanya, menimbulkan kerumunan di area lobi dan memecah konsentrasi petugas front desk.
3. **Pencatatan Okupansi dan Pendapatan yang Terfragmentasi:**  
   Manajemen hotel kesulitan memantau tingkat keterisian kamar harian dan omzet berjalan karena pencatatan reservasi daring dan pembayaran di meja resepsionis belum teragregasi secara otomatis dalam satu dashboard analitik.

---

## G. Fitur Inti Aplikasi HotelKu Yogyakarta

| No | Fitur Inti | Fungsi | Mengapa Mutlak Dibutuhkan? |
| :---: | :--- | :--- | :--- |
| 1 | **Manajemen Katalog Kamar** | Menampilkan daftar kategori kamar (Standard, Superior, Deluxe, Suite, Presidential), galeri foto, fasilitas, kapasitas, dan harga per malam. | Tanpa data spesifikasi kamar, tamu tidak memiliki dasar untuk memilih dan memesan akomodasi. |
| 2 | **Reservasi & Pemesanan Kamar** | Mencatat tanggal check-in, check-out, jumlah tamu, dan menghitung total tagihan menginap. | Merupakan proses bisnis inti sistem reservasi hotel untuk mengunci ketersediaan kamar. |
| 3 | **Proses Check-In & Check-Out** | Memvalidasi identitas tamu saat kedatangan dan mencatat kepulangan serta pelepasan kamar. | Merupakan gerbang operasional utama hotel; tanpa ini status ketersediaan kamar tidak pernah sinkron. |
| 4 | **Pencatatan Transaksi & Pembayaran** | Menghitung kalkulasi tagihan kamar, durasi malam menginap, dan status lunas/pending. | Menyelesaikan aspek bisnis dan pertukaran finansial yang sah antara tamu dan pihak hotel. |
| 5 | **Riwayat Reservasi & E-Voucher Tamu** | Menyimpan histori reservasi tamu yang dilengkapi kode booking, rincian kamar, dan status persetujuan. | Menjadi bukti kepemilikan hak menginap bagi tamu dan alat verifikasi bagi petugas resepsionis. |

> **Uji Logika:** Jika fitur-fitur di atas dihilangkan, aplikasi tidak dapat berfungsi sebagai sistem reservasi hotel. Oleh karena itu, kelimanya adalah **Fitur Inti (*Core Features*)**.

---

## H. Tiga Fitur Bernilai Tambah HotelKu Yogyakarta

### 1. Pengingat Check-Out Otomatis (T-2 Jam) dengan Menu Aksi Cepat (*Departure Assistant*)
- **Masalah:** Tamu lupa waktu check-out pukul 12:00 WIB sehingga terlambat keluar tanpa konfirmasi, memicu antrean di resepsionis dan kekacauan jadwal kamar tamu berikutnya.
- **Cara Kerja:**
  - Tepat **2 jam (120 menit) sebelum batas check-out** (pukul 10:00 WIB), sistem memicu notifikasi visual interaktif di portal tamu (`/my-reservations`) disertai simulasi pesan WhatsApp/SMS.
  - Notifikasi dilengkapi 3 tombol aksi langsung:
    1. `[Konfirmasi Siap Check-Out 12:00]`: Memberi sinyal siaga ke front desk bahwa tamu siap keluar tepat waktu.
    2. `[Ajukan Late Check-Out]`: Mengajukan permohonan perpanjangan waktu (+1 jam s.d. 13:00 atau +2 jam s.d. 14:00) yang diteruskan ke resepsionis untuk diverifikasi.
    3. `[Bantuan Bellboy]`: Meminta staf concierge membantu membawa koper dari kamar ke lobi.
  - Di konsol resepsionis, kamar terkait mendapatkan badge kuning `[Segera Check-Out]` untuk pemantauan proaktif.
- **Pengguna yang Memperoleh Manfaat:** Tamu (berkemas santai, terhindar dari denda telat) dan Resepsionis (mengetahui kepastian jadwal kamar kosong lebih awal).
- **Dampak Bisnis:** Menurunkan angka *late check-out* tanpa konfirmasi hingga $\ge 40\%$, meningkatkan kepuasan tamu terhadap layanan kepulangan, dan memperlancar alur pergantian kamar.
- **Nilai Tambah:** Mengubah momen kepulangan yang biasanya kaku menjadi pengalaman keramahan digital proaktif (*proactive guest care*).

---

### 2. Notifikasi Kamar Siap Check-In (*Room Ready Notification*)
- **Masalah:** Tamu yang tiba lebih awal (*early arrival*) sebelum jam standar check-in (14:00 WIB) atau tamu yang sedang bersantai di area kafe/lobi tidak mengetahui kapan kamar mereka selesai disiapkan. Akibatnya, tamu harus bolak-balik bertanya ke meja resepsionis (*"Apakah kamar saya sudah siap?"*), menimbulkan penumpukan antrean di lobi dan memecah konsentrasi petugas front desk.
- **Cara Kerja:**
  - Saat status kamar telah diverifikasi siap huni (*Ready/Available*) oleh sistem atau resepsionis pada hari reservasi tamu, sistem secara otomatis mengirimkan notifikasi instan ke portal tamu (`/my-reservations`) dengan pesan: *"Kamar [Nomor/Tipe Kamar] Anda Sudah Siap! Anda dapat langsung menuju meja resepsionis untuk mengambil kunci kamar tanpa perlu mengantre."*
  - Jika kamar siap lebih cepat dari jam 14:00 WIB (misalnya pukul 12:30 atau 13:15 WIB), tamu langsung mendapatkan pemberitahuan hak masuk kamar lebih awal (*early check-in privilege*) tanpa biaya tambahan.
  - Pada konsol resepsionis, kamar ditandai dengan badge hijau *[Ready & Guest Notified]* sehingga saat tamu tiba di meja resepsionis, proses serah terima kunci dapat diselesaikan dalam waktu kurang dari 1 menit.
- **Pengguna yang Memperoleh Manfaat:** Tamu (tidak perlu cemas atau bolak-balik bertanya; mendapat kenyamanan early check-in jika kamar siap lebih awal) dan Resepsionis (area lobi tertib dan bebas dari pertanyaan berulang tamu).
- **Dampak Bisnis:** Memangkas antrean dan waktu tunggu tamu di lobi hingga $35\%$, menaikkan skor kepuasan tamu pada impresi pertama kedatangan (*first impression rating*), dan mempercepat proses serah terima kamar.
- **Nilai Tambah:** Mengubah proses menunggu kamar yang pasif menjadi pengalaman layanan proaktif bernilai tambah tinggi (*Proactive Hospitality*).

---

### 3. Dashboard Okupansi & Pendapatan Real-Time dengan Jam Operasional Terpadu (*Business Intelligence*)
- **Masalah:** Pemilik hotel dan admin kesulitan memantau tingkat keterisian kamar harian dan perolehan omzet secara instan tanpa harus membuka laporan kasir terpisah.
- **Cara Kerja:**
  - Menghadirkan dashboard eksekutif dan operasional yang secara otomatis mengagregasi data reservasi aktif, menghitung persentase tingkat okupansi kamar, menampilkan pendapatan terwujud vs potensial, serta denah visual status kamar.
  - Dilengkapi widget penanda jam operasional digital real-time (Hari, Tanggal, Bulan, Tahun, dan Jam WIB) sebagai acuan sinkron waktu check-in/out.
- **Pengguna yang Memperoleh Manfaat:** Administrator, Manajemen Hotel, dan Resepsionis.
- **Dampak Bisnis:** Mempercepat pengambilan keputusan manajerial (misalnya membuka promo kamar saat okupansi rendah) dan menyajikan laporan bisnis secara transparan tanpa jeda waktu.
- **Nilai Tambah:** Mengubah data transaksi mentah menjadi wawasan bisnis (*Business Intelligence*) yang siap ditindaklanjuti.

---

## I. Prinsip Desain: Belajar dari Pola Pikir Mibebi, Bukan Menyalin

| Pola Berpikir Mibebi Kasir | Diadopsi Menjadi Nilai Tambah di HotelKu Yogyakarta |
| :--- | :--- |
| **Mibebi:** Menggunakan *Reminder Pelanggan Pasif* untuk mengundang kembali konsumen F&B yang lama tidak berkunjung. | $\rightarrow$ **HotelKu:** Menggunakan **Pengingat Check-Out Otomatis (T-2 Jam)** untuk mencegah keterlambatan kepulangan tamu dan memperlancar perputaran kamar. |
| **Mibebi:** Menggunakan *Notifikasi Struk WhatsApp* untuk memberikan bukti transaksi instan ke ponsel pelanggan. | $\rightarrow$ **HotelKu:** Menggunakan **Notifikasi Kamar Siap Check-In** untuk mengabari tamu saat kamar siap huni sehingga tamu dapat langsung masuk tanpa antre di lobi. |
| **Mibebi:** Menggunakan *Dashboard BI* agar pemilik resto tahu omzet tanpa membuka buku catatan kasir. | $\rightarrow$ **HotelKu:** Menggunakan **Dashboard Okupansi & Pendapatan Real-Time** agar pengelola hotel memantau performa hunian dan omzet secara instan. |

---

## J. Prioritas Fitur (Metode MoSCoW)

| Kategori Prioritas | Fitur yang Ditetapkan | Alasan Pemilihan & Rasionalisasi |
| :---: | :--- | :--- |
| **Must Have** | 1. Fitur Inti (Katalog Kamar, Reservasi, Check-In/Out, Pembayaran, Riwayat Voucher).<br>2. **Pengingat Check-Out Otomatis (T-2 Jam)** pada Portal Tamu.<br>3. **Indikator Kamar Mendekati Check-Out pada Konsol Resepsionis**. | Wajib ada agar aplikasi dapat berfungsi sebagai sistem reservasi sekaligus menyelesaikan masalah utama keterlambatan check-out tamu. Beban teknisnya sangat ideal untuk skripsi. |
| **Should Have** | 1. **Notifikasi Kamar Siap Check-In**.<br>2. **Dashboard Okupansi & Statistik Pendapatan Admin**.<br>3. **Jam Digital Operasional Real-Time WIB**. | Sangat penting untuk melengkapi nilai tambah operasional front office dan menyajikan visualisasi data yang kuat bagi penguji skripsi. |
| **Could Have** | 1. Tombol Permintaan Bantuan Bellboy terintegrasi ke modul concierge.<br>2. Opsi Pengajuan Late Check-Out berbayar otomatis. | Bernilai positif bagi pengalaman tamu, namun dapat disimulasikan menggunakan modal dialog interaktif tanpa membebani jadwal skripsi. |
| **Won't Have (Fase Ini)** | 1. Modul internal penugasan staf housekeeping kebersihan kamar.<br>2. Integrasi hardware kunci pintu kartu pintar RFID/IoT.<br>3. Integrasi channel manager ke platform OTA komersial (Traveloka/Agoda). | Sengaja dikecualikan agar ruang lingkup proyek tetap fokus, realistis, dan tuntas diselesaikan tepat waktu. |

---

## K. Penentuan Scope Proyek

### In Scope (Fitur yang Dikembangkan dalam Skripsi):
1. Antarmuka web responsif untuk 3 peran: Tamu, Resepsionis, dan Administrator.
2. Modul autentikasi pengguna (Registrasi mandiri tamu, login akun demo instan per peran).
3. Katalog kamar interaktif dengan filter kategori kamar bernuansa luxury Jawa klasik (*Standard, Superior, Deluxe, Suite, Presidential*).
4. Alur reservasi kamar dengan kalkulasi harga otomatis berdasarkan durasi malam.
5. Konsol resepsionis untuk verifikasi pemesanan, eksekusi transaksi check-in dan check-out tamu.
6. **Sistem Pengingat Check-Out Otomatis (T-2 Jam)** pada portal tamu dengan tombol aksi konfirmasi kepulangan dan pengajuan late check-out.
7. **Sistem Notifikasi Kamar Siap Check-In (*Room Ready Notification*)** untuk mempercepat serah terima kamar di lobi hotel.
8. Dashboard okupansi kamar dan rekapitulasi finansial real-time untuk Administrator.
9. Penanda waktu operasional terpadu (Hari, Tanggal, Bulan, Tahun, dan Jam Digital Real-Time WIB).

### Out of Scope (Sengaja Dibatasi di Luar Skripsi):
1. Modul manajemen penugasan staf pembersih kamar (*housekeeping task assignment*).
2. Integrasi sensor fisik IoT pada pintu atau saklar listrik kamar hotel.
3. Integrasi payment gateway perbankan komersial nyata yang memerlukan izin perizinan merchant resmi (menggunakan simulasi transaksi/virtual bill).
4. Pembuatan aplikasi mobile native terpisah (aplikasi berfokus pada Progressive Web App / Web Responsif ramah layar HP).

---

## L. Rumusan Value Proposition

> *"Aplikasi kami tidak hanya membantu **tamu melakukan reservasi kamar secara online dan membantu resepsionis mencatat proses check-in serta check-out**, tetapi juga membantu **pihak hotel meningkatkan kepuasan tamu dan kelancaran operasional melalui fitur Pengingat Check-Out Otomatis 2 Jam Sebelum Batas Kepulangan, Notifikasi Kamar Siap Check-In, serta Dashboard Okupansi Real-Time untuk Manajemen Hotel**."*

---

## M. Refleksi Kritis Mahasiswa

1. **Setelah mencoba dan mempelajari Mibebi Kasir, apakah cara Anda memandang aplikasi yang akan dikembangkan berubah?**  
   *Jawab:* **Ya, berubah secara mendasar.** Awalnya saya memandang aplikasi reservasi hotel hanya sebagai formulir digital pemesanan kamar semata (hanya memindahkan pencatatan manual ke layar komputer). Namun setelah mempelajari Mibebi, saya menyadari bahwa data reservasi memiliki nilai strategis yang jauh lebih besar. Sebuah aplikasi menjadi bernilai tinggi bukan karena jumlah tabel databasenya yang banyak, melainkan ketika sistem mampu menghubungkan data tersebut untuk mengantisipasi masalah operasional nyata—seperti mengingatkan tamu sebelum terlambat check-out dan menyajikan data okupansi secara real-time.

2. **Fitur apa dalam aplikasi Anda yang sebelumnya dianggap sebagai fitur unggulan tetapi ternyata merupakan fitur inti?**  
   *Jawab:* Fitur **"Riwayat Pemesanan Kamar (*Booking History*) dan Pencatatan Status Transaksi"**. Sebelumnya saya menganggap fitur riwayat ini sebagai keunggulan tambahan. Namun setelah diuji dengan prinsip Mibebi, jika fitur riwayat pesanan dan status transaksi dihilangkan, sistem tidak dapat membuktikan keabsahan hak menginap tamu dan resepsionis tidak bisa melakukan audit pembayaran. Artinya, riwayat pesanan adalah **fitur inti**, bukan nilai tambah.

3. **Apa tiga fitur yang sekarang Anda anggap benar-benar menjadi nilai tambah bagi HotelKu Yogyakarta?**  
   *Jawab:*
   - *Fitur 1:* **Pengingat Check-Out Otomatis (T-2 Jam)** dengan menu aksi cepat konfirmasi dan pengajuan late check-out.
   - *Fitur 2:* **Notifikasi Kamar Siap Check-In (*Room Ready Notification*)** untuk memangkas antrean dan ketidakpastian tamu di lobi.
   - *Fitur 3:* **Dashboard Monitoring Status Kamar & Okupansi Real-Time** dengan jam operasional hotel sinkron.

4. **Dari ketiga fitur tersebut, mana yang mempunyai dampak terbesar bagi kenyamanan tamu dan operasional hotel?**  
   *Jawab:* **Fitur Pengingat Check-Out Otomatis (T-2 Jam).** Keterlambatan check-out adalah salah satu sumber perselisihan paling sering terjadi antara hotel dan tamu karena denda biaya tambahan (*late charge*). Dengan memberikan peringatan sopan 2 jam sebelumnya, tamu dapat berkemas dengan nyaman tanpa terburu-buru, resepsionis mendapatkan kepastian jadwal kamar kosong, dan alur pergantian tamu berjalan tepat waktu.

5. **Dari ketiga fitur tersebut, mana yang paling realistis untuk dikembangkan dalam masa tugas akhir?**  
   *Jawab:* **Fitur Pengingat Check-Out Otomatis (T-2 Jam).** Fitur ini sangat realistis dan elegan untuk dikembangkan karena memanfaatkan data reservasi aktif yang sudah ada. Logika komparasi waktunya sangat terstruktur, dan antarmukanya dapat diwujudkan dalam bentuk banner notifikasi interaktif di portal tamu yang langsung menarik perhatian penguji saat demonstrasi skripsi.
