# Materi Minggu 4: Konsistensi dan Replikasi pada Sistem Terdistribusi

```text
Materi Minggu 4: Konsistensi dan Replikasi pada Sistem Terdistribusi
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: Rangkum materi 04--konsistensi-dan-replikasi.pdf (42 slide) beserta lecture notes PostgreSQL 18 streaming replication dan Apache Ignite 3 cluster menjadi catatan Markdown berbahasa Indonesia: definisi dan pentingnya konsistensi, teorema CAP, tujuh model konsistensi, trade-off latensi, konsep dan jenis replikasi, strategi sinkronisasi (waktu, arah, cara, penanganan konflik), protokol replikasi (primary-based, quorum, state machine, gossip, chain), serta studi kasus PostgreSQL dan Apache Ignite. Sertakan analogi, contoh perhitungan, penjelasan source code, dan jawaban pertanyaan diskusi.
Bagian yang disesuaikan dari keluaran prompt ada pada: struktur heading, analogi dan contoh (ditulis ulang), tabel perbandingan model konsistensi dan jenis replikasi, langkah perhitungan kuorum, contoh CRDT dan OT dengan nama berbeda, penjelasan konfigurasi Docker, serta daftar istilah.
```

> **Mata kuliah:** Sistem Terdistribusi dan Terdesentralisasi (FIF25002T, 3 SKS)
> **Program studi:** Informatika — Fakultas Teknologi Informasi, UTDI
> **Dosen:** Dr. Bambang Purnomosidi D. P.
> **Sumber:** materi kuliah pertemuan 4 (`04--konsistensi-dan-replikasi.pdf`), *lecture notes* `streaming-replication-postgresql-18.pdf` dan `apache-ignite3-cluster.pdf`
> **Kode:** [`kode/postgresql`](kode/postgresql) (streaming replication), [`kode/ignite`](kode/ignite) (cluster master-master)
> **Status:** lengkap

## Tujuan Pembelajaran

- Menjelaskan konsep konsistensi pada sistem terdistribusi.
- Menjelaskan berbagai model konsistensi.
- Menjelaskan konsep replikasi data.
- Menjelaskan berbagai protokol dan strategi replikasi.
- Menganalisis studi kasus replikasi pada sistem nyata di industri.

## 1. Apa Itu Konsistensi?

**Konsistensi** adalah jaminan bahwa semua node dalam sistem memiliki data yang **sama atau tampak sama** pada waktu tertentu, meskipun data tersimpan di banyak tempat dan dapat diubah bersamaan oleh pengguna/proses berbeda.

Inti masalahnya: data punya banyak salinan di server berbeda lokasi. Ketika satu server diubah, sistem harus memastikan salinan lain **akhirnya** memuat nilai yang sama.

> **Analogi:** Nilai rapor yang dicetak di beberapa kantor cabang. Kalau nilai di cabang Jakarta sudah diperbaiki tetapi di Yogyakarta masih versi lama, maka orang tua yang mengambil rapor di Yogyakarta akan melihat angka yang salah — walaupun sistemnya "berjalan normal".

## 2. Mengapa Konsistensi Penting?

Tanpa konsistensi, pengguna bisa melihat versi data berbeda tergantung server mana yang dibaca.

**Kasus transfer bank:**

- Nasabah memindahkan dana dari rekening **A** ke **B**.
- Server 1 sudah mengurangi saldo A, tetapi server 2 belum menambah saldo B.
- Nasabah tidak bisa bertransaksi dari rekening B karena saldonya belum bertambah (saldo tidak mencukupi).
- Inilah bentuk **inkonsistensi**: perubahan sudah terjadi, tetapi belum terlihat seragam.

Alasan lain: data tersebar di banyak node sehingga rawan berbeda; tujuan akhirnya adalah pengguna melihat data yang **benar dan mutakhir**; dan selalu ada **trade-off** antara *Consistency*, *Availability*, dan *Partition Tolerance* (CAP theorem).

## 3. Teorema CAP

