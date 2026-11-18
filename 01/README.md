# Materi Minggu 1: Pengenalan Sistem Terdistribusi dan Terdesentralisasi

```text
Materi Minggu 1: Pengenalan Sistem Terdistribusi dan Terdesentralisasi
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: Rangkum materi 01--pengenalan.pdf (25 slide) menjadi catatan Markdown berbahasa Indonesia yang mencakup tujuan pembelajaran, arti penting, definisi sistem terdistribusi, arsitektur dasar, karakteristik, definisi sistem terdesentralisasi, perbandingan keduanya, studi kasus, CAP theorem, konsistensi data, tantangan, tren, serta pembahasan pertanyaan diskusi.
Bagian yang disesuaikan dari keluaran prompt ada pada: struktur heading, analogi dan contoh tambahan (ATM, warung makan, jaringan gotong royong, dua kantor cabang), tabel perbandingan dan tabel karakteristik, pembahasan pertanyaan diskusi, serta daftar istilah.
```

> **Mata kuliah:** Sistem Terdistribusi dan Terdesentralisasi (FIF25002T, 3 SKS)
> **Program studi:** Informatika — Fakultas Teknologi Informasi, UTDI
> **Dosen:** Dr. Bambang Purnomosidi D. P.
> **Sumber:** materi kuliah pertemuan 1 (`01--pengenalan.pdf`)
> **Status:** lengkap

## Tujuan Pembelajaran

Setelah materi ini, mahasiswa mampu:

- menjelaskan konsep sistem terdistribusi;
- menjelaskan konsep sistem terdesentralisasi;
- membedakan sistem terdistribusi dengan sistem terdesentralisasi;
- menyebutkan contoh penerapan nyata dari keduanya;
- menyebutkan tantangan dan tren terbaru di bidang ini.

## 1. Arti Penting Sistem Terdistribusi dan Terdesentralisasi

Empat tekanan yang mendorong lahirnya sistem terdistribusi dan terdesentralisasi:

| Tekanan | Penjelasan |
| --- | --- |
| **Pertumbuhan data dan pengguna** | Jumlah pengguna dan volume data tumbuh jauh lebih cepat daripada kemampuan satu mesin |
| **Kebutuhan skalabilitas** | Layanan harus bisa menambah kapasitas saat beban naik, tanpa menulis ulang sistem |
| **Fault tolerance** | Layanan harus tetap hidup meskipun sebagian komponen gagal |
| **Performa dan ketersediaan 24/7** | Pengguna menuntut respons cepat kapan pun, tanpa jam operasional |

Tanpa konsep ini, layanan seperti **Google, Netflix, dan Blockchain** tidak mungkin ada.

**Skalabilitas** — kemampuan sistem, jaringan, proses, atau organisasi untuk tumbuh dan menangani peningkatan beban kerja, pengguna, atau permintaan **tanpa mengorbankan kinerja atau kualitas**.

**Sistem fault-tolerant** — sistem yang tetap beroperasi normal meskipun terjadi kegagalan atau malfungsi pada sebagian komponennya, baik *hardware* maupun *software*.

> **Contoh konkret (ilustrasi):** satu server mampu melayani 1.000 permintaan per detik. Jika trafik naik menjadi 8.000 permintaan per detik, menambah satu server berkapasitas 10.000 justru berlebihan dan mahal. Dengan delapan server yang berbagi beban, kapasitas tercapai dan kegagalan satu server hanya mengurangi kapasitas, tidak mematikan layanan.

> **Analogi:** satu warung makan yang ramai akan kewalahan jika hanya punya satu juru masak. Menambah juru masak dan membagi pesanan adalah **skalabilitas**; tetap bisa melayani meskipun satu juru masak sakit adalah **fault tolerance**.

## 2. Pengertian Sistem Terdistribusi

Definisi yang dipakai pada materi:

> "A collection of independent computers that appears to its users as a single coherent system."
> — Andrew S. Tanenbaum dan Maarten van Steen (2007)

Tiga ciri yang menempel pada definisi tersebut:

1. **Komponen independen** — setiap komputer berjalan sendiri, punya CPU dan memori sendiri, tidak berbagi *clock*.
2. **Berkomunikasi melalui jaringan** — koordinasi terjadi lewat pertukaran pesan, bukan lewat memori bersama.
3. **Transparansi** — kepada pengguna, kumpulan komputer itu tampak sebagai satu sistem yang utuh.

