# Materi Minggu 5: Fault Tolerance

```text
Materi Minggu 5: Fault Tolerance
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: Rangkum materi 05--fault-tolerant-sys.pdf (22 slide), lecture note web-app-py-blacksheep-load-balancing-nginx.pdf, dan source code pendamping (check-server.py, check-retry.py, check-circuit-breaker.py, konfigurasi nginx + BlackSheep) menjadi catatan Markdown berbahasa Indonesia yang detail: pengertian fault tolerance, pentingnya pada sistem terdistribusi, jenis dan klasifikasi fault, design pattern (redundansi, load balancing, checkpointing, heartbeat, retry, circuit breaker, consensus), actor model dan supervisor, serta penjelasan kode dan cara menjalankan.
Bagian yang disesuaikan dari keluaran prompt ada pada: struktur heading, analogi dan contoh tambahan, tabel perbandingan jenis fault dan pola penanganannya, penjelasan parameter library (tenacity, pybreaker), penjelasan konfigurasi Docker dan nginx, serta daftar istilah.
```

> **Mata kuliah:** Sistem Terdistribusi dan Terdesentralisasi (FIF25002T, 3 SKS)
> **Program studi:** Informatika — Fakultas Teknologi Informasi, UTDI
> **Dosen:** Dr. Bambang Purnomosidi D. P.
> **Sumber:** materi kuliah pertemuan 5 (`05--fault-tolerant-sys.pdf`), *lecture note* `web-app-py-blacksheep-load-balancing-nginx.pdf`
> **Kode:** [`kode/heartbeat`](kode/heartbeat), [`kode/failure-detection`](kode/failure-detection), [`kode/load-balancing`](kode/load-balancing)
> **Status:** lengkap

## Tujuan Pembelajaran

- Menjelaskan mengapa fault tolerance diperlukan pada sistem terdistribusi dan terdesentralisasi.
- Menjelaskan pengertian **fault tolerance** dan **fault tolerant system**.
- Menjelaskan berbagai jenis fault dan klasifikasinya berdasarkan sumber.
- Menerapkan *design pattern* fault tolerance menggunakan Python.
- Menjelaskan bagaimana bahasa pemrograman dan perangkat pengembangan mengimplementasikan fault tolerance.

## 1. Apa Itu Fault Tolerance?

**Fault tolerance** adalah kemampuan sistem untuk **tetap beroperasi dengan benar** meskipun terjadi kegagalan atau kesalahan pada satu atau lebih komponennya.

Kemampuan ini wajib untuk sistem dengan karakteristik:

| Karakteristik | Arti | Contoh |
| --- | --- | --- |
| **High availability** | Layanan tersedia hampir sepanjang waktu | Marketplace, email |
| **Mission critical** | Kegagalan menghentikan operasi bisnis | Sistem pembayaran, ERP |
| **Life critical** | Kegagalan membahayakan nyawa | Perangkat medis, kendali penerbangan, sistem rem |

> **Analogi:** Pesawat komersial punya dua mesin dan beberapa sistem hidraulis cadangan. Bukan karena mesinnya jelek, tetapi karena **satu kegagalan tidak boleh membuat pesawat jatuh**.

**Bedakan tiga istilah:**

- **Fault** — cacat/penyebab potensial (mis. disk yang mulai rusak).
- **Error** — keadaan salah akibat fault (mis. data tidak terbaca).
- **Failure** — layanan berhenti sesuai harapan pengguna (mis. aplikasi tidak bisa diakses).

Fault tolerance berusaha menghentikan rantai ini di level **error**, sebelum menjadi **failure**.

## 2. Mengapa Penting pada Sistem Terdistribusi?

- Sistem terdistribusi/terdesentralisasi memiliki **banyak komponen**, sehingga peluang salah satu komponen bermasalah meningkat.
- Koneksi antar komponen bisa bermasalah (latensi, putus, paket hilang).
- Semakin **critical** aplikasi, semakin tinggi tuntutan agar tetap berfungsi.
- Tuntutan **high availability** harus **diantisipasi sejak desain**, bukan ditambahkan setelah insiden.