Partisi jaringan (koneksi terputus) adalah hal yang **wajar** — sebaik apa pun jaringan, partisi tetap bisa terjadi. Karena itu kondisi ideal CAP (ketiganya sekaligus) secara praktis tidak mungkin.

| Huruf | Arti |
| --- | --- |
| **C**onsistency | Semua node memiliki data yang sama |
| **A**vailability | Data tersedia saat pengguna membutuhkannya |
| **P**artition Tolerance | Sistem tetap berjalan meski sebagian jaringan gagal/terputus |

**Contoh e-commerce dengan dua server:**
- Server A melayani Indonesia barat, Server B melayani Indonesia timur.
- Jaringan antar wilayah terputus (partition).
- **Pilih AP** → pengguna tetap bisa berbelanja di kedua wilayah, tetapi stok bisa sementara tidak sinkron.
- **Pilih CP** → sistem menolak transaksi sampai jaringan pulih, sehingga stok tetap konsisten tetapi ketersediaan dikorbankan.

> **Analogi:** Dua kasir di gedung berbeda dengan buku stok terpisah. Saat telepon antar gedung mati, kasir harus memilih: tetap melayani pembeli dengan risiko stok dobel (AP), atau menutup penjualan sampai telepon hidup lagi (CP).

## 4. Model Konsistensi

**Model konsistensi** adalah aturan/jaminan tentang **kapan** perubahan data terlihat oleh node atau client lain. Setiap model menentukan seberapa cepat semua salinan menjadi sama setelah update.

### 4.1 Strong Consistency

- Setelah data diperbarui, **semua node langsung** melihat versi terbaru.
- Setiap `read` setelah `write` pasti mendapatkan nilai yang sama.
- Biasanya memakai protokol seperti **Two-Phase Commit** atau **Paxos**.
- Contoh: **sistem perbankan** — saldo berubah, semua server harus segera tahu.

### 4.2 Eventual Consistency

- Tidak menjamin data langsung sama, tetapi **akhirnya** akan sama jika tidak ada update baru dalam jangka waktu tertentu.
- Cocok untuk sistem yang mengutamakan **availability** dan kecepatan.
- Terkait konsep **BASE**: *Basically Available*, *Soft state*, *Eventual consistency*.
- Contoh: **Amazon DynamoDB, Apache Cassandra**.

**BASE secara rinci:**

| Komponen | Arti |
| --- | --- |
| **Basically Available** | Data tetap bisa dibaca/ditulis meski ada kegagalan sebagian atau partisi |
| **Soft State** | Replika tidak harus konsisten setiap saat; keadaan sistem berubah seiring waktu |
| **Eventual Consistency** | Data akan konsisten di semua node bila tidak ada update lagi setelah beberapa waktu |

### 4.3 Causal Consistency

- Jika satu operasi **bergantung** pada operasi lain, urutan itu harus dijaga.
- Operasi yang tidak berhubungan boleh dilihat dalam urutan berbeda oleh node lain.
- Contoh: di media sosial, **komentar tidak boleh muncul sebelum postingannya**.

### 4.4 Read-Your-Writes Consistency

- Setelah pengguna menulis, pembacaan berikutnya **oleh pengguna itu** melihat hasil tulisannya.
- Tidak menjamin orang lain langsung melihat hal yang sama.
- Contoh: pesan yang kita kirim langsung muncul di layar kita, meski penerima belum membacanya.

### 4.5 Monotonic Read Consistency

- Pembacaan berulang oleh pengguna **tidak akan mundur** ke versi yang lebih lama.
- Contoh: *timeline* media sosial tidak kembali ke versi lama setelah di-*refresh*.

### 4.6 Sequential Consistency

- Semua operasi tampak dieksekusi dalam **urutan yang sama bagi semua node**, meski tidak harus real-time.
- Urutan penulisan penting, tetapi tidak harus langsung sinkron.
- Contoh: semua pengguna melihat urutan posting yang sama, walau ada sedikit jeda.