### 2.1 Empat Bentuk Transparansi

| Jenis transparansi | Arti | Contoh |
| --- | --- | --- |
| **Lokasi** | Pengguna tidak tahu data berada di mesin mana | Menarik uang di ATM mana pun terasa sama |
| **Akses** | Cara mengakses data seragam, apa pun sistem operasi dan perangkatnya | Satu aplikasi bisa membaca berkas di server Linux maupun Windows |
| **Replikasi** | Jumlah salinan data tidak terlihat | Dokumen tetap terbuka walau ada tiga salinan di tiga server |
| **Kegagalan** | Kegagalan komponen tidak terlihat sebagai gangguan layanan | Satu node mati, permintaan dialihkan tanpa pengguna sadar |

> **Analogi:** jaringan ATM. Nasabah tidak perlu tahu di gedung mana rekeningnya dicatat, apakah ada salinan di kota lain, atau apakah satu server sedang diperbaiki. Yang terlihat hanya satu layanan: tarik tunai, transfer, cek saldo, dan semuanya berjalan sama di mana pun.

## 3. Arsitektur Sistem Dasar

| Arsitektur | Cara kerja | Kelebihan | Keterbatasan | Contoh |
| --- | --- | --- | --- | --- |
| **Client–Server** | Client mengirim permintaan, server menyediakan layanan; kontrol terpusat | Sederhana, mudah dikelola, mudah diamankan | Server pusat menjadi titik gagal dan batas kapasitas | Web server, basis data, layanan email |
| **Peer-to-Peer (P2P)** | Setiap node dapat menjadi client sekaligus server | Tidak ada titik pusat, tahan terhadap node yang keluar | Koordinasi dan keamanan lebih sulit | BitTorrent, jaringan blockchain |
| **Hybrid** | Ada server pusat untuk koordinasi/indeks, data tersebar di peer | Menggabungkan kemudahan koordinasi dan skalabilitas data | Desain lebih rumit; server indeks tetap harus dijaga | Aplikasi pesan dengan server direktori, tetapi berkas dikirim antar-pengguna |

> **Analogi client–server:** warung makan. Pelanggan (client) memesan ke kasir (server), kasir meneruskan ke dapur, lalu pesanan disajikan. Semua pesanan lewat satu pintu, sehingga mudah diatur — tetapi kalau kasir tutup, warung berhenti melayani.

> **Analogi hybrid:** marketplace. Server pusat menyimpan katalog dan mengatur transaksi, tetapi barang dikirim langsung dari gudang masing-masing penjual.

## 4. Karakteristik Sistem Terdistribusi

| Karakteristik | Arti | Yang terjadi jika tidak dipenuhi |
| --- | --- | --- |
| **Transparansi lokasi** | Pengguna tidak perlu tahu letak fisik sumber daya | Aplikasi harus diubah setiap kali server dipindah |
| **Skalabilitas** | Kapasitas bisa ditambah seiring pertumbuhan beban | Sistem macet saat pengguna bertambah |
| **Fault tolerance** | Layanan tetap berjalan saat komponen gagal | Satu disk rusak menghentikan seluruh layanan |
| **Kinerja tinggi** | Pekerjaan dibagi sehingga selesai lebih cepat | Manfaat distribusi tidak terasa, biaya justru naik |
| **Heterogenitas** | Perangkat keras, sistem operasi, dan bahasa pemrograman boleh berbeda | Sistem hanya bisa memakai satu jenis perangkat dan vendor |

Kelima karakteristik ini saling berkaitan. Skalabilitas tanpa transparansi membuat pengelolaan rumit; fault tolerance tanpa heterogenitas membuat biaya pengadaan mahal.

## 5. Pengertian Sistem Terdesentralisasi

- **Sentralisasi:** ada **satu titik kontrol**; keputusan dan data mengalir dari pusat.
- **Desentralisasi:** kontrol **terdistribusi**; tidak ada *single point of failure*.
- Keputusan diambil secara kolektif melalui **konsensus**.
- Contoh: **Blockchain, DNS, BitTorrent**.

Gagasan desentralisasi bukan hal baru. Pada 1964, Paul Baran menulis *On Distributed Communications* yang menggambarkan jaringan tanpa pusat: setiap node terhubung ke beberapa node lain, sehingga tidak ada satu sasaran yang kegagalannya melumpuhkan seluruh jaringan.