> **Perkiraan kasar:** jika satu server punya peluang tersedia 99%, maka 10 server tanpa desain fault tolerance justru menurunkan ketersediaan layanan, karena setiap komponen baru menambah titik gagal.

## 3. Jenis Fault

| Jenis | Ciri | Penyebab umum | Contoh |
| --- | --- | --- | --- |
| **Transient** | Sementara, muncul sekali lalu hilang | Petir, gangguan listrik sesaat, spike jaringan | Server restart karena mati lampu |
| **Intermittent** | Muncul dan hilang berulang | Hardware terlalu panas, konektor longgar, memori bermasalah | Server kadang error saat suhu ruangan naik |
| **Permanent** | Tetap, tidak hilang tanpa perbaikan | Disk rusak, komponen mati | Disk crash, RAM rusak |
| **Byzantine** | Komponen memberi hasil **acak/tidak konsisten** | Bug, serangan, node korup | Node mengirim jawaban berbeda ke tiap permintaan |

> **Analogi:** Transient = lampu berkedip karena petir. Intermittent = lampu berkedip saat AC dinyalakan. Permanent = lampu putus. Byzantine = saklar kadang menyalakan lampu, kadang kipas — tidak bisa dipercaya.

**Byzantine fault** adalah yang paling sulit: sistem tidak cukup mendeteksi "mati/tidak", tetapi harus menyimpulkan jawaban benar meskipun ada node yang **berbohong**. Solusinya memerlukan konsensus toleran Byzantine (mis. PBFT) dengan syarat jumlah node jujur melebihi sepertiga.

## 4. Klasifikasi Fault Berdasarkan Sumber

| Sumber | Contoh | Penanganan khas |
| --- | --- | --- |
| **Hardware** | Disk crash, power failure, RAM rusak | Redundansi (RAID), UPS, replikasi, node cadangan |
| **Software** | Bug, memory leak, race condition, konfigurasi salah | Testing, code review, restart otomatis, circuit breaker, canary release |
| **Communication** | Packet loss, network partition, latensi tinggi | Retry + backoff, timeout, replikasi, quorum |

## 5. Teknik / Design Pattern untuk Fault Tolerance

### 5.1 Redundansi dan Replikasi

- Sumber daya tidak tunggal; digandakan di beberapa node.
- Tujuan: menghilangkan **single point of failure**.
- Dibahas mendalam pada materi minggu 4 (replikasi master–slave, multi-master, quorum).

> **Analogi:** Menyimpan salinan dokumen penting di dua loket berbeda. Jika satu loket kebakaran, layanan tetap berjalan.

### 5.2 Load Balancing

- Menambah **instance** aplikasi (satu instance = satu proses aplikasi penuh yang aktif).
- Trafik dibagi oleh **load balancer** (HAProxy, nginx, dll.) ke beberapa instance.
- Manfaat: throughput lebih tinggi, satu instance mati tidak menghentikan layanan.
- Detail implementasi dibahas pada bagian 7.

### 5.3 Checkpointing dan Rollback Recovery

| Teknik | Pengertian |
| --- | --- |
| **Checkpointing** | Menyimpan status sistem secara berkala ke media penyimpanan |
| **Rollback recovery** | Mengembalikan sistem ke checkpoint terakhir setelah kegagalan |

Manfaat: pemulihan dimulai dari status tersimpan, bukan dari awal, sehingga **kehilangan data dan waktu pemrosesan minimal**. Trade-off: checkpoint terlalu sering membebani I/O; terlalu jarang membuat banyak pekerjaan hilang.

> **Analogi:** Menyimpan *save point* saat bermain game. Jika karakter mati, kamu kembali ke titik terakhir, bukan mengulang dari level 1.

### 5.4 Heartbeat dan Failure Detection

- **Heartbeat** — sinyal periodik antar komponen yang menandakan komponen masih hidup.
- **Failure detection** — menggunakan heartbeat untuk menyimpulkan apakah komponen gagal: jika tidak ada heartbeat dalam jangka waktu tertentu, komponen dianggap mati/tidak responsif.
- Pola ini krusial untuk deteksi dan penanganan kegagalan secara **tepat waktu**.