### 4.7 Linearizability

- Varian **paling kuat** dari strong consistency.
- Operasi tampak **atomik dan langsung**, dengan urutan sama bagi semua node.
- Setelah penulisan selesai, semua pembacaan berikutnya (oleh client mana pun) mencerminkan penulisan itu atau penulisan sesudahnya.
- Sistem tampak seperti **satu node atomik tunggal** dengan pengurutan global secara real-time.
- Digunakan pada **etcd, ZooKeeper, Google Spanner**.
- Contoh: pengecekan keunikan **username/ID** — dua pengguna tidak boleh mendaftar nama yang sama bersamaan.

### 4.8 Ringkasan Perbandingan

| Model | Kekuatan | Jaminan utama | Contoh |
| --- | --- | --- | --- |
| Linearizability | Paling kuat | Urutan global real-time, atomik | etcd, Spanner, cek username unik |
| Sequential | Kuat | Semua node melihat urutan operasi yang sama | Feed media sosial |
| Strong | Kuat | Read setelah write selalu data terbaru | Perbankan |
| Causal | Menengah | Urutan sebab-akibat dijaga | Komentar setelah posting |
| Read-your-writes | Menengah | Konsisten untuk penulisnya sendiri | Aplikasi messaging |
| Monotonic read | Menengah | Tidak pernah mundur ke versi lama | Timeline |
| Eventual | Paling lemah | Konvergen pada akhirnya | DynamoDB, Cassandra |

## 5. Trade-off Latensi vs Konsistensi

Semakin tinggi konsistensi yang dijamin, semakin besar latensi yang harus ditanggung.

- **Konsistensi ↑ → Latensi ↑**
- **Konsistensi ↓ → Latensi ↓**

**Contoh dua pusat data (Jakarta dan Yogyakarta):** pengguna mengubah data di Jakarta, lalu ada permintaan baca.

| Pilihan | Perilaku | Akibat |
| --- | --- | --- |
| Strong consistency | Tunggu Jakarta dan Yogyakarta identik sebelum menjawab | Data konsisten, respons lambat |
| Eventual consistency | Jawab langsung dari node terdekat, sinkronisasi menyusul | Respons cepat, data bisa berbeda sementara |

> **Analogi:** Menunggu semua cabang mencatat perubahan di buku besar sebelum memberi tanda "selesai" (lambat tapi pasti), versus langsung memberi struk dan menyusulkan pencatatan ke cabang lain (cepat tapi bisa beda sesaat).

## 6. Replikasi Data

**Replikasi** = proses membuat dan memelihara **salinan data yang sama** di beberapa node/server.

Contoh: database utama di **Jakarta**, lalu ditambah salinan di **Yogyakarta** dan **Denpasar** untuk *high availability*. Menjaga ketiga salinan tetap sama adalah inti replikasi.

**Tujuan replikasi:**

| Tujuan | Penjelasan |
| --- | --- |
| **Availability** | Jika satu server gagal, server lain masih punya salinan |
| **Performance** | Pengguna membaca dari server terdekat (lebih cepat) |
| **Reliability** | Risiko kehilangan data menurun karena ada cadangan di banyak tempat |
| **Scalability** | Beban baca dibagi ke beberapa server |

## 7. Jenis Replikasi

| Jenis | Cara kerja | Kelebihan | Kekurangan | Contoh |
| --- | --- | --- | --- | --- |
| **Master–Slave** (primary–secondary) | Master menulis, slave membaca | Konsistensi kuat, sederhana | Bottleneck di master | PostgreSQL streaming replication |
| **Multi-Master** (peer-to-peer) | Semua node bisa baca dan tulis | Fleksibel, tahan kegagalan | Rawan konflik data | PostgreSQL logical replication, Cassandra, MongoDB, Apache Ignite |
| **Synchronous** | Update ditulis ke semua node sebelum dianggap selesai | Konsisten | Lambat | Google Spanner |
| **Asynchronous** | Update dikirim setelah transaksi selesai di master | Cepat | Ada jeda data (*replication lag*) | MySQL async, DynamoDB |