> **Analogi:** pos ronda lingkungan. Tidak ada satu komandan yang harus selalu hidup; setiap pos saling memberi kabar, dan keputusan diambil setelah beberapa pos sepakat. Jika satu pos tutup, pos lain tetap berjaga.

**Catatan penting:** desentralisasi **bukan** berarti semua node setara dalam segala hal. DNS, misalnya, tetap memiliki hierarki zona dan *root server*; yang terdesentralisasi adalah kepemilikan dan pengelolaan zona, bukan strukturnya yang rata.

## 6. Sistem Terdistribusi vs Sistem Terdesentralisasi

Perbedaan paling ringkas:

- **Distribusi** berfokus pada **pembagian beban kerja**.
- **Desentralisasi** berfokus pada **pembagian kontrol**.

| Aspek | Terdistribusi | Terdesentralisasi |
| --- | --- | --- |
| Fokus utama | Beban kerja dan kapasitas | Kontrol dan pengambilan keputusan |
| Titik kontrol | Bisa tetap terpusat secara logis | Tidak ada otoritas tunggal |
| Cara memutuskan | Ditentukan koordinator atau server | Konsensus antar node |
| Tujuan khas | Throughput, latensi, ketersediaan | Ketahanan terhadap sensor, pemilik tunggal, dan titik gagal |
| Contoh | Google File System, HDFS, Apache Kafka | Blockchain, DNS, BitTorrent |

> **Analogi:** perusahaan dengan banyak cabang (**terdistribusi**) — pekerjaan dibagi ke cabang, tetapi kantor pusat tetap menetapkan kebijakan. Koperasi tempat setiap anggota punya suara (**terdesentralisasi**) — tidak ada pusat yang bisa memutuskan sendiri.

Keduanya saling terkait: sistem terdesentralisasi hampir selalu terdistribusi secara fisik, tetapi sistem terdistribusi belum tentu terdesentralisasi secara kontrol. Sebuah cluster HDFS dengan satu NameNode adalah contoh sistem terdistribusi yang **terpusat secara logis**.

## 7. Studi Kasus

### 7.1 Sistem Terdistribusi

| Sistem | Peran distribusi |
| --- | --- |
| **Google File System / HDFS** | Menyimpan data besar dalam blok yang tersebar di banyak mesin |
| **Apache Kafka, Apache Pulsar** | Messaging dan streaming dengan banyak broker |
| **Netflix, Twitch, YouTube** | Streaming media ke jutaan penonton sekaligus |
| **Instagram, Threads, Facebook, TikTok** | Media sosial dengan beban baca dan tulis yang sangat besar |

### 7.2 Sistem Terdesentralisasi

| Sistem | Bentuk desentralisasi |
| --- | --- |
| **Blockchain** (Bitcoin, Ethereum, Algorand, Sui, Near, Aptos) | Tidak ada bank atau server pusat; validasi transaksi dilakukan banyak node |
| **DNS** | Zona dikelola pihak berbeda; tidak ada satu basis data pusat untuk seluruh nama domain |
| **BitTorrent** | Berkas diambil dari banyak peer; tidak ada server penyimpan tunggal |

## 8. CAP Theorem (Brewer's Theorem, 2000)

**CAP** menyatakan bahwa pada *distributed data store* kita tidak dapat memperoleh tiga jaminan berikut sekaligus:

| Huruf | Jaminan | Arti |
| --- | --- | --- |
| **C** — Consistency | Konsistensi | Setiap operasi baca mengembalikan penulisan terbaru atau error |
| **A** — Availability | Ketersediaan | Setiap permintaan ke node yang tidak gagal menerima respons non-error, meskipun datanya belum terbaru |
| **P** — Partition Tolerance | Toleransi partisi | Sistem tetap beroperasi meskipun komunikasi antar-node terputus atau terfragmentasi |

Karena **partisi jaringan selalu mungkin terjadi**, P dianggap wajib. Saat partisi berlangsung, perancang harus memilih salah satu:

| Pilihan | Perilaku saat partisi | Konsekuensi | Contoh pada materi |
| --- | --- | --- | --- |
| **AP** | Permintaan data selalu dilayani | Data bisa tidak sinkron (konsistensi dikorbankan) | MongoDB |
| **CP** | Permintaan baca dan tulis ditolak | Layanan tidak tersedia (availability dikorbankan) | Apache Cassandra |