> **Analogi:** Aparat ronda menabuh kentongan tiap 15 menit. Kalau 30 menit tidak terdengar, warga curiga ada masalah di pos tersebut.

**Contoh kode:** [`kode/heartbeat/check-server.py`](kode/heartbeat/check-server.py) mengecek apakah host:port bisa dihubungi (TCP connect). Ini pemeriksaan sederhana; diagnostik lebih dalam memerlukan program yang lebih kompleks (cek proses, metrik, latency).

### 5.5 Retry (tenacity)

- Setiap komunikasi dengan komponen **di luar aplikasi** berpotensi gagal.
- Library **tenacity** mengelola percobaan ulang secara terkendali: batas jumlah percobaan, jeda yang meningkat, dan jenis error yang layak diulang.

**Contoh kode:** [`kode/failure-detection/check-retry.py`](kode/failure-detection/check-retry.py)

| Parameter | Nilai pada contoh | Arti |
| --- | --- | --- |
| `stop_after_attempt(5)` | 5 | Berhenti setelah 5 percobaan |
| `wait_exponential(multiplier=1, min=4, max=10)` | 4–10 detik | Jeda meningkat secara eksponensial, dibatasi 4–10 detik |
| `retry_if_exception_type(ConnectionError)` | hanya koneksi | Error 4xx/5xx **tidak** diulang |

Prinsip: **retry hanya untuk kegagalan sementara**. Mengulang error permanen (mis. 404) hanya membuang sumber daya dan memperparah kondisi layanan tujuan (*retry storm*).

### 5.6 Circuit Breaker

Pola untuk mencegah **kegagalan berantai** pada microservices dengan memblokir sementara panggilan ke layanan yang gagal. Bekerja seperti *state machine* dengan tiga status:

| Status | Perilaku |
| --- | --- |
| **Closed** | Permintaan diizinkan dan dipantau; jika jumlah kegagalan melewati ambang, pindah ke *open* |
| **Open** | Permintaan langsung ditolak, memberi layanan waktu untuk pulih |
| **Half-open** | Setelah batas waktu, sejumlah permintaan terbatas diizinkan untuk menguji pemulihan; berhasil → *closed*, gagal → *open* |

> **Analogi:** Pemutus arus listrik (MCB) di rumah. Saat terjadi korsleting, arus diputus agar kebakaran tidak menjalar; setelah diperbaiki, arus dinyalakan kembali.

**Contoh kode:** [`kode/failure-detection/check-circuit-breaker.py`](kode/failure-detection/check-circuit-breaker.py) dengan `pybreaker.CircuitBreaker(fail_max=4, reset_timeout=20)` — setelah 4 kegagalan, sirkuit terbuka selama 20 detik.

**Retry vs Circuit Breaker:**

| Aspek | Retry | Circuit Breaker |
| --- | --- | --- |
| Tujuan | Mengatasi kegagalan sesaat | Melindungi sistem dari layanan yang sedang bermasalah |
| Risiko bila salah | Membanjiri layanan (*retry storm*) | Menolak permintaan padahal layanan sudah pulih (selama *open*) |
| Kombinasi ideal | Retry terbatas + backoff + jitter | Circuit breaker di depan pemanggilan layanan |

### 5.7 Consensus dan Coordination

- **Consensus** — proses di beberapa node menyepakati satu nilai, status, atau urutan operasi, meski terjadi kegagalan dan penundaan jaringan.
- **Coordination** — praktik yang lebih luas dalam mengelola interaksi antar node agar bekerja sama efektif dan konsisten.
- Coordination sering memakai consensus sebagai komponen kunci.

**Contoh:**

1. **Leader election pada database cluster** — memilih node yang menangani write (Raft).
2. **Update file di cloud storage** (mis. Google Drive) — perubahan di-commit setelah disetujui mayoritas server, lalu direplikasi ke semua server.
3. **Blockchain** — konsensus untuk validasi dan persetujuan transaksi.

## 6. Actor Model untuk Supervisi Proses