## 8. Strategi Sinkronisasi Replika

### 8.1 Berdasarkan Waktu Sinkronisasi

| Mode | Perilaku | Karakter |
| --- | --- | --- |
| **Asynchronous** | Sumber commit tanpa menunggu replika | Tercepat, risiko kehilangan data tertinggi |
| **Semi-synchronous** | Sumber menunggu **satu** replika menerima data | Seimbang; dipakai **MySQL** |
| **Synchronous** | Sumber menunggu **semua** replika commit | Konsistensi tertinggi, performa terendah |

### 8.2 Berdasarkan Arah Replikasi

- **Master–slave**: satu node `read-write`, sisanya `read`.
- **Master–master**: semua node berperan setara (`read-write` dengan peran dan kapabilitas sama).
- **Master–master asimetris**: semua bisa `read-write`, tetapi peran dan kapabilitas berbeda.

### 8.3 Berdasarkan Cara Sinkronisasi

- **Pull-based** — replika memeriksa update ke sumber secara periodik; jika ada update, diambil; jika tidak, tidak terjadi apa-apa.
- **Push-based** — sumber aktif mengirim update ke replika saat terjadi perubahan, biasanya dengan **CDC (Change Data Capture)** lalu dikirim via **WebSocket** atau **SSE (Server-Sent Events)**.
- **Hybrid** — campuran keduanya.

### 8.4 Berdasarkan Penanganan Konflik

Ketika terjadi **multiple updates**, konflik harus diselesaikan:

| Metode | Cara kerja |
| --- | --- |
| **LWW (Last Write Wins)** | Yang bertimestamp terbaru menang; lainnya diabaikan |
| **Vector Clock** | Pengurutan memakai vector clock (materi minggu 3) |
| **CRDT** | Memakai struktur data di tiap node (bukan server pusat) sehingga penggabungan selalu konvergen; contoh **Yjs**, dipakai pada editor kolaboratif seperti Google Docs |
| **OT (Operational Transformation)** | Transformasi operasi berdasarkan informasi lokal |

## 9. Contoh CRDT: Penghitung Pengunjung

Sinta dan Budi sama-sama menghitung kunjungan website dengan *local map*.

1. Kondisi awal: `{"Sinta": 0, "Budi": 0}`.
2. Sinta mencatat 5 pengunjung → `{"Sinta": 5, "Budi": 0}`.
3. Budi mencatat 3 pengunjung → `{"Sinta": 0, "Budi": 3}`.
4. Saat perangkat keduanya sinkron, CRDT memakai aturan **max per kunci**:
   - Sinta = max(5, 0) = **5**
   - Budi = max(0, 3) = **3**
5. Hasil akhir: `{"Sinta": 5, "Budi": 3}` → total **8**.

Kunci sifat CRDT: urutan pesan tidak penting, hasil akhirnya tetap sama (*commutative* dan *idempotent*).

## 10. Contoh OT: Dua Orang Mengedit Dokumen

Dokumen awal: `abc`. Sinta dan Budi mengedit secara konkuren.

| Langkah | Sinta | Budi |
| --- | --- | --- |
| Aksi | Sisipkan `x` di indeks 0 → `xabc` | Hapus karakter indeks 2 (`c`) → `ab` |
| Jika operasi diterapkan mentah | `xabc` + hapus indeks 2 → `xac` | `ab` + sisip `x` di 0 → `xab` |
| Hasil | **`xac`** | **`xab`** → tidak sama! |

**Penyelesaian OT:**

- Dari sisi **Sinta**: operasi "hapus indeks 2" milik Budi ditransformasi menjadi "hapus indeks 3" karena ada penyisipan `x` di depannya → hasil `xab`.
- Dari sisi **Budi**: operasi "sisip `x` di indeks 0" diterapkan lebih dulu, lalu indeks penghapusan `c` disesuaikan menjadi 3 → hasil `xab`.