Setelah partisi selesai, sistem dapat melakukan **auto-healing** dan menyamakan data kembali. Jadi pilihan AP/CP adalah keputusan **selama** partisi, bukan sifat permanen.

> **Analogi:** dua kantor cabang toko memiliki catatan stok masing-masing, dan saluran telepon antar-cabang putus. Cabang A bisa tetap melayani penjualan dengan catatan lama (**AP**, berisiko stok dianggap ada padahal sudah habis), atau menolak semua penjualan sampai telepon pulih (**CP**, pelanggan kecewa tetapi data pasti benar).

**Catatan kritis:** klasifikasi AP/CP pada tabel di atas mengikuti slide. Dalam praktik, banyak basis data modern dapat dikonfigurasi ke salah satu sisi (misalnya MongoDB dengan *write concern* dan *read concern* tertentu), sehingga label AP/CP lebih tepat dipahami sebagai **perilaku default**, bukan identitas mutlak.

## 9. Konsistensi Data

| Model | Jaminan | Cocok untuk | Contoh |
| --- | --- | --- | --- |
| **Strong consistency** | Hasil baca selalu sama dengan penulisan terbaru | Data yang kesalahannya mahal | Saldo bank, stok tiket pesawat |
| **Eventual consistency** | Pada akhirnya semua replika akan sama | Data yang boleh terlambat sesaat | Jumlah *like*, daftar komentar, *feed* media sosial |

> **Contoh konkret:** transfer Rp100.000 dari rekening A ke B. Jika saldo A masih menampilkan nilai lama sesaat setelah transfer, nasabah bisa menarik uang dua kali. Karena itu perbankan memilih **strong consistency**. Sebaliknya, jumlah *like* yang terlambat satu detik tidak merugikan siapa pun, sehingga media sosial cukup memakai **eventual consistency**.

## 10. Tantangan

| Tantangan | Penjelasan |
| --- | --- |
| **Latency** | Berapa lama satu permintaan diproses |
| **Throughput** | Berapa banyak permintaan yang dapat diproses per satuan waktu |
| **Keamanan** | Serangan **DDoS** (membanjiri layanan) dan **Sybil attack** (identitas palsu) |
| **Kompleksitas manajemen node** | Konfigurasi, pemantauan, pembaruan, dan pemulihan banyak mesin sekaligus |
| **Governance** | Tata kelola pada sistem terdesentralisasi: siapa yang berhak mengubah aturan? |

> **Analogi latency vs throughput:** perjalanan tol. **Latency** adalah lama perjalanan dari rumah ke kantor; **throughput** adalah jumlah mobil yang bisa lewat per jam. Jalan bisa menampung banyak mobil (throughput tinggi) tetapi tetap lambat bagi satu mobil yang terjebak macet (latency tinggi).

**Sybil attack** — serangan siber dengan membuat banyak identitas palsu (akun, node, atau pseudonim, bahkan sampai ribuan) sekaligus untuk mendominasi pengaruh, suara, atau reputasi jaringan. Umum pada sistem *peer-to-peer* dan blockchain. Dengan menyamar sebagai banyak pengguna sah, penyerang dapat memanipulasi sistem, merusak integritas, melakukan tindakan tidak sah, dan mengakses informasi sensitif. Istilah "Sybil" berasal dari buku tahun 1973 tentang seorang perempuan dengan *multiple identity disorder*.

## 11. Tren Masa Depan

| Tren | Inti |
| --- | --- |
| **Cloud-native** | Aplikasi dirancang untuk berjalan di container dan orkestrator (Kubernetes, Docker) |
| **Edge & Fog Computing** | Sebagian pemrosesan didekatkan ke pengguna untuk menekan latensi |
| **Web3 & DeFi** | Layanan keuangan dan aplikasi web yang mengandalkan konsensus, bukan perantara |
| **Federated Data & Learning** | Model dilatih di banyak perangkat tanpa memusatkan data mentah |

## 12. Pembahasan Pertanyaan Diskusi

### 12.1 Mengapa dunia semakin bergerak menuju distribusi dan desentralisasi?

Karena tiga batas sistem terpusat semakin sering tercapai:

1. **Batas fisik** — satu mesin tidak bisa menampung data dan trafik yang tumbuh tanpa henti.
2. **Batas keandalan** — semakin besar satu titik pusat, semakin mahal dan lama dampak kegagalannya. Distribusi memecah risiko menjadi bagian yang lebih kecil.
3. **Batas kepercayaan** — pengguna dan organisasi tidak selalu ingin satu pihak memegang seluruh data dan keputusan. Desentralisasi menawarkan kepemilikan bersama dan aturan yang disepakati.

Distribusi menjawab masalah **kapasitas**; desentralisasi menjawab masalah **kontrol**. Keduanya dipakai bersamaan ketika aplikasi harus besar sekaligus tidak bergantung pada satu pihak.

### 12.2 Contoh sehari-hari apa yang paling terasa?

Beberapa contoh yang paling dekat:

- **Dompet digital dan ATM** — saldo terlihat sama di aplikasi, ATM, dan mesin EDC; pengguna tidak tahu data disimpan di server mana (transparansi).
- **Aplikasi pesan** — pesan tetap terkirim meskipun satu server gangguan, meski kadang muncul jeda.
- **Media sosial** — jumlah *like* dan komentar bisa terlambat muncul beberapa detik, contoh **eventual consistency** yang dapat diterima.
- **Transaksi perbankan** — saldo harus langsung benar, contoh **strong consistency** yang tidak bisa ditawar.
- **Torrent dan blockchain** — berkas dan transaksi tetap tersedia karena banyak pihak menyimpan salinannya, contoh desentralisasi.

## 13. Ringkasan Cepat

- Sistem terdistribusi = kumpulan komputer independen yang tampak sebagai **satu sistem utuh**.
- Sistem terdesentralisasi = kontrol tersebar, **tanpa single point of failure**, keputusan lewat konsensus.
- Distribusi menjawab **kapasitas**; desentralisasi menjawab **kontrol**.
- Arsitektur dasar: client–server, peer-to-peer, dan hybrid.
- Karakteristik: transparansi lokasi, skalabilitas, fault tolerance, kinerja tinggi, heterogenitas.
- CAP: C, A, dan P tidak bisa dipenuhi sekaligus; saat partisi, pilih **AP** atau **CP**.
- Strong consistency untuk data kritis (bank); eventual consistency untuk data yang boleh terlambat (media sosial).
- Tantangan utama: latency/throughput, keamanan (DDoS, Sybil), manajemen node, dan governance.
- Tren: cloud-native, edge/fog computing, Web3/DeFi, dan federated learning.

## Daftar Istilah

| Istilah | Arti singkat |
| --- | --- |
| **Sistem terdistribusi** | Kumpulan komputer independen yang tampak sebagai satu sistem bagi pengguna |
| **Sistem terdesentralisasi** | Sistem dengan kontrol tersebar dan tanpa otoritas tunggal |
| **Skalabilitas** | Kemampuan menangani beban yang meningkat tanpa penurunan kinerja |
| **Fault tolerance** | Kemampuan tetap beroperasi meski sebagian komponen gagal |
| **Transparansi** | Penyembunyian detail lokasi, akses, replikasi, dan kegagalan dari pengguna |
| **Heterogenitas** | Keberagaman perangkat keras, sistem operasi, dan bahasa dalam satu sistem |
| **Single point of failure** | Satu komponen yang kegagalannya menjatuhkan seluruh sistem |
| **Konsensus** | Mekanisme kesepakatan kolektif antar node tanpa otoritas pusat |
| **CAP theorem** | Trade-off antara Consistency, Availability, dan Partition Tolerance |
| **Strong consistency** | Setiap baca mengembalikan penulisan terbaru |
| **Eventual consistency** | Replika akan konsisten pada akhirnya, tidak serta-merta |
| **Latency** | Lama waktu satu permintaan diproses |
| **Throughput** | Jumlah permintaan yang diproses per satuan waktu |
| **DDoS** | Serangan yang membanjiri layanan dengan trafik palsu |
| **Sybil attack** | Serangan dengan banyak identitas palsu untuk mendominasi jaringan |
| **Governance** | Tata kelola: aturan dan kewenangan dalam mengelola sistem |

---

[Daftar materi](../README.md) · [Minggu berikutnya →](../02/README.md)