- Setiap **actor** adalah unit proses kecil dengan **mailbox** sendiri; komunikasi hanya lewat pesan.
- **Supervisor** mengawasi worker: jika worker gagal, supervisor dapat me-restart, menghentikan, atau mengganti worker sesuai strategi.
- Hierarki supervisor membuat kegagalan **terisolasi**: satu actor mati tidak menjatuhkan seluruh sistem (*let it crash*).

**Dukungan di berbagai bahasa:**

| Bahasa/Platform | Dukungan |
| --- | --- |
| **Erlang/Elixir** | Built-in actor model + pola Supervisor–Worker (OTP) |
| **Pony** | Bahasa yang memang dirancang untuk actor model |
| **Python** | Library pihak ketiga: **Xoscar**, tenacity, pybreaker, dll. |
| **Java** | **Apache Pekko** (actor + supervisor), **Resilience4j** (fault tolerance) |

> **Analogi:** Struktur perusahaan: direktur mengawasi manajer, manajer mengawasi staf. Jika satu staf berhenti, manajer menggantikannya tanpa perusahaan berhenti beroperasi.

**Tugas dari materi:** telusuri library fault tolerance di berbagai ekosistem — `npm` (JavaScript), `crates.io` (Rust), dan lainnya.

## 7. Studi Kasus: Load Balancing dengan nginx (BlackSheep + Docker)

### 7.1 Arsitektur

```text
Client -> nginx (port 80) -> upstream backend
                             ├── bs_app instance 1
                             └── bs_app instance 2 (hasil --scale)
```

Ada dua komponen:

1. **Aplikasi BlackSheep** (`blacksheep_lb`) — aplikasi ASGI Python yang di-*scale* menjadi beberapa instance.
2. **Proxy nginx** — load balancer yang meneruskan request ke instance aplikasi.

### 7.2 File Penting

| File | Fungsi |
| --- | --- |
| [`kode/load-balancing/docker-compose.yml`](kode/load-balancing/docker-compose.yml) | Mendefinisikan service `bs_app` dan `nginx` |
| [`kode/load-balancing/nginx/Dockerfile`](kode/load-balancing/nginx/Dockerfile) | Menimpa konfigurasi default nginx |
| [`kode/load-balancing/nginx/nginx.conf`](kode/load-balancing/nginx/nginx.conf) | Definisi `upstream backend` + `proxy_pass` |
| [`kode/load-balancing/blacksheep_lb/Dockerfile`](kode/load-balancing/blacksheep_lb/Dockerfile) | Build aplikasi (multi-stage, Python 3.14.4-slim, uvicorn port 80) |
| [`kode/load-balancing/env.sh`](kode/load-balancing/env.sh) | Alias perintah, termasuk `--scale bs_app=2` |

**`nginx.conf` (ringkas):**

```nginx
upstream backend {
    server bs_app:80;   # nama service di docker-compose
}
server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

Docker Compose otomatis menyediakan **DNS internal** berdasarkan nama service, sehingga `bs_app` dapat diakses dari container nginx.

**`docker-compose.yml`:**

```yaml
services:
  bs_app:
    build: ./blacksheep_lb
  nginx:
    container_name: nginx
    build: ./nginx
    ports:
      - 80:80
    depends_on:
      - bs_app
```

**Menjalankan (dengan alias `dcu`):**

```bash
docker-compose up --build -d --scale bs_app=2
```

Perintah tersebut membuat **dua instance** `bs_app` (mis. `load-balancing-bs_app-1` dan `load-balancing-bs_app-2`) di belakang nginx. Prefix nama container berasal dari **nama direktori** proyek.

### 7.3 Aplikasi BlackSheep

- `app/main.py` menyusun aplikasi: middleware trailing slash, serving file statis, error handler, autentikasi, dokumentasi, templating.
- `app/controllers/home.py` — route `/` dan `/example` yang merender template Jinja.
- `app/controllers/examples.py` — contoh API `/api/examples` (GET/POST).
- `domain/common.py` — model domain bersama (paginasi, sorting, `TimedMixin`).
- `dev.py` — menjalankan server lokal di port **44777**; sedangkan di Docker aplikasi berjalan di port **80** melalui `uvicorn`.

> **Poin penting:** perbedaan port 44777 (development) dan 80 (Docker) sering menjadi sumber kebingungan saat pertama kali mencoba.

### 7.4 Cara Membuktikan Load Balancing Berjalan

1. Jalankan compose dengan `--scale bs_app=2`.
2. Akses `http://localhost` (port 80, bukan 44777) berulang kali.
3. Amati `docker logs` tiap instance: request akan tersebar ke kedua instance — pada contoh materi, satu instance menerima 2 akses dan yang lain 1 akses.