Keduanya bertemu di **`xab`** — dokumen konvergen tanpa server pusat yang memutuskan urutan.

## 11. Protokol Replikasi

1. **Primary-based (master–slave)** — satu node menangani write-read, sisanya read.
2. **Quorum-based** — write/read dianggap berhasil jika mendapat konfirmasi sejumlah node tertentu.
3. **State Machine Replication** — semua replika mengeksekusi perintah yang sama dalam urutan yang sama.
4. **Gossip Protocol** — node saling menyebarkan status secara acak dan berulang.
5. **Chain Replication** — replika tersusun berantai: write masuk dari kepala, read dilayani ekor.

### 11.1 Quorum-Based

Syarat: **W + R > N**, dengan:

- **N** = jumlah total node,
- **W** = jumlah node minimal yang harus mengonfirmasi **write**,
- **R** = jumlah node minimal yang mengonfirmasi **read**.

**Contoh:** N = 3 (Node A, B, C), W = 2, R = 2 → `2 + 2 > 3` terpenuhi.

**Skenario write (x = 100):**

1. Client mengirim perintah tulis ke klaster; request dikirim ke A, B, dan C paralel.
2. A sukses menyimpan → ACK.
3. B sukses menyimpan → ACK.
4. C lambat/timeout.
5. Karena sudah 2 ACK (memenuhi W = 2), write dinyatakan **berhasil** meskipun C belum selesai.

**Skenario read:**

1. Client membaca x; sistem meminta data dari minimal 2 node (R = 2).
2. Misal membaca dari A dan C: A memberi versi terbaru (x = 100), C mungkin masih versi lama.
3. Karena irisan node read dan write minimal satu node (A), data terbaru **pasti terbaca**.

> **Analogi:** Rapat keputusan dihitung sah bila dihadiri mayoritas. Berapa pun yang terlambat, selama jumlah hadir memenuhi ambang, keputusan tetap berlaku.

### 11.2 State Machine Replication

- Tujuan: high availability dengan beberapa replika yang mengeksekusi perintah **sama dalam urutan sama**.
- Server utama menerima permintaan client, menambahkannya ke **log**, dan mengurutkannya; replika menerapkan input yang sudah terurut.

**Contoh (x = 10 di A, B, C):**

1. Client mengirim `SET x = 20` ke leader (A).
2. A memberi nomor urut, menambahkan ke log, lalu mengirim perintah ke B dan C.
3. A menerima konfirmasi bahwa perintah ada di log B dan C → perintah dianggap **committed**.
4. Semua replika mengeksekusi `SET x = 20` → state lokal berubah dari 10 menjadi 20.
5. Leader mengirim hasil akhir ke client.

Inilah dasar **Raft** dan **Paxos**: kesepakatan urutan log membuat semua replika konvergen.

### 11.3 Gossip Protocol

- Dipakai antara lain oleh **Apache Cassandra** untuk memeriksa keberadaan node dan menyebarkan informasi replikasi.
- Node A mendeteksi perubahan (atau tetangganya down).
- Setiap detik, A memilih **1–3 peer secara acak** dan membagikan status terbarunya.
- Peer yang menerima (B) memperbarui statusnya lalu memilih node lain (C) untuk meneruskan.
- Dalam beberapa putaran, seluruh klaster mengetahui status baru.

> **Analogi:** Kabar di lingkungan kantor: satu orang membisikkan ke dua orang, masing-masing meneruskan ke dua orang lain, dan sebentar kemudian semua tahu — tanpa perlu rapat umum.

### 11.4 Chain Replication

Replika disusun seperti rantai. Penulisan masuk ke node **kepala (head)**, diteruskan ke node berikutnya sampai **ekor (tail)**, dan pembacaan dilayani oleh ekor. Model ini dipakai dalam penanganan replikasi penyimpanan Azure.

## 12. Studi Kasus 1: PostgreSQL 18 Streaming Replication

**Berkas (lihat [`kode/postgresql`](kode/postgresql)):**

