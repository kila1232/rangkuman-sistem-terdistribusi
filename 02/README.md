# Materi Minggu 2: Proses dan Komunikasi Antar Proses

```text
Materi Minggu 2: Proses dan Komunikasi Antar Proses
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: Rangkum materi 02--proses-dan-komunikasi-antar-proses.pdf (36 slide) menjadi catatan Markdown berbahasa Indonesia yang detail: konsep proses, manajemen proses, model komunikasi pesan, IPC, message passing, RPC, MOM, microservices, komunikasi sinkron/asinkron, masalah komunikasi, protokol, sinkronisasi clock, logical clock, koordinasi proses, tantangan, isu terkini. Sertakan analogi dan contoh agar mudah dipahami, serta jawab pertanyaan diskusi di akhir materi.
Bagian yang disesuaikan dari keluaran prompt ada pada: struktur heading, analogi dan contoh (ditulis ulang), tabel ringkasan (jenis IPC, protokol MOM, REST vs GraphQL vs gRPC), rincian perhitungan Lamport clock, jawaban pertanyaan diskusi, dan daftar istilah.
```

> **Mata kuliah:** Sistem Terdistribusi dan Terdesentralisasi (FIF25002T, 3 SKS)
> **Program studi:** Informatika — Fakultas Teknologi Informasi, UTDI
> **Dosen:** Dr. Bambang Purnomosidi D. P.
> **Sumber:** materi kuliah pertemuan 2 (`02--proses-dan-komunikasi-antar-proses.pdf`)
> **Status:** lengkap

## Tujuan Pembelajaran

- Menjelaskan konsep proses pada sistem terdistribusi.
- Menjelaskan berbagai jenis komunikasi antar proses (IPC).
- Menganalisis isu sinkronisasi, reliabilitas, dan keamanan.
- Mengaitkan konsep dengan contoh nyata: microservices, cloud, distributed messaging.

## 1. Proses: Program yang Sedang Berjalan

**Proses** adalah **program yang sedang dieksekusi**. Program hanyalah kumpulan instruksi yang tersimpan; ketika sistem operasi menjalankannya, ia berubah menjadi proses yang memiliki memori, status, dan sumber daya sendiri (CPU, file, koneksi).

> **Analogi:** *Partitur lagu* adalah program; *musisi yang memainkannya* adalah proses. Partitur yang sama bisa dimainkan beberapa musisi sekaligus, dan tiap permainan punya tempo serta kesalahannya sendiri.

> **Contoh:** Satu file `chrome.exe` di disk, tetapi saat kamu membuka 5 tab, Task Manager menampilkan beberapa proses Chrome dengan pemakaian memori berbeda.

Komponen penting sebuah proses:

| Komponen | Isi |
| --- | --- |
| Kode program (*text*) | Instruksi yang dijalankan |
| Data | Variabel global dan heap |
| Stack | Pemanggilan fungsi dan variabel lokal |
| PCB (*Process Control Block*) | Identitas proses, register, status, informasi sumber daya |

Status umum proses: **new → ready → running → waiting → terminated**. Perpindahan status ini yang dipantau oleh manajemen proses.

## 2. Manajemen Proses

| Aspek | Pengertian | Contoh penerapan |
| --- | --- | --- |
| **Process creation** | Membuat proses baru | `fork()` di Linux, membuat container/pod baru, autoscaling |
| **Process migration** | Memindahkan proses antar node | Node asal kelebihan beban, node akan dimatikan untuk maintenance, live migration VM |
| **Process monitoring** | Memantau kondisi proses | Pemakaian CPU/memori, health check, restart otomatis saat crash |

> **Analogi:** Manajemen proses seperti mengatur **shift karyawan**: merekrut (creation), memindahkan ke cabang lain (migration), dan memantau kehadiran serta beban kerjanya (monitoring).

## 3. Sistem Terdistribusi dan Komunikasi

