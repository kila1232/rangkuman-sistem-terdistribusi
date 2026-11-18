# Materi Minggu 3: Sinkronisasi dan Koordinasi pada Sistem Terdistribusi

```text
Materi Minggu 3: Sinkronisasi dan Koordinasi pada Sistem Terdistribusi
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: Rangkum materi 03--sinkronisasi-sistem-terdistribusi.pdf (49 slide) menjadi catatan Markdown berbahasa Indonesia yang detail: pengertian dan tantangan sinkronisasi, race condition, sincronisasi waktu fisik (UTC, TAI, GPS, NTP, PTP), waktu logis (Lamport dan vector clock beserta contoh perhitungan), mutual exclusion (centralized, Ricart-Agrawala, token-based), pemilihan koordinator (Bully, Ring, Raft/Paxos). Sertakan analogi, contoh, dan penjelasan source code vclocks.py serta multithreads-example.py.
Bagian yang disesuaikan dari keluaran prompt ada pada: struktur heading, analogi (ditulis ulang), contoh kasus tambahan, tabel perbandingan algoritma, langkah perhitungan vector clock, penjelasan kode, dan daftar istilah.
```

> **Mata kuliah:** Sistem Terdistribusi dan Terdesentralisasi (FIF25002T, 3 SKS)
> **Program studi:** Informatika — Fakultas Teknologi Informasi, UTDI
> **Dosen:** Dr. Bambang Purnomosidi D. P.
> **Sumber:** materi kuliah pertemuan 3 (`03--sinkronisasi-sistem-terdistribusi.pdf`)
> **Kode:** [`kode/vclocks.py`](kode/vclocks.py), [`kode/multithreads-example.py`](kode/multithreads-example.py)
> **Status:** lengkap

## Tujuan Pembelajaran

- Menjelaskan mengapa sinkronisasi diperlukan untuk koordinasi pada sistem terdistribusi.
- Menjelaskan berbagai tantangan sinkronisasi.
- Menjelaskan sinkronisasi **waktu fisik** beserta algoritma dan protokolnya.
- Menjelaskan sinkronisasi **waktu logis** beserta algoritmanya.
- Menjelaskan masalah **mutual exclusion** dan algoritma solusinya.
- Menjelaskan masalah **pemilihan koordinator** dan cara memecahkannya.
- Memberikan contoh studi kasus nyata di industri.

## 1. Apa Itu Sinkronisasi?

**Sinkronisasi** adalah koordinasi proses, data, dan sumber daya di berbagai node agar operasi tetap **konsisten dan andal**.

Sinkronisasi menjawab tiga tantangan sekaligus:

1. menjaga **konsistensi data**,
2. mengelola **proses yang berjalan bersamaan** (konkuren),
3. mencapai **perilaku sistem yang koheren** di seluruh node.