| Berkas | Fungsi |
| --- | --- |
| `00_init.sql` | Membuat user replikasi dan **physical replication slot** |
| `docker-compose.yaml` | Mendefinisikan container primary dan replica |
| `env.sh` | Alias perintah Docker (opsional, memudahkan) |

**`00_init.sql`:**

```sql
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator_password';
SELECT pg_create_physical_replication_slot('replication_slot');
```

**Poin penting `docker-compose.yaml`:**

- Image `postgres:18.3-alpine3.23`, dijalankan sebagai user `postgres`, dengan `healthcheck` `pg_isready`.
- **Primary** membuka port `5432`, database `zdb`, user `zuser`.
- Parameter WAL yang diaktifkan: `wal_level=replica`, `hot_standby=on`, `max_wal_senders=10`, `max_replication_slots=10`, `hot_standby_feedback=on`.
- **Replica** membuka port `5433` (dipetakan ke 5432), dengan `PGDATA=/var/lib/postgresql/18/docker` — **berbeda** dari versi PostgreSQL sebelumnya yang memakai `/var/lib/postgresql/data`.
- Replica menjalankan `pg_basebackup` berulang (`until ... do sleep 5`) sampai berhasil, memakai `-R` (menulis konfigurasi standby) dan `--slot=replication_slot`.
- `chmod 0700` pada direktori data sebelum `postgres` dijalankan (syarat permission PostgreSQL).

**Langkah menjalankan:**

1. `docker-compose up -d` (alias `dcu`).
2. Cek status container; keduanya harus `healthy`.
3. Pada replica, cek status standby — hasil `true` (`t`) berarti node berperan sebagai replica yang hanya menerima operasi baca.
4. Buat tabel dan isi data di primary, lalu buka replica untuk melihat datanya sudah ikut (replikasi berjalan).

**High Availability:**

- Jika primary mati, promosikan replica menjadi primary dengan `pg_promote()`.
- Setelah promosi, node tersebut bisa melayani `read-write`.
- Untuk menghentikan semuanya: `docker-compose down`.

**Catatan:** replikasi fisik ini **asinkron** secara default. Replica bisa tertinggal (*replication lag*) dan hanya bisa dibaca; operasi tulis tetap harus ke primary.

## 13. Studi Kasus 2: Apache Ignite 3 Cluster (Master–Master)

**Berkas (lihat [`kode/ignite`](kode/ignite)):**

- `docker-compose.yaml` — tiga node (`node1`, `node2`, `node3`) dengan image `apacheignite/ignite:3.1.0`.
- `env.sh` — alias `dcu`, `dcd`, `dps`, `dclm` (cli dengan mount direktori `sql`), `dcli`.
- `sql/` — `schema.sql`, `media_and_genre.sql`, `ee_and_cust.sql`, `tracks.sql`, `invoices.sql`, `current_catalog.sql` (dataset contoh Chinook).

### 13.1 Konfigurasi Klaster

- Setiap node memakai port internal **3344** untuk komunikasi klaster dengan `nodeFinder.netClusterNodes = ["node1:3344", "node2:3344", "node3:3344"]`.
- Port yang dipublikasikan:
  - **10300–10302** → REST API administratif (satu per node).
  - **10800–10802** → port koneksi aplikasi.
- Alamat IP container dapat dilihat dengan `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <CONTAINER ID>`.

### 13.2 Inisialisasi

```text
cluster init --name=ignite3 --metastorage-group=node1,node2,node3
```

Setelah inisialisasi, koneksi ke `http://localhost:10300` akan mereplikasi semua perubahan ke node lain dalam klaster. Tidak perlu inisialisasi ulang saat masuk kembali ke CLI.

### 13.3 Skema dan Zona Distribusi

`schema.sql` mendefinisikan **distribution zone**:

```sql
CREATE ZONE IF NOT EXISTS Chinook WITH replicas=2, storage_profiles='default';
CREATE ZONE IF NOT EXISTS ChinookReplicated WITH replicas=3, partitions=25, storage_profiles='default';
```