- Sistem terdistribusi = kumpulan komputer/**node** independen yang bekerja bersama dalam satu koordinasi sebagai **satu kesatuan logis**.
- Setiap node menjalankan proses.
- Agar tampak sebagai satu sistem, proses di node berbeda **wajib berkomunikasi**; tidak ada cara lain untuk berbagi keadaan:

  ```text
  Node (proses) <-> Node (proses) <-> Node (proses) ...
  ```

**Contoh nyata:**

1. **Multiplayer game** — posisi pemain dikirim ke server lalu disebarkan ke pemain lain; butuh komunikasi berlatensi rendah.
2. **Gojek/Grab** — aplikasi pengguna berbicara dengan banyak service: (1) service driver, (2) pelacakan lokasi, (3) perhitungan biaya, dan seterusnya.
3. **Chat/video call WhatsApp** — komunikasi *point-to-point* di atas infrastruktur terdistribusi.

> **Poin penting:** tanpa komunikasi antar proses, kumpulan komputer hanya menjadi banyak komputer terpisah, bukan sistem terdistribusi.

## 4. Model Komunikasi Pesan

| Model | Cara kerja | Analogi |
| --- | --- | --- |
| **Langsung** (*direct*) | Pengirim dan penerima terhubung langsung melalui **socket** | Menelepon nomor teman secara langsung |
| **Tidak langsung** (*indirect*) | Pesan dititipkan ke **mailbox/message queue**, penerima mengambil saat siap (mis. perintah `write` di Linux) | Menitipkan dokumen ke resepsionis untuk diambil penerima |
| **Pub/Sub** | *Publisher* mengirim ke sebuah **topik**; semua *subscriber* topik itu menerima salinan pesan | Langganan koran: satu edisi dicetak, semua pelanggan dapat |

Perbedaan penting:

- Model **langsung** menuntut pengirim mengetahui identitas penerima (alamat/host + port).
- Model **tidak langsung** memisahkan pengirim dan penerima secara waktu (penerima boleh belum siap).
- Model **pub/sub** memisahkan juga secara identitas: publisher tidak tahu siapa saja subscriber-nya.

## 5. Proses pada Sistem Terdistribusi

- Proses dapat berada pada **node yang berbeda**.
- **Tidak ada shared memory**, karena memori tiap node terpisah secara fisik dan tidak bisa diakses langsung dari node lain.
- Akibatnya, IPC pada sistem terdistribusi harus berbasis **pertukaran pesan** lewat jaringan, sehingga muncul persoalan baru: latensi, kehilangan pesan, urutan, dan keamanan.

## 6. IPC (Inter-Process Communication)

Empat jenis dasar IPC:

1. **Shared Memory** — tidak cocok untuk sistem terdistribusi karena tidak ada memori bersama lintas node; hanya efektif dalam satu mesin.
2. **Message Passing** — pertukaran pesan eksplisit.
3. **Remote Procedure Call (RPC)** — memanggil prosedur di node lain.
4. **Middleware** — lapisan perantara yang menyediakan layanan komunikasi.

> **Analogi shared memory:** dua orang menulis di papan tulis yang sama. Bisa dilakukan jika berada di ruangan yang sama, tetapi mustahil jika berada di kota berbeda — mereka harus saling mengirim pesan.

### 6.1 Message Passing

Proses berkomunikasi dengan operasi **send** dan **receive**.

| Aspek | Keterangan |
| --- | --- |
| Standar | **MPI** (Message Passing Interface), versi terbaru 5.0 (status implementasi per Oktober 2026) |
| Implementasi contoh | **mpi4py** (Python) |
| Sifat pengiriman | Bisa *blocking* (menunggu) atau *non-blocking* (lanjut kerja) |
| Penggunaan khas | Komputasi paralel/HPC, simulasi ilmiah, pemrosesan batch terdistribusi |

> **Contoh:** Simulasi iklim dibagi ke 100 node; masing-masing menghitung satu wilayah, lalu bertukar nilai di batas wilayah lewat MPI agar hasil konsisten.

> **Catatan:** message passing memberi kendali paling besar kepada pemrogram, tetapi pemrogram juga harus mengurus buffer, sinkronisasi, dan penanganan kegagalan sendiri.

### 6.2 RPC (Remote Procedure Call)

Memanggil fungsi yang dijalankan di komputer lain **seolah-olah fungsi lokal**. Detail jaringan (serialisasi, koneksi, timeout) disembunyikan oleh *stub* dan *library* RPC.

Alur sederhananya:

1. Program memanggil fungsi lewat *client stub*.
2. Stub men-*serialisasi* parameter (*marshalling*) dan mengirim request.
3. *Server stub* menerima, memanggil fungsi asli, lalu mengirim hasil.
4. Client menerima hasil seolah fungsi dipanggil lokal.

> **Analogi:** Memakai **interkom kantor**: kamu bicara ke mikrofon seolah rekanmu ada di seberang, padahal ia di gedung lain — kabel dan repeater-nya tidak perlu kamu urus.

> **Contoh:** Di kode cukup menulis `hitungOngkir(asal, tujuan)`, padahal perhitungan berjalan di server lain. Contoh teknologi: **gRPC**.

**Hal yang perlu diperhatikan pada RPC:**

- Panggilan jaringan bisa **gagal di tengah jalan** → tidak selalu jelas apakah operasi sudah dijalankan (masalah *idempotency*).
- Latensi RPC jauh lebih besar daripada pemanggilan fungsi lokal.
- Perlu timeout, retry yang aman, dan strategi penanganan kegagalan.

### 6.3 MOM (Message-Oriented Middleware)

- Infrastruktur perantara yang memfasilitasi komunikasi dan pertukaran data melalui **pesan** (*message*), yaitu unit informasi mandiri.
- Pesan dikirim dan diterima secara **asinkron**: pengirim tidak menunggu penerima siap.
- Umumnya menyediakan **antrean** atau **topik**, penyimpanan pesan sementara, serta jaminan pengiriman.

> **Analogi:** Seperti **layanan ekspedisi dengan gudang**: kamu menyerahkan paket lalu kembali bekerja; paket disimpan dan diantar saat penerima siap, bahkan bila penerima sedang tidak di tempat.

Standar dan protokol MOM:

| Protokol | Keterangan | Contoh pemakaian |
| --- | --- | --- |
| **XATMI** (X/Open) | Spesifikasi *Distributed Transaction Processing* | Sistem transaksi enterprise lama |
| **AMQP** | Advanced Message Queuing Protocol | Aplikasi enterprise, RabbitMQ |
| **HLA (IEEE 1516)** | High Level Architecture dari IEEE & SISO | Simulasi terdistribusi (militer, simulasi besar) |
| **MQTT** | MQ Telemetry Transport, ringan | Perangkat IoT dengan sumber daya terbatas |
| **DDS** (OMG) | Data Distribution Service | Sistem *real-time* (kendali industri, kendaraan) |
| **XMPP** | eXtensible Messaging and Presence Protocol | Chat/pesan instan dan *presence* |

> **Contoh:** Sensor suhu mengirim data tiap menit via MQTT ke *broker*; dashboard mengambil data dari broker kapan pun tanpa harus terhubung langsung ke sensor.

## 7. Studi Kasus: Microservices

**Microservices** = aplikasi dipecah menjadi service kecil yang berdiri sendiri, punya tanggung jawab spesifik, dan berkomunikasi lewat REST, gRPC, atau message broker.

> **Contoh:** Aplikasi e-commerce dipecah menjadi service *user*, *produk*, *keranjang*, *pembayaran*, dan *pengiriman*. Jika service pengiriman bermasalah, katalog produk tetap bisa dibuka.

Konsekuensi yang harus disiapkan:

- **Service discovery** — service harus bisa menemukan alamat service lain.
- **Observability** — log, metrik, dan *trace* terpusat untuk melacak request lintas service.
- **Ketahanan** — timeout, retry, circuit breaker, idempotency.
- **Konsistensi data** — tidak ada transaksi database tunggal, sehingga perlu pola seperti **saga** atau **eventual consistency**.

## 8. Komunikasi Sinkron dan Asinkron

| Aspek | Sinkron | Asinkron |
| --- | --- | --- |
| Pola | Pengirim menunggu respons | Pengirim lanjut tanpa menunggu |
| Contoh | HTTP request–response, RPC | Message queue, pub/sub, MOM |
| Kelebihan | Alur mudah dipahami, hasil langsung diketahui | Decoupling, tahan gangguan, throughput lebih baik |
| Kekurangan | Terikat latensi dan kegagalan penerima | Konsistensi dan urutan pesan lebih sulit |
| Analogi | Telepon: menunggu lawan bicara menjawab | Mengirim surel: lanjut kerja, dibalas kapan saja |

> **Praktik umum:** sistem nyata sering **hybrid** — request pengguna dilayani sinkron (mis. tampilkan status pesanan), sementara proses berat (kirim email, render video, hitung laporan) dilempar ke antrean asinkron.

## 9. Masalah pada Komunikasi Antar Proses

| Masalah | Penjelasan | Solusi |
| --- | --- | --- |
| **Reliability** | Pesan harus sampai lengkap dan berurutan meski ada paket hilang atau node crash | *Acknowledgement*, transmisi ulang, protokol andal seperti **TCP** |
| **Ordering** | Pesan harus diproses dalam urutan logis | Pipa FIFO, message queue, shared memory, socket & message passing, RPC |
| **Security** | Pesan bisa disadap atau dipalsukan | Enkripsi dan autentikasi |
| **Performance** | Komunikasi jaringan memakan waktu dan bandwidth | Optimasi **latency** dan **bandwidth** |

> **Contoh ordering:** pesan "hapus akun" diproses sebelum "buat akun" akan menghasilkan keadaan yang kacau. Urutan kejadian harus dijaga.

> **Catatan tambahan:** pada sistem nyata dikenal jaminan pengiriman *at-most-once* (bisa hilang, tidak dobel), *at-least-once* (tidak hilang, bisa dobel), dan *exactly-once* (paling sulit, biasanya butuh deduplikasi).

## 10. Protokol Komunikasi

**Protokol dasar (transport/jaringan):**

| Protokol | Karakter | Cocok untuk |
| --- | --- | --- |
| **TCP** | Andal, berurutan, ada kendali aliran | Transfer file, HTTP, database |
| **UDP** | Cepat, tanpa jaminan urutan/kedatangan | Video call, game, streaming |
| **HTTP** | Protokol aplikasi di atas TCP (kini juga HTTP/3 di atas QUIC) | API web |

**Protokol utama di atas HTTP:**

| Protokol | Model | Ciri |
| --- | --- | --- |
| **REST** | Resource + metode HTTP | `GET /produk/1`, stateless, mudah di-cache |
| **GraphQL** | Query language | Client menentukan field yang dibutuhkan, satu endpoint |
| **gRPC** | RPC | HTTP/2, format biner (Protocol Buffers), streaming, cepat |

> **Contoh pemilihan:** video call memilih UDP (lebih baik satu frame hilang daripada terlambat), sedangkan unduh file memilih TCP (tidak boleh ada byte yang hilang).

## 11. Konsep Sinkronisasi (Clock)

- Setiap node punya **jam lokal** sendiri.
- Jam perangkat keras mengalami **clock drift** (melambat/memaju) dan dipengaruhi latensi jaringan, sehingga muncul **clock skew** antar node.
- **Sinkronisasi clock** = menyelaraskan jam semua komputer lewat jaringan ke waktu yang sama dan konsisten.
- Penting untuk: pengurutan kejadian yang akurat, konsistensi data, dan operasi terkoordinasi.

Cara umum:

1. Sumber acuan berupa **atomic clock** → menghasilkan **TAI** (International Atomic Time); ditambah **GPS** dan **UTC** bila perlu.
2. Penyebaran waktu ke node menggunakan protokol **NTP** (Network Time Protocol) atau **PTP** (Precision Time Protocol). **PTP lebih presisi** daripada NTP.

> **Analogi:** Semua stasiun kereta harus memakai jam yang sama. Jika jam di tiap stasiun berbeda beberapa menit, jadwal kedatangan dan perpindahan penumpang menjadi kacau meski tiap jam terlihat "normal".

## 12. Logical Clock (Lamport Clock)

Karena jam fisik bisa meleset atau tidak bisa dipercaya saat terjadi partisi jaringan, **Leslie Lamport** mengusulkan **logical clock**: penghitung yang **tidak terkait jam dunia nyata**, hanya untuk menentukan **urutan kejadian**.

**Aturan Lamport:**

1. Setiap kejadian lokal → logical clock ditambah 1.
2. Saat mengirim pesan → sertakan nilai logical clock pada pesan.
3. Saat menerima pesan → bandingkan nilai pada pesan dengan clock lokal, **ambil yang terbesar, lalu tambah 1**.

**Contoh kasus (transaksi penjualan, 3 service):**

Urutan sebenarnya: penjualan 12:00:01 → update stok 12:00:02 → faktur 12:00:03. Jika memakai **timestamp jam nyata**, urutan bisa tertukar karena latensi, gangguan jaringan, atau masalah hardware.

Dengan logical clock (semua mulai 0):

| Langkah | Service | Proses | Logical clock |
| --- | --- | --- | --- |
| 1 | **Sales** | Catat transaksi, clock 0 + 1, kirim request dengan nilai 1 | **1** |
| 2 | **Product** | Terima nilai 1; bandingkan dengan lokal 0 → ambil max = 1; +1; kirim ke Invoice dengan nilai 2 | **2** |
| 3 | **Invoice** | Terima nilai 2; bandingkan dengan lokal 0 → ambil max = 2; +1; hasilkan faktur | **3** |

Hasil: urutan kejadian terjamin **Sales (1) → Product (2) → Invoice (3)**.

> **Analogi:** Nomor urut surat dinas. Yang dipakai bukan jam pengiriman, melainkan nomor agenda: surat dengan nomor lebih kecil dianggap terjadi lebih dulu, walaupun fisiknya baru sampai belakangan.

**Keterbatasan Lamport clock:** nilainya **scalar** (satu angka), sehingga tidak bisa membedakan kejadian yang benar-benar bersamaan (*concurrent*) dengan kejadian yang berurutan. Karena itu muncul pengembangan:

1. **Vector clocks** — Colin Fidge & Friedemann Mattern (1988)
2. **Plausible clocks** — Torres-Rojas & Ahamad (1999)
3. **Chain clocks** — Agarwal & Garg (2005)
4. **Interval Tree Clocks** — Almeida dkk. (2008)
5. **Bloom clocks** — Lum Ramabaja (2019)

## 13. Koordinasi Proses

Mekanisme agar beberapa proses independen di komputer berbeda dapat bekerja sama secara harmonis: mengelola komunikasi, sinkronisasi, dan akses sumber daya bersama **tanpa konflik** seperti **deadlock** atau **race condition**.

Contoh implementasi: **Apache ZooKeeper, etcd, Consul, ClickHouse Keeper, Oxia, KRaft**.

> **Analogi:** Petugas pengatur lalu lintas di persimpangan: kendaraan tetap boleh lewat, tetapi harus bergiliran agar tidak bertabrakan atau macet total.

Fungsi yang biasanya disediakan: pemilihan *leader*, penyimpanan konfigurasi, *distributed lock*, dan *membership* node.

## 14. Tantangan dan Solusi

| Tantangan | Solusi |
| --- | --- |
| **Message loss** | Retransmission & acknowledgement |
| **Deadlock** | Timeout, algoritma deteksi deadlock |
| **Data inconsistency** | Protokol konsensus (**Raft, Paxos**) |
| **Security** | **SSL/TLS** untuk enkripsi, **OAuth2** untuk otorisasi |

## 15. Current Issues

- **Edge & Fog Computing** — memproses data lebih dekat ke pengguna/perangkat untuk menekan latensi.
- **Observability & tracing** — memantau sistem lewat telemetry (log, metrik, trace) yang dikorelasikan.
- **Container orchestration** — **Kubernetes, Docker Swarm** sebagai pengelola penempatan dan replikasi proses.

## 16. Pembahasan Pertanyaan Diskusi

### 16.1 Apakah GraphQL termasuk RPC?

**Sebagian mirip, tetapi bukan RPC murni.**

- **Kemiripannya:** client menyebut nama operasi beserta argumen, misalnya `query { produk(id: 1) { nama } }` atau `mutation { buatPesanan(...) }`. Pola ini menyerupai pemanggilan fungsi jarak jauh, dan semua request dikirim ke **satu endpoint** (umumnya `POST /graphql`).
- **Perbedaannya:** GraphQL berorientasi pada **graph data dan skema**. Client menentukan sendiri field yang ingin diterima, sedangkan RPC klasik menetapkan bentuk respons dari fungsi yang dipanggil. GraphQL juga bukan protokol transport — ia berjalan di atas HTTP.

> **Ringkas:** GraphQL punya *gaya pemanggilan* menyerupai RPC, tetapi *model datanya* berbeda.

### 16.2 Apakah REST termasuk RPC?

**Bukan.** REST adalah **gaya arsitektur berbasis resource**, bukan pemanggilan fungsi.

| Aspek | RPC | REST |
| --- | --- | --- |
| Orientasi | Aksi/fungsi (kata kerja) | Resource/data (kata benda) |
| Contoh | `getUser(1)`, `deleteUser(1)` | `GET /users/1`, `DELETE /users/1` |
| Endpoint | Satu endpoint per operasi | Satu URL per resource; aksi ditentukan metode HTTP |
| Status | Bebas | *Stateless*, memanfaatkan semantik HTTP (status code, caching) |

Dalam praktik, banyak API yang mengaku REST sesungguhnya bergaya RPC, misalnya `POST /users/1/hapus` atau `POST /getUser`. Ciri REST yang paling mudah diperiksa: apakah URL menunjuk **benda** dan apakah aksinya memakai metode HTTP standar.

> **Ringkas:** RPC menyuruh "lakukan sesuatu", REST menyatakan "resource ini, dengan aksi standar".

### 16.3 Apakah telemetry merupakan solusi yang etis?

**Bergantung pada cara penerapannya.** Telemetry (pengumpulan otomatis log, metrik, dan trace) sangat penting untuk observability: mendeteksi error, mengukur performa, dan memperbaiki sistem terdistribusi yang kompleks. Persoalan etika muncul ketika telemetry mulai menyentuh **data pribadi**.

**Cenderung etis bila:**

- **Transparan** — pengguna tahu data apa yang dikumpulkan dan tujuannya.
- **Ada persetujuan** — tersedia pilihan *opt-in/opt-out*.
- **Minimal dan anonim** — hanya data teknis yang diperlukan, tanpa identitas pribadi.
- **Aman dan patuh regulasi** — terenkripsi serta mengikuti aturan seperti **UU PDP** (Indonesia) atau **GDPR** (Eropa).

**Cenderung tidak etis bila:** pengumpulan dilakukan diam-diam, mencakup data sensitif (lokasi, isi pesan, kebiasaan), atau data dijual kepada pihak lain.

> **Ringkas:** telemetry untuk **kesehatan sistem** wajar dan etis; telemetry untuk **mengawasi pengguna** perlu persetujuan dan batas yang jelas.

## 17. Ringkasan Cepat

- Proses = program yang sedang berjalan; di sistem terdistribusi proses tersebar di banyak node.
- Tanpa shared memory, komunikasi harus lewat **pesan**: langsung (socket), tidak langsung (queue), atau pub/sub.
- Empat jalur IPC: shared memory (tidak cocok lintas node), message passing (MPI), RPC (gRPC), middleware (MOM).
- Sinkron mudah dipahami tetapi terikat latensi; asinkron lebih tahan gangguan tetapi urutan/konsistensi lebih rumit.
- Jam fisik tidak bisa dipercaya sepenuhnya → gunakan NTP/PTP untuk sinkronisasi, dan **logical clock** (Lamport, lalu vector clock) untuk urutan kejadian.
- Koordinasi proses (ZooKeeper, etcd, Consul) mencegah deadlock dan race condition.
- Tantangan utama: pesan hilang, deadlock, inkonsistensi data, keamanan.

## Daftar Istilah

| Istilah | Arti singkat |
| --- | --- |
| Proses | Program yang sedang dieksekusi beserta state dan sumber dayanya |
| PCB | Struktur data OS yang menyimpan status sebuah proses |
| IPC | Inter-Process Communication — mekanisme komunikasi antar proses |
| Socket | Endpoint komunikasi langsung antar proses melalui jaringan |
| Mailbox / Message queue | Penampung pesan untuk komunikasi tidak langsung |
| Pub/Sub | Model komunikasi berbasis topik dan langganan |
| MPI | Standar message passing untuk komputasi paralel/terdistribusi |
| Stub | Kode perantara pada RPC yang menangani serialisasi dan pengiriman |
| Marshalling | Proses mengubah data menjadi format yang bisa dikirim lewat jaringan |
| Idempotency | Sifat operasi yang hasilnya sama walau dijalankan berulang |
| MOM | Middleware berorientasi pesan dengan pengiriman asinkron |
| Clock drift / skew | Jam melenceng dari waktu acuan / selisih antar jam node |
| NTP / PTP | Protokol sinkronisasi clock (PTP lebih presisi) |
| Logical clock | Penanda urutan kejadian tanpa bergantung waktu fisik |
| Vector clock | Logical clock berbentuk vektor untuk mendeteksi kejadian konkuren |
| Konsensus | Kesepakatan antar node, mis. Raft dan Paxos |
| Telemetry | Pengumpulan otomatis log, metrik, dan trace untuk observability |

---

[← Minggu 1](../01/README.md) · [Daftar materi](../README.md) · [Minggu berikutnya →](../03/README.md)