Distribusi request **tidak harus bergantian sempurna**; secara default nginx memakai round-robin, tetapi timing dan keep-alive dapat membuat distribusinya tampak tidak seimbang.

4. Hentikan semuanya dengan `docker compose down` (alias `dcd`).

### 7.5 Kaitan dengan Fault Tolerance

- Jika satu instance `bs_app` mati, nginx tetap meneruskan trafik ke instance lain → layanan tidak berhenti.
- Namun konfigurasi ini **belum** punya *health check* aktif: nginx dapat tetap mengirim request ke instance yang mati sampai koneksi gagal. Pada produksi, tambahkan `health_check`/`max_fails`/`fail_timeout` dan mekanisme *auto-restart* (`restart: always`).
- Untuk high availability tingkat lanjut: replikasi data, quorum, dan orkestrasi (Kubernetes) yang otomatis mengganti instance gagal.

## 8. Ringkasan Cepat

- Fault tolerance = tetap beroperasi benar saat komponen gagal; penting untuk high availability, mission critical, life critical.
- Jenis fault: transient, intermittent, permanent, byzantine; sumber: hardware, software, communication.
- Pola utama: redundansi/replikasi, load balancing, checkpointing & rollback, heartbeat & failure detection, retry dengan backoff, circuit breaker, consensus & coordination.
- Retry menangani gangguan sesaat; circuit breaker melindungi dari layanan yang sedang bermasalah.
- Actor model + supervisor (Erlang/Elixir, Pony, Pekko, Xoscar) membuat kegagalan terisolasi.
- nginx + Docker Compose memungkinkan scaling horizontal sederhana: satu aplikasi, dua instance, satu pintu masuk.
- Fault tolerance bukan satu teknik, melainkan **kombinasi** beberapa pola yang dirancang sejak awal.

## Daftar Istilah

| Istilah | Arti singkat |
| --- | --- |
| Fault / Error / Failure | Penyebab cacat / keadaan salah / layanan berhenti sesuai harapan |
| Transient fault | Gangguan sementara yang hilang sendiri |
| Intermittent fault | Gangguan berulang yang muncul-hilang |
| Permanent fault | Kerusakan tetap sampai diperbaiki |
| Byzantine fault | Komponen memberi hasil tidak konsisten/acak |
| Redundansi | Penggandaan komponen untuk menghilangkan titik gagal tunggal |
| Single point of failure | Satu komponen yang kegagalannya menjatuhkan seluruh sistem |
| Load balancer | Pembagi trafik ke beberapa instance aplikasi |
| Upstream | Grup server tujuan pada konfigurasi nginx |
| Checkpointing | Penyimpanan status sistem secara berkala |
| Rollback recovery | Pemulihan ke checkpoint terakhir |
| Heartbeat | Sinyal periodik penanda komponen masih hidup |
| Retry dengan backoff | Pengulangan permintaan dengan jeda yang meningkat |
| Retry storm | Banjir permintaan ulang yang memperburuk kegagalan |
| Circuit breaker | Pemutus panggilan ke layanan yang gagal (closed/open/half-open) |
| Consensus | Kesepakatan nilai/urutan operasi antar node |
| Leader election | Pemilihan node pemimpin, mis. lewat Raft |
| Actor model | Model konkurensi berbasis actor dengan mailbox dan pesan |
| Supervisor | Komponen pengawas yang me-restart/mengganti worker gagal |
| BlackSheep | Framework web ASGI Python yang dipakai pada contoh |

---

[← Minggu 4](../04/README.md) · [Daftar materi](../README.md) · [Minggu berikutnya →](../06/README.md)