- Zona `Chinook` memakai **2 replika**; zona `ChinookReplicated` memakai **3 replika** dengan **25 partisi**.
- Tabel besar seperti `Album`, `Invoice`, `Track` memakai `COLOCATE BY` agar data yang sering diakses bersama tersimpan pada node yang sama (mengurangi biaya jaringan).

### 13.4 Eksekusi dan Verifikasi

1. Jalankan `docker-compose up -d`, lalu masuk CLI dengan mount direktori SQL.
2. Eksekusi `schema.sql` dan file data (`media_and_genre.sql`, `ee_and_cust.sql`, dst.).
3. Verifikasi di node lain, misalnya `SELECT * FROM system.tables WHERE schema = 'PUBLIC';` pada node `10301` dan `10302`.
4. Karena ketiga node berisi data yang sama, terbukti replikasi **master–master** berjalan: setiap node dapat melayani baca dan tulis.

**Contoh query analitik (ringkasan penjualan bulanan):**

```sql
SELECT
  CAST(EXTRACT(YEAR FROM i.InvoiceDate) AS VARCHAR) || '-' ||
  CASE WHEN EXTRACT(MONTH FROM i.InvoiceDate) < 10
       THEN '0' || CAST(EXTRACT(MONTH FROM i.InvoiceDate) AS VARCHAR)
       ELSE CAST(EXTRACT(MONTH FROM i.InvoiceDate) AS VARCHAR) END AS YearMonth,
  COUNT(DISTINCT i.InvoiceId) AS InvoiceCount,
  COUNT(DISTINCT i.CustomerId) AS CustomerCount,
  SUM(i.Total) AS MonthlyRevenue,
  AVG(i.Total) AS AverageOrderValue
FROM Invoice i
GROUP BY EXTRACT(YEAR FROM i.InvoiceDate), EXTRACT(MONTH FROM i.InvoiceDate)
ORDER BY YearMonth DESC;
```

## 14. Pembahasan Pertanyaan Diskusi

### 14.1 Kelebihan dan Kekurangan Strong vs Eventual Consistency

| Aspek | Strong Consistency | Eventual Consistency |
| --- | --- | --- |
| **Kelebihan** | Data selalu benar dan mutakhir; logika aplikasi sederhana; cocok untuk uang, stok, identitas unik | Latensi rendah, ketersediaan tinggi, tahan partisi dan lonjakan beban, mudah diskalakan lintas wilayah |
| **Kekurangan** | Latensi tinggi, ketersediaan menurun saat partisi, koordinasi antar node mahal | Aplikasi harus siap menghadapi data basi (konflik, duplikasi, urutan tak terduga); lebih sulit diuji dan di-debug |
| **Cocok untuk** | Perbankan, pembayaran, reservasi kursi, penomoran unik | Feed media sosial, penghitung like/view, rekomendasi, cache, katalog produk |

**Kesimpulan:** pilih berdasarkan **kebutuhan bisnis**. Jika kesalahan data berakibat fatal (uang, stok), gunakan strong consistency. Jika kecepatan dan ketersediaan lebih penting dan data bisa "menyusul", gunakan eventual consistency — dengan desain aplikasi yang toleran (idempoten, konflik diselesaikan CRDT/LWW).

### 14.2 Bagaimana Jika Replikasi Gagal di Satu Node?

Penanganannya bergantung pada mode replikasi:

| Kondisi | Dampak | Penanganan |
| --- | --- | --- |
| **Async** | Master tetap melayani; replika tertinggal; data terbaru di node gagal bisa **hilang** saat node mati sebelum sinkron | Deteksi via heartbeat, pulihkan node dari backup + replay WAL/log, pantau *replication lag* |
| **Semi-sync** | Penulisan menunggu minimal satu replika; bila semua replika sync gagal, penulisan bisa tertahan | Turunkan sementara ke async atau keluarkan node bermasalah dari daftar sync |
| **Sync** | Penulisan **gagal/tertahan** sampai replika kembali atau dikonfigurasi ulang | Konfigurasi ulang quorum, promosikan replika lain, perbaiki node |
| **Multi-master** | Node lain tetap melayani baca-tulis; node yang pulih bisa membawa data konflik | Sinkronisasi ulang, penyelesaian konflik (LWW/CRDT/vektor jam), anti-entropy |

