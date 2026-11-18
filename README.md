# Rangkuman Sistem Terdistribusi dan Terdesentralisasi

![Markdown](https://img.shields.io/badge/format-Markdown-000000?logo=markdown&logoColor=white)
![Materi](https://img.shields.io/badge/materi-6%20minggu-1f6feb)
![Lisensi](https://img.shields.io/badge/lisensi-MIT-2ea44f)
![Status](https://img.shields.io/badge/status-lengkap-brightgreen)

Catatan kuliah **Sistem Terdistribusi dan Terdesentralisasi** (FIF25002T, 3 SKS) yang disusun ulang dari materi perkuliahan: apa yang dibahas dosen, dirangkum menjadi catatan yang bisa dibaca cepat, dilengkapi tabel pembanding, analogi, contoh perhitungan, dan tabel istilah.

Setiap minggu punya satu berkas `README.md`, dan kode pendamping (jika ada) disimpan di subfolder `kode/`.

## Identitas Penulis

| Field | Isi |
| --- | --- |
| Nama | Nasykhariyanda Pratama |
| NIM | 205410181 |
| Program Studi | Informatika |
| Fakultas | Fakultas Teknologi Informasi, UTDI |
| Mata Kuliah | Sistem Terdistribusi dan Terdesentralisasi |
| Kode / SKS | FIF25002T / 3 SKS |
| Semester | Ganjil 2026/2027 |

## Daftar Materi

| Minggu | Topik | Ringkasan | Kode |
| :---: | --- | --- | :---: |
| 1 | Pengenalan Sistem Terdistribusi dan Terdesentralisasi | [01/README.md](01/README.md) | — |
| 2 | Proses dan Komunikasi Antar Proses | [02/README.md](02/README.md) | — |
| 3 | Sinkronisasi dan Koordinasi pada Sistem Terdistribusi | [03/README.md](03/README.md) | [kode](03/kode/README.md) |
| 4 | Konsistensi dan Replikasi | [04/README.md](04/README.md) | [kode](04/kode/README.md) |
| 5 | Fault Tolerance | [05/README.md](05/README.md) | [kode](05/kode/README.md) |
| 6 | Distributed File System | [06/README.md](06/README.md) | — |

## Struktur Repository

```text
rangkuman-sistem-terdistribusi
├── 01/README.md
├── 02/README.md
├── 03/
│   ├── README.md
│   └── kode/
├── 04/
│   ├── README.md
│   └── kode/
├── 05/
│   ├── README.md
│   └── kode/
├── 06/README.md
├── docs/prompt-template.md
├── tools/extract-pdf.mjs
├── README.md
└── LICENSE
```

## Cara Menjalankan Kode

| Minggu | Prasyarat | Perintah |
| :---: | --- | --- |
| 3 | Python ≥ 3.10 | `python 03/kode/vclocks.py` |
| 4 | Docker + Docker Compose | `cd 04/kode/postgresql && docker compose up -d` (panduan Ignite di [04/kode/README.md](04/kode/README.md)) |
| 5 | Python ≥ 3.10, Docker | lihat [05/kode/README.md](05/kode/README.md) |

Petunjuk lengkap tiap contoh ada di `README.md` pada folder `kode/` masing-masing.

## Format Penulisan

Semua catatan mengikuti blok metadata yang sama, agar asal-usul dan proses penyusunannya terlacak:

```text
Materi Minggu X: <Topik>
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: <Prompt yang diberikan ke AI>
Bagian yang disesuaikan dari keluaran prompt ada pada: <Bagian yang diedit>

<Materi rangkuman di sini>
```

Selain blok tersebut, setiap minggu memuat: tujuan pembelajaran, isi materi bernomor, tabel pembanding, analogi dan contoh, ringkasan cepat, dan daftar istilah. Pembahasan pertanyaan diskusi ditambahkan bila slide memuatnya.

## Sumber

- Materi kuliah **Sistem Terdistribusi dan Terdesentralisasi** — Dr. Bambang Purnomosidi D. P., Fakultas Teknologi Informasi, Universitas Teknologi Digital Indonesia.
- Lecture note pendamping: PostgreSQL 18 streaming replication, Apache Ignite 3 cluster, load balancing nginx, Apache Hadoop HDFS.
- Dokumentasi resmi: PostgreSQL, Apache Ignite, nginx, Apache Hadoop, BlackSheep.

## Catatan Akademik

Repository ini adalah catatan belajar, bukan pengganti materi resmi. Rangkuman disusun dengan bantuan AI, lalu ditata dan disesuaikan; nama model, prompt, dan bagian yang diubah dicatat pada blok metadata di setiap minggu. Rujuk selalu slide dan penjelasan dosen sebagai sumber utama.

## Lisensi

Dirilis di bawah [MIT License](LICENSE).