Tanpa mekanisme ini, sistem bisa mengalami **data race**/**race condition**: hasil akhir bergantung pada urutan eksekusi yang tidak bisa diprediksi.

> **Analogi:** Dua kasir menerima pesanan untuk **kursi bioskop nomor 7** pada detik yang hampir sama. Masing-masing melihat layar masih menampilkan "tersedia", lalu keduanya menjual kursi yang sama. Masalahnya bukan pada kecepatan komputer, melainkan pada **tidak adanya aturan giliran** saat membaca dan mengubah data.

### 1.1 Contoh Race Condition: Stok Produk

Kasus dari materi (e-commerce):

- Stok produk X = 10.
- **User A** membeli 1 unit; **User B** membeli 1 unit.
- A membaca stok → 10 → merasa aman, lanjut membeli.
- B membaca stok → 10 → juga merasa aman, lanjut membeli.
- Proses A mengurangi stok → 9.
- Proses B mengurangi stok → 9 (menimpa hasil A, bukan menghitung dari 9).

Hasil sebenarnya: 2 pembelian, stok seharusnya **8**. Yang tercatat: 2 pembelian, stok **9**.

Celahnya ada pada pola **read–modify–write** yang tidak atomik. Solusi umum: **mutual exclusion** (bagian kode pengurangan stok hanya boleh dijalankan satu proses), operasi atomik (`UPDATE stok = stok - 1 WHERE stok >= 1`), atau mekanisme **optimistic locking** dengan versi data.

> **Contoh lain:** dua editor mengedit daftar hadir yang sama. Keduanya membuka data versi lama; yang menyimpan terakhir menghapus perubahan yang lain (*lost update*).

## 2. Mengapa Sinkronisasi Penting?

| Alasan | Penjelasan dan contoh |
| --- | --- |
| **Integritas data** | Mencegah data race dan race condition |
| **Sinkronisasi state** | State aplikasi harus sama di semua node. Contoh: game multiplayer mengirim posisi, health, dan inventaris pemain ke semua klien; keranjang belanja web harus konsisten antara browser dan database |
| **Koordinasi tasks** | Tugas yang bergantung satu sama lain dijalankan dengan urutan benar |
| **Pengelolaan resources** | Printer, file, atau baris database dipakai bergantian, bukan bersamaan |
| **Mekanisme recovery** | State dipelihara agar sistem bisa pulih setelah crash |
| **Utilisasi efisien** | Mencegah pekerjaan ganda/redundan |
| **Load balancing** | Beban kerja dibagi merata antar node |
| **Mencegah deadlock** | Menghindari proses saling menunggu selamanya |
| **Operasi skalabel** | Penambahan node tidak merusak konsistensi |

## 3. Deadlock

**Deadlock** terjadi ketika sekumpulan proses saling menunggu sumber daya yang dipegang proses lain, sehingga tidak ada yang bisa maju.

Empat kondisi yang harus terpenuhi (Coffman):

1. **Mutual exclusion** — sumber daya hanya dipakai satu proses.
2. **Hold and wait** — proses memegang satu sumber daya sambil menunggu yang lain.
3. **No preemption** — sumber daya tidak bisa direbut paksa.
4. **Circular wait** — ada siklus saling menunggu.

> **Analogi:** Dua mobil berhadapan di jalan sempit; masing-masing menunggu yang lain mundur, dan tidak ada yang mau bergerak lebih dulu.

Pada sistem terdistribusi, deadlock lebih sulit dideteksi karena tidak ada pengamat global: informasi status tersebar di banyak node dan harus dikumpulkan lewat pesan.

## 4. Tantangan Sinkronisasi

- **Network latency dan partitioning** — pesan terlambat atau node terpisah; tidak ada cara memastikan urutan global secara instan.
- **Skalabilitas** — makin banyak node, makin banyak pesan koordinasi.
- **Fault tolerance** — koordinator atau node bisa gagal di tengah proses.
- **Concurrency control** — mengatur akses paralel ke data bersama.
- **Data consistency** — menentukan tingkat konsistensi yang dapat diterima.
- **Sinkronisasi waktu** — jam tiap node berbeda.

## 5. Sinkronisasi Waktu Fisik

**Definisi:** penyelarasan jam nyata (*real-time clock*) seluruh sistem terhadap satu standar acuan agar waktu konsisten.

**Mengapa penting:** korelasi log antar node, penjadwalan event, dan konsistensi sistem (mis. urutan transaksi, masa berlaku token, timeout).

**Caranya:** memakai protokol sinkronisasi dan/atau sumber perangkat keras berupa **atomic clock** dan/atau **GPS** yang tersinkron dengan atomic clock.

### 5.1 Standar Waktu

| Standar | Keterangan |
| --- | --- |
| **GMT** (Greenwich Mean Time) | Standar lama, **sudah tidak digunakan** |
| **UTC** (Universal Coordinated Time) | Didefinisikan **ITU** (International Telecommunication Union); dipakai sebagai standar sejak **1963** |
| **TAI** (Temps Atomique International) | Basis perhitungan UTC; waktu atom internasional, dari bahasa Prancis |
| **LTC** (Coordinated Lunar Time) | Masih dalam pengembangan (untuk aktivitas di Bulan) |

> **Analogi:** TAI adalah **"detak jantung"** atom yang sangat stabil, sedangkan UTC adalah **"jam dinding"** yang disesuaikan agar cocok dengan rotasi Bumi — termasuk penambahan *leap second*.

### 5.2 Rantai Sinkronisasi Waktu

```text
Atomic Clock (master) -> Atomic Clock di satelit GPS -> GPS (time signal)
   -> GPS dongle (device /dev/ttyACM0) -> NTP/PTP server -> client OS
   -> (Linux, Windows, macOS, mobile phone, ...)
```

Dengan kata lain: master atomic clock disinkronkan dari atomic clock di GPS; GPS memancarkan sinyal waktu; GPS dongle menerima sinyal tersebut (materi menyebut device `/dev/ttyACM0`); server NTP/PTP membaca sumber itu; lalu client OS menyinkronkan jamnya.

### 5.3 Di Mana Atomic Clock Berada?

- **Satelit GPS** — dikelola U.S. Space Force; sekitar **31 satelit GPS** di Medium Earth Orbit (MEO), masing-masing membawa atomic clock.
- **Deep Space Atomic Clock (DSAC)** — diluncurkan NASA tahun **2019** pada wahana Orbital Test Bed di orbit rendah Bumi untuk menguji stabilitas.
- **International Space Station (ISS)** — misi **ACES** (Atomic Clock Ensemble in Space) menempatkan *cold-atom clock* di orbit rendah Bumi.
- **Ground control** — pengelolaan master clock di darat: **U.S. Naval Observatory** (Washington, D.C.) dan **Schriever Space Force Base** (Colorado).

### 5.4 NTP (Network Time Protocol)

- Protokol sinkronisasi waktu tertua dan paling banyak dipakai, bekerja di atas UDP.
- Menyebarkan waktu dari server acuan ke client melalui jaringan, dengan kompensasi latensi perjalanan pesan.
- Cocok untuk kebutuhan umum (akurasi biasanya milidetik).

### 5.5 PTP (Precision Time Protocol)

- Standar **IEEE 1588**: versi **IEEE 1588-2002**, **IEEE 1588-2008** (PTPv2, **tidak** backward compatible dengan 2002), dan **IEEE 1588-2019** (perbaikan yang backward compatible dengan 2008).
- IEEE 1588-2008 memperkenalkan konsep **profile**.
- **IEEE 802.1AS** adalah adaptasi PTP yang disebut **gPTP**, untuk **Audio Video Bridging (AVB)** dan **Time-Sensitive Networking (TSN)**.
- Implementasi di Linux: **linuxptp** (URL lama `linuxptp.sourceforge.net`, URL baru `linuxptp.nwtime.org`); panduan sinkronisasi hardware/system ada di `tsn.readthedocs.io`.
- Memberi akurasi jauh lebih tinggi daripada NTP (hingga submikro/nanodetik).
- **Syarat perangkat:** NIC harus mendukung **hardware timestamping**. NIC tanpa dukungan ini tidak dapat mencapai akurasi PTP.

| Aspek | NTP | PTP |
| --- | --- | --- |
| Standar | RFC (IETF) | IEEE 1588 (gPTP: IEEE 802.1AS) |
| Akurasi | Milidetik | Submikro–nanodetik |
| Timestamp | Umumnya software | Idealnya hardware (NIC) |
| Penggunaan | Server umum, OS client | Industri, otomasi, TSN, AVB, sistem *real-time* |

## 6. Sinkronisasi Waktu Logis

**Waktu logis** menetapkan **urutan sebab-akibat** (*causal order*) kejadian **tanpa** bergantung pada jam fisik.

Sifat dasar: jika **A → B** dan **B → C**, maka **A → C** (*transitivity*).

Dasar teorinya adalah **Lamport logical clock** (sudah dibahas di minggu 2): setiap kejadian menaikkan penghitung, dan penerima pesan mengambil nilai maksimum lalu menambah 1.

> **Analogi:** Dalam buku catatan rapat, yang menentukan urutan bukan jam tangan peserta, melainkan **nomor agenda**: notulen nomor 3 selalu dianggap setelah nomor 2, walaupun ditulis lebih lambat.

## 7. Vector Clocks

**Vector clock** menyimpan satu angka **per proses**, sehingga bisa membedakan:

- kejadian yang **berurutan** (*happens-before*), dan
- kejadian yang **independen/konkuren**.

Catatan istilah dari materi: *vector* berukuran dinamis, *array* berukuran tetap. Pada implementasi, vector clock direpresentasikan sebagai array sepanjang jumlah proses.

### 7.1 Kondisi Awal (3 proses: A, B, C)

Posisi indeks mengikuti identitas proses: A di index 0, B di index 1, C di index 2.

| Proses | Vector clock |
| --- | --- |
| A | `[0, 0, 0]` |
| B | `[0, 0, 0]` |
| C | `[0, 0, 0]` |

**Jenis kejadian:** *internal event* dan *send/receive message*. Setiap kali terjadi kejadian, tambahkan 1 pada **slot milik proses itu sendiri**.

### 7.2 Langkah demi Langkah

| Langkah | Kejadian | Perhitungan | Hasil |
| --- | --- | --- | --- |
| 1 | A melakukan *internal event* | `[0,0,0]` + 1 di slot A | A = `[1,0,0]` |
| 2 | A akan mengirim pesan ke B | tambah 1 dulu, lalu sertakan clock | A = `[2,0,0]`, pesan membawa `[2,0,0]` |
| 3 | B menerima pesan | elemen-wise max(`[2,0,0]`, `[0,0,0]`) = `[2,0,0]` | B = `[2,0,0]` |
| 4 | B akan mengirim pesan ke C | tambah 1 di slot B, sertakan clock | B = `[2,1,0]`, pesan membawa `[2,1,0]` |
| 5 | C menerima pesan lalu *internal event* | max(`[2,1,0]`, `[0,0,0]`) = `[2,1,0]`, lalu +1 di slot C | C = `[2,1,1]` |
| 6 | C melakukan *internal event* lagi | +1 di slot C | C = `[2,1,2]` |

**Posisi akhir:**

```text
A [2, 0, 0]
B [2, 1, 0]
C [2, 1, 2]
```

Perhatikan: A tidak pernah bertambah lagi setelah mengirim, sedangkan B dan C terus mencatat kemajuan masing-masing.

### 7.3 Aturan Perbandingan

- **A terjadi sebelum B** jika **semua** komponen clock A **≤** komponen B, dan **minimal satu** komponen lebih kecil.
- **Konkuren (independen)** jika tidak semua komponen A ≤ komponen B **dan** tidak semua komponen B ≤ komponen A.

### 7.4 Uji Kasus

| Pertanyaan | Perbandingan | Kesimpulan |
| --- | --- | --- |
| Apakah event pertama A terjadi sebelum atau sesudah B? | A `[1,0,0]` vs B `[0,0,0]` | **B lebih dulu** (B → A) |
| Setelah A mengirim pesan dan B bereaksi, siapa lebih dulu? | A `[2,0,0]` vs B `[2,1,0]` | **A lebih dulu** (A → B) |
| Apakah kejadian terakhir C terjadi sebelum A? | C `[2,1,2]` vs A `[2,0,0]` | **Independen/konkuren** — C lebih besar di slot B dan C, tetapi A tidak ≤ C secara keseluruhan dan C tidak ≤ A |

> **Analogi:** Setiap proses punya **buku tamu sendiri**. Saat bertukar pesan, keduanya saling menyalin nomor terbesar dari setiap buku. Dengan begitu, dari isi buku bisa diketahui siapa yang "tahu" tentang kejadian siapa — dan kejadian yang tidak saling tahu berarti berjalan **bersamaan**.

## 8. Mutual Exclusion

**Prinsip:** memastikan hanya **satu** proses/thread yang mengakses sumber daya bersama pada satu waktu, untuk mencegah konflik dan menjaga integritas data.

- Banyak proses mungkin memerlukan akses eksklusif ke sumber daya bersama: **printer, file, database**.
- Bagian kode yang mengakses sumber daya bersama disebut **critical section (CS)**.
- Jika lebih dari satu proses masuk CS bersamaan → inkonsistensi atau kerusakan data.

**Empat prinsip yang harus dipenuhi:**

1. **Mutual exclusion** — hanya satu proses di dalam CS.
2. **Progress** — jika tidak ada proses di CS, sumber daya harus bisa segera diakses (tidak ada penundaan yang tidak perlu).
3. **Bounded waiting** — tidak ada proses yang menunggu selamanya.
4. **Fairness** — permintaan dilayani dalam urutan yang wajar.

### 8.1 Pendekatan Solusi

| Algoritma | Cara kerja | Kelebihan | Kekurangan |
| --- | --- | --- | --- |
| **Centralized** | Satu node menjadi koordinator: proses meminta izin, koordinator memberi akses bila CS bebas, dan memberi giliran berikutnya saat dilepas | Sederhana, biaya rendah (3 pesan: request, grant, release) | **Single point of failure**, bisa menjadi bottleneck |
| **Ricart–Agrawala** | Terdistribusi penuh tanpa koordinator; setiap proses mengirim permintaan ber-**timestamp** dan baru masuk CS setelah **semua** proses lain menjawab **OK** | Fault tolerant, tidak ada titik tunggal | Overhead pesan tinggi: **2 × (N − 1)** pesan per pemasukan CS (N−1 request + minimal N−1 reply) |
| **Token-based** | Satu **token** unik berputar antar proses; hanya pemegang token boleh masuk CS | Hanya **1 pesan** per pemasukan CS | Sulit mendeteksi token hilang; perlu mekanisme pemulihan |

> **Analogi:** Centralized = **satu petugas loket** yang memberi nomor; Ricart–Agrawala = **janji antar teman** (semua harus setuju); token-based = **satu kunci fisik** yang dioper bergiliran.

## 9. Pemilihan Koordinator

Beberapa node mungkin memerlukan **satu koordinator** untuk:

- mengelola sumber daya bersama,
- menyinkronkan operasi,
- membuat keputusan global.

Ketika koordinator **gagal** atau node baru **bergabung**, sistem harus memilih pemimpin baru secara otomatis.

### 9.1 Algoritma

| Algoritma | Ide dasar |
| --- | --- |
| **Bully Algorithm** | Node dengan ID tertinggi yang masih hidup mengambil alih; node yang gagal mendeteksi koordinator mati akan "menantang" dengan ID-nya |
| **Ring Algorithm** | Node disusun dalam lingkaran; pesan pemilihan berputar, ID tertinggi menang |
| **Raft / Paxos** | Berbasis **konsensus**: mayoritas node menyepakati pemimpin baru, tahan terhadap partisi jaringan |

### 9.2 Contoh Nyata

- **Apache ZooKeeper** memakai **Zab** (ZooKeeper Atomic Broadcast), mirip Paxos, untuk menjaga konsistensi dan memilih leader.
- **Kubernetes** memakai **Raft** melalui **etcd** untuk menyimpan state cluster dan menentukan leader.

> **Analogi:** Ketika ketua kelas tidak masuk, kelas memilih ketua baru. Bully = "yang nomor absennya paling besar jadi ketua"; Ring = "giliran berputar sampai ketemu nominal terbesar"; Raft/Paxos = "keputusan sah jika disetujui mayoritas".

## 10. Penjelasan Source Code

### 10.1 `kode/vclocks.py` — Vector Clock

Struktur kelas:

| Method | Fungsi |
| --- | --- |
| `__init__(num_processes, process_id)` | Membuat array clock berisi nol dan menyimpan ID proses |
| `increment()` | Menambah 1 pada slot milik proses sendiri (internal event) |
| `send_message()` | `increment()` lalu mengembalikan **salinan** vector untuk dikirim |
| `receive_message(clocks)` | Elemen-wise **max** dengan vector yang diterima, lalu `increment()` |
| `happens_before(other)` | True jika semua komponen ≤ dan minimal satu < |
| `is_concurrent(other)` | True jika **tidak** saling *happens-before* |

Alur simulasi 3 proses pada skrip:

1. Semua proses mulai dari `[0, 0, 0]`.
2. P0 melakukan internal event → `[1, 0, 0]`.
3. P0 mengirim pesan → naik ke `[2, 0, 0]`; P1 menerima → `[2, 1, 0]` (max lalu +1 di slot P1).
4. P2 melakukan internal event → `[0, 0, 1]`.
5. P1 mengirim pesan → `[2, 2, 0]`; P2 menerima → max(`[2,2,0]`,`[0,0,1]`) = `[2,2,0]` lalu +1 → `[2, 2, 2]`.
6. Pemeriksaan kausalitas:

```text
P0: [2, 0, 0]
P1: [2, 2, 0]
P2: [2, 2, 2]

VC0 happens before VC1: True
VC1 happens before VC0: False
VC0 is concurrent with VC2: False   # P2 sudah "tahu" kejadian P0 lewat pesan P1
```

Poin penting: `is_concurrent` hanya bernilai True bila kedua vector **tidak** bisa diurutkan — artinya benar-benar tidak ada jalur pesan di antara keduanya.

### 10.2 `kode/multithreads-example.py` — Multithreading

- Membuat 5 thread (`A`–`E`), masing-masing menjalankan `task(name, delay)` dengan `time.sleep(5)`.
- `start()` menjalankan semua thread hampir bersamaan; `join()` menunggu semuanya selesai sebelum mencetak `All tasks completed.`
- Total waktu ± **5 detik**, bukan 25 detik — inilah manfaat konkurensi untuk pekerjaan **I/O-bound**.
- Urutan baris "finished" bisa berbeda-beda setiap dijalankan → contoh nyata eksekusi **non-deterministik** yang menjadi alasan diperlukannya sinkronisasi.
- Catatan: pada CPython, GIL membatasi paralelisme CPU, tetapi `sleep`/I/O melepas GIL sehingga tetap efektif.

## 11. Ringkasan Cepat

- Sinkronisasi = koordinasi agar proses, data, dan sumber daya tetap konsisten.
- Race condition muncul saat pola baca–ubah–tulis tidak atomik (contoh: stok barang).
- Waktu fisik: acuan **UTC** yang berbasis **TAI**; disebarkan lewat **GPS** dengan protokol **NTP** (milidetik) atau **PTP** (submikro/nanodetik, butuh hardware timestamping).
- Waktu logis: **Lamport clock** untuk urutan, **vector clock** untuk membedakan urutan vs konkurensi.
- Mutual exclusion: centralized (sederhana, ada SPOF), Ricart–Agrawala (fault tolerant, boros pesan), token-based (hemat pesan, rawan token hilang).
- Pemilihan koordinator: Bully, Ring, atau konsensus (Raft/Paxos); contoh industri ZooKeeper (Zab) dan Kubernetes (etcd + Raft).

## Daftar Istilah

| Istilah | Arti singkat |
| --- | --- |
| Race condition | Hasil bergantung pada urutan akses yang tidak terkendali |
| Critical section | Bagian kode yang mengakses sumber daya bersama |
| Mutual exclusion | Jaminan hanya satu proses di dalam critical section |
| Deadlock | Proses saling menunggu sehingga tidak ada yang maju |
| TAI | Temps Atomique International — acuan waktu atom |
| UTC | Standar waktu sipil internasional berbasis TAI |
| NTP | Protokol sinkronisasi waktu berbasis jaringan (akurasi milidetik) |
| PTP | IEEE 1588, sinkronisasi waktu presisi tinggi; gPTP = IEEE 802.1AS |
| Hardware timestamping | Pencatatan waktu oleh NIC, syarat akurasi PTP |
| Happens-before | Relasi urutan kausal antar kejadian |
| Vector clock | Array penghitung per proses untuk mendeteksi urutan dan konkurensi |
| Ricart–Agrawala | Algoritma mutual exclusion terdistribusi berbasis timestamp |
| Token-based | Mutual exclusion dengan satu token yang berputar |
| Bully / Ring | Algoritma pemilihan koordinator berbasis ID |
| Raft / Paxos | Protokol konsensus untuk kesepakatan dan pemilihan leader |

---

[← Minggu 2](../02/README.md) · [Daftar materi](../README.md) · [Minggu berikutnya →](../04/README.md)