Langkah umum yang harus tersedia:

1. **Deteksi** — heartbeat, health check, timeout.
2. **Isolasi** — keluarkan node gagal dari rotasi (jangan kirim trafik).
3. **Failover** — promosikan replika (mis. `pg_promote()`), pilih leader baru via Raft/Paxos.
4. **Pemulihan** — bangun ulang node dari *base backup* lalu lanjutkan replikasi.
5. **Verifikasi** — cek konsistensi data dan *replication lag* sebelum node dimasukkan kembali.

## 15. Ringkasan Cepat

- Konsistensi = semua node punya data sama/tampak sama; tanpa itu muncul data basi dan saldo tidak sinkron.
- CAP: partisi selalu mungkin, sehingga sistem memilih **AP** atau **CP**.
- Model konsistensi berjenjang: eventual → monotonic read → read-your-writes → causal → strong → sequential → linearizability.
- Konsistensi tinggi berbanding lurus dengan latensi.
- Replikasi meningkatkan availability, performance, reliability, dan scalability.
- Jenis: master–slave, multi-master, sync, async; sinkronisasi bisa pull, push (CDC), atau hybrid.
- Konflik diselesaikan dengan LWW, vector clock, CRDT, atau OT.
- Protokol: primary-based, quorum (W + R > N), state machine replication, gossip, chain replication.
- Studi kasus: **PostgreSQL 18** (streaming replication, master–slave, `pg_basebackup` + slot) dan **Apache Ignite 3** (cluster 3 node, master–master, zona replika 2/3).

## Daftar Istilah

| Istilah | Arti singkat |
| --- | --- |
| Konsistensi | Jaminan data sama/tampak sama di semua node |
| CAP theorem | Trade-off Consistency, Availability, Partition Tolerance |
| AP / CP | Pilihan saat partisi: utamakan availability atau konsistensi |
| BASE | Basically Available, Soft state, Eventual consistency |
| Strong consistency | Semua node langsung melihat update terbaru |
| Eventual consistency | Node konvergen setelah beberapa waktu |
| Causal consistency | Urutan sebab-akibat dijaga |
| Read-your-writes | Penulis selalu melihat hasil tulisannya sendiri |
| Monotonic read | Tidak pernah mundur ke versi lama |
| Sequential consistency | Urutan operasi sama bagi semua node |
| Linearizability | Konsistensi terkuat; tampak seperti satu node atomik |
| Replikasi | Menjaga salinan data di banyak node |
| Replication lag | Keterlambatan replika dibanding sumber |
| Quorum | Ambang konfirmasi node; syarat W + R > N |
| State machine replication | Semua replika mengeksekusi log perintah yang sama |
| Gossip protocol | Penyebaran status secara acak dan berulang |
| Chain replication | Replika berantai: write di head, read di tail |
| CRDT | Struktur data yang selalu konvergen saat digabung |
| OT | Transformasi operasi untuk editing kolaboratif |
| LWW | Konflik diselesaikan dengan timestamp terbaru |
| CDC | Change Data Capture, menangkap perubahan untuk dikirim ke replika |
| WAL | Write-Ahead Log, log perubahan PostgreSQL |
| Physical replication slot | Slot yang menjamin WAL tetap tersedia untuk replika |
| pg_basebackup | Utilitas untuk membuat salinan dasar cluster PostgreSQL |
| pg_promote() | Fungsi untuk mempromosikan standby menjadi primary |

---

[← Minggu 3](../03/README.md) · [Daftar materi](../README.md) · [Minggu berikutnya →](../05/README.md)
