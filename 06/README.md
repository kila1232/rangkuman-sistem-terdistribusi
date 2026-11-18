# Materi Minggu 6: Distributed File System

```text
Materi Minggu 6: Distributed File System
AI yang digunakan: DeepSeek V4.1 Flash Free
Prompt: Rangkum materi 06--distributed-filesystem.pdf (26 slide) beserta lecture note menggunakan-hadoop-hdfs--linux.pdf menjadi catatan Markdown berbahasa Indonesia yang detail: pengertian dan jenis file system, cara kerja file system (system call, VFS, driver), pengertian dan karakteristik distributed file system, perbandingan DAS/NAS/SAN/DFS, contoh DFS (GFS, Colossus, CephFS, Gluster, HDFS, Lustre), cara kerja DFS, studi kasus HDFS (arsitektur, blok, replikasi), langkah instalasi Hadoop 3.5.0 di Linux beserta file konfigurasi, pengertian cloud storage, relasinya dengan DFS, tipe cloud storage (object/file/block), serta studi kasus. Sertakan analogi, tabel, dan daftar istilah.
Bagian yang disesuaikan dari keluaran prompt ada pada: struktur heading, analogi dan contoh tambahan, tabel perbandingan (jenis FS, DAS/NAS/SAN/DFS, tipe cloud storage), tabel ringkasan file konfigurasi Hadoop, alur baca-tulis HDFS, dan daftar istilah.
```

> **Mata kuliah:** Sistem Terdistribusi dan Terdesentralisasi (FIF25002T, 3 SKS)
> **Program studi:** Informatika — Fakultas Teknologi Informasi, UTDI
> **Dosen:** Dr. Bambang Purnomosidi D. P.
> **Sumber:** materi kuliah pertemuan 6 (`06--distributed-filesystem.pdf`), *lecture note* `menggunakan-hadoop-hdfs--linux.pdf`
> **Status:** lengkap

## Tujuan Pembelajaran

- Menjelaskan pengertian file system dan jenis-jenisnya.
- Menjelaskan cara kerja file system secara umum.
- Menjelaskan pengertian dan jenis distributed file system (DFS).
- Menjelaskan cara kerja DFS secara umum.
- Melakukan instalasi salah satu DFS (HDFS) dan memahami cara kerjanya.
- Menjelaskan cloud storage serta hubungannya dengan DFS.
- Melakukan instalasi salah satu object storage sebagai cloud storage.

## 1. File System

**File system (FS)** adalah metode yang digunakan sistem operasi untuk **mengelola dan mengatur file** pada media penyimpanan (hard disk, USB flash drive, SSD, dan sebagainya).

Penulisan yang lazim: *file system*, *filesystem*, disingkat **FS** atau **fs**.

| Sistem operasi | Contoh file system |
| --- | --- |
| **Linux** | ext4, XFS, btrfs, ReiserFS |
| **DOS/Windows** | FAT16, FAT32, NTFS |
| **macOS** | APFS (Apple File System) |

**Hal penting yang sering tertukar:**

- **FS** adalah format/cara pengelolaan data di media penyimpanan.
- **Hirarki FS** adalah pengaturan file dan direktori yang dilihat pengguna. Di Linux, hirarki ini mengikuti **FHS (Filesystem Hierarchy Standard)** — mis. `/etc`, `/var`, `/home`.
- Pengguna **hanya melihat hirarki**, tidak perlu tahu FS apa yang dipakai di baliknya. Satu sistem bisa memakai ext4 di `/`, btrfs di `/home`, dan FAT32 di USB.

> **Analogi:** FS seperti **sistem pengarsipan di lemari**: ada aturan penomoran, label, dan cara menyimpan dokumen. Hirarki FS adalah **peta rak** yang dilihat pengunjung. Pengunjung cukup tahu "dokumen ada di rak B-3", tanpa perlu tahu lemari itu dibuat dari kayu atau besi.

### 1.1 Cara Kerja File System

Alur akses penyimpanan:

```text
Aplikasi (user space)
   -> System Call Interface
   -> Virtual File System (VFS)
   -> Driver file system di kernel
   -> Hardware (media penyimpan)
```

- Setiap FS diakses melalui **driver file system** yang dikelola kernel.
- Kernel menyediakan **virtual file system (VFS)** sebagai lapisan abstraksi, sehingga aplikasi dapat memakai operasi yang sama (`open`, `read`, `write`, `close`) untuk FS apa pun.
- Diagram lengkap tumpukan penyimpanan Linux (kernel 6) tersedia di *Linux Storage Stack Diagram*.

> **Analogi VFS:** colokan listrik standar. Perangkat apa pun (lampu, kipas, charger) dapat dicolok ke stopkontak yang sama, meskipun komponen internalnya berbeda.

## 2. Distributed File System (DFS)

**DFS bukan sekadar "FS yang tersebar di lebih dari satu mesin".** Secara konseptual, DFS adalah **sistem abstraksi terkoordinasi** dari sekumpulan media penyimpanan yang **menutupi heterogenitas, kegagalan, dan konkurensi**, sehingga terbentuk jaringan penyimpanan yang **terintegrasi, andal, dan berkinerja tinggi**.

Dari sisi pengguna, banyak media penyimpanan tersebut **tampak sebagai satu media penyimpanan**.

Tiga hal yang harus disembunyikan DFS:

| Tantangan | Arti | Cara DFS menanganinya |
| --- | --- | --- |
| **Heterogenitas** | Perangkat/OS/FS berbeda-beda | Lapisan abstraksi dan protokol jaringan yang seragam |
| **Kegagalan** | Node/disk bisa mati kapan saja | Replikasi, deteksi kegagalan, pemulihan otomatis |
| **Konkurensi** | Banyak client mengakses bersamaan | Konsistensi, locking, koordinasi metadata |

> **Analogi:** Perpustakaan besar dengan banyak gudang buku. Pengunjung memesan "buku X" lewat satu katalog; petugas yang mencari ke gudang mana pun, menyalin buku jika satu gudang rusak, dan mengatur peminjaman bersamaan — pengunjung tetap merasa hanya ada satu perpustakaan.

### 2.1 DAS vs NAS vs SAN vs DFS

| Aspek | DAS (Direct-Attached Storage) | NAS (Network-Attached Storage) | SAN (Storage Area Network) | DFS |
| --- | --- | --- | --- | --- |
| **Level abstraksi** | Blok, langsung ke satu server | File, lewat jaringan (NFS/SMB) | Blok, lewat jaringan khusus | Perangkat lunak di atas banyak node |
| **Cara akses** | Kabel langsung (SATA/SAS) | Protokol file sharing | Fibre Channel/iSCSI | API/protokol DFS (mis. HDFS) |
| **Yang dibagi** | Disk fisik | Direktori/file | Block device | File & direktori terdistribusi |
| **Skalabilitas** | Terbatas | Sedang | Tinggi, tetapi mahal | Tinggi, horizontal |
| **Contoh** | Disk internal server | Synology NAS, NFS server | Storage array enterprise | GFS, HDFS, CephFS |

**Poin dari materi:**

- DFS adalah **abstraksi level software** yang mengelola data ke dalam file dan direktori yang dapat didistribusikan ke banyak node.
- SAN menyajikan penyimpanan sebagai kumpulan **block device** yang bisa dihubungkan langsung ke server lalu diformat dengan FS sendiri.
- SAN secara konseptual **bisa** menjadi media penyimpanan DFS, tetapi **tidak disarankan**. Penggunaan umum SAN: backend database skala besar, editing video/audio, dan virtualisasi skala besar.
- DFS umumnya lebih mengarah pada **DAS di setiap node** (storage lokal per node yang dikelola perangkat lunak DFS).

## 3. DFS yang Umum Digunakan

| DFS | Keterangan |
| --- | --- |
| **Google File System (GFS)** | DFS Google generasi pertama, desain untuk data sangat besar |
| **Colossus** | Penerus GFS; dipakai YouTube, Gmail, Google Docs |
| **CephFS** | DFS dari proyek Ceph, terintegrasi dengan object/block storage |
| **Gluster** | DFS terdistribusi berbasis volume, mudah diskalakan |
| **HDFS** | Hadoop Distributed File System, komponen inti Apache Hadoop |
| **Lustre** | DFS berperforma tinggi untuk HPC |

### 3.1 Cara Kerja DFS Secara Umum

Pola yang hampir selalu muncul:

1. **Metadata service** — menyimpan peta nama file, direktori, dan lokasi blok.
2. **Data node/storage node** — menyimpan potongan data sebenarnya.
3. **Pemecahan data** — file besar dipecah menjadi blok/chunk.
4. **Replikasi/erasure coding** — setiap blok disalin ke beberapa node.
5. **Client** — menghubungi metadata service untuk mencari lokasi, lalu membaca/menulis langsung ke data node.

Pemisahan **metadata** dan **data** inilah yang membuat DFS dapat diskalakan: metadata berukuran kecil dan dapat direplikasi, sedangkan data berukuran besar disebar ke banyak node.

## 4. Studi Kasus: HDFS

**HDFS (Hadoop Distributed File System)** adalah FS **open source, scalable, terdistribusi, dan fault-tolerant** yang dirancang untuk mengelola dataset besar pada **klaster komoditas**.

**Commodity hardware** = perangkat keras yang diproduksi massal, murah, mudah dipertukarkan, dan tersedia dari banyak vendor. Filosofi HDFS: **lebih baik mengasumsikan hardware sering gagal** daripada membeli hardware mahal.

- HDFS adalah komponen utama **Apache Hadoop**.
- Cara kerja: file dibagi menjadi **blok**, didistribusikan ke beberapa server, lalu **direplikasi** untuk mencapai high availability.
- **Apache Hadoop 3.5.0** (rilis 2 April 2026) dikompilasi dengan **JDK 17**; server berjalan di **Java 17**, client dapat memakai **Java 17 atau 21**.

### 4.1 Arsitektur

| Komponen | Peran |
| --- | --- |
| **NameNode** | Menyimpan metadata: namespace, hirarki direktori, pemetaan blok → DataNode |
| **DataNode** | Menyimpan blok data dan melayani baca/tulis dari client |
| **Secondary NameNode** | Membantu *checkpoint* metadata (bukan pengganti NameNode) |
| **ResourceManager / NodeManager** | Komponen YARN untuk penjadwalan sumber daya (MapReduce dan aplikasi lain) |
| **Client** | Berkomunikasi dengan NameNode untuk metadata, lalu langsung ke DataNode untuk data |

Karakteristik penting:

- **Blok default 128 MB** (Hadoop 2+), jauh lebih besar dari blok FS biasa agar overhead metadata kecil.
- **Replication factor** default 3 — setiap blok disalin ke tiga DataNode (bisa diubah, mis. `dfs.replication = 1` untuk latihan satu node).
- **Rack awareness** — salinan blok disebar antar rack agar satu rack mati tidak menghilangkan semua salinan.
- **Write-once, read-many** — HDFS dioptimalkan untuk *batch processing*, bukan update file kecil berulang.
- NameNode adalah **single point of failure** pada mode klasik; Hadoop HA mengatasinya dengan **Standby NameNode** + ZooKeeper/ZKFC.

> **Analogi:** NameNode seperti **katalog perpustakaan**, DataNode seperti **gudang buku**. Katalog mencatat buku ada di gudang mana; pengunjung mengambil buku langsung dari gudang. Jika satu gudang terbakar, salinan di gudang lain tetap tersedia.

### 4.2 Alur Baca dan Tulis (ringkas)

**Tulis:**

1. Client meminta izin menulis ke NameNode.
2. NameNode memberi daftar DataNode tujuan (sesuai replikasi).
3. Data dikirim ke DataNode pertama, lalu **diteruskan pipeline** ke DataNode berikutnya.
4. Setelah semua salinan tersimpan, NameNode mencatat blok sebagai selesai.

**Baca:**

1. Client meminta lokasi blok ke NameNode.
2. NameNode mengembalikan daftar DataNode yang menyimpan blok tersebut.
3. Client membaca langsung dari DataNode terdekat; jika gagal, mencoba DataNode lain.

## 5. Praktik: Instalasi Apache Hadoop 3.5.0 (Linux)

### 5.1 Prasyarat

| Perangkat | Keterangan |
| --- | --- |
| **JDK** | 17 dan/atau 21 (server: 17; client: 17 atau 21) |
| **Apache Hadoop** | versi **3.5.0** |
| **pdsh** | Parallel distributed shell, untuk menjalankan perintah di banyak node |
| **ssh / sshd** | sshd harus berjalan (Artix + dinit: `sudo dinitctl start sshd`; systemd: `sudo systemctl start ssh`) |

### 5.2 Unduh dan Ekstrak

1. Unduh distribusi dari halaman rilis Apache Hadoop.
2. Ekstrak, misalnya di `~/software/storage/`:

```bash
cd ~/software/storage/
tar -xvf ~/master/data-engineering/apache-hadoop/hadoop-3.5.0.tar.gz
ln -s hadoop-3.5.0 hadoop
```

3. Lokasi instalasi selanjutnya disebut **`$HADOOP_HOME`** (mis. `$HOME/software/storage/hadoop`).
4. Setiap membuka shell, muat variabel lingkungan:

```bash
source ~/env/bash/storage/hadoop.sh
```

5. Verifikasi dengan menjalankan perintah `hadoop`.

### 5.3 pdsh dan SSH Tanpa Password

- Sebagian distro menyediakan paket `pdsh`; pada Artix Linux harus dikompilasi dari AUR.
- Jika tipe RCMD bukan ssh, set: `export PDSH_RCMD_TYPE=ssh`.
- Agar ssh ke localhost tidak meminta password:

```bash
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```

### 5.4 File Konfigurasi

| File (di `$HADOOP_HOME/etc/hadoop/`) | Properti penting | Nilai contoh |
| --- | --- | --- |
| **`hdfs-site.xml`** | `dfs.replication` | `1` (latihan single node; produksi 3) |
| **`core-site.xml`** | `fs.defaultFS` | `hdfs://localhost:9000` |
| | `hadoop.proxyuser.<user>.groups` / `.hosts` | `*` (izinkan proxy user) |
| **`mapred-site.xml`** | `mapreduce.framework.name` | `yarn` |
| | `mapreduce.application.classpath` | `$HADOOP_CLASSPATH:$HADOOP_HOME/share/hadoop/mapreduce/*:...` |
| **`yarn-site.xml`** | `yarn.nodemanager.aux-services` | `mapreduce_shuffle` |
| | `yarn.nodemanager.resource.memory-mb` | `4096` |
| | `yarn.scheduler.minimum-allocation-mb` | `2048` |
| | `yarn.nodemanager.vmem-pmem-ratio` | `2.1` |
| **`hadoop-env.sh`** | `JAVA_HOME` | sesuai lokasi JDK di sistem |

**`fs.defaultFS = hdfs://localhost:9000`** menetapkan bahwa filesystem default adalah HDFS pada NameNode lokal port **9000**.

### 5.5 Format NameNode

Dijalankan **sekali saja**:

```bash
hdfs namenode -format
```

> **Peringatan:** memformat ulang akan **menghapus** metadata dan seluruh file yang sudah tercatat di HDFS.

### 5.6 Menjalankan Daemon

- Jalankan daemon HDFS (dan YARN bila diperlukan) dengan skrip Hadoop.
- Pantau melalui web UI:
  - **NameNode UI**: `http://localhost:9870`
  - **YARN ResourceManager UI**: `http://localhost:8088`

### 5.7 Operasi File di HDFS

Contoh perintah (daftar lengkap ada di dokumentasi *FileSystemShell*):

```bash
hdfs dfs -ls /
hdfs dfs -mkdir -p /data/contoh
hdfs dfs -put berkas-lokal.txt /data/contoh/
hdfs dfs -cat /data/contoh/berkas-lokal.txt
hdfs dfs -get /data/contoh/berkas-lokal.txt .
hdfs dfs -rm /data/contoh/berkas-lokal.txt
```

Untuk menghentikan HDFS, gunakan skrip penghentian daemon dari Hadoop.

## 6. Cloud Storage

**Cloud storage** adalah layanan online yang memungkinkan pengguna menyimpan dan mengakses data di **server jarak jauh** melalui internet, bukan di hard drive lokal.

- Merupakan model penyimpanan data di cloud, dikelola **remote** dalam **pool logis**, diakses lewat jaringan (umumnya internet).
- Penyimpanan fisiknya terdiri dari banyak server — kadang di beberapa lokasi.
- Lingkungan fisik biasanya **dimiliki dan dikelola penyedia cloud**.
- Contoh: **Amazon S3**, **Azure Blob Storage**, **Google Cloud Storage (GCS)**.

> **Analogi:** Menyewa gudang milik orang lain. Kita tidak tahu gudang mana yang menyimpan barang kita dan tidak perlu tahu; yang penting barang bisa diambil kapan saja lewat pintu layanan.

### 6.1 Relasi Cloud Storage dengan DFS

- Cloud storage adalah **tempat penyimpanan data**; pengorganisasiannya dapat dilakukan oleh **DFS**.
- Contoh: **S3 dapat dipakai sebagai backend HDFS** — S3 adalah cloud storage, sedangkan operasi filesystem dilakukan oleh HDFS. Konfigurasi dilakukan pada `core-site.xml`.

### 6.2 Tipe Cloud Storage

| Tipe | Cara menyimpan | Cocok untuk | Contoh |
| --- | --- | --- | --- |
| **Object storage** | Data sebagai objek (data + metadata + ID unik) dalam bucket | File tidak terstruktur, backup, arsip, data lake | Amazon S3, Azure Blob, GCS |
| **File storage** | Hirarki file dan direktori, diakses lewat protokol file (NFS/SMB) | Berbagi dokumen, aplikasi yang butuh path file | Azure Files, Amazon EFS |
| **Block storage** | Volume blok yang dipasang ke server | Database, VM, aplikasi yang butuh I/O rendah latensi | Amazon EBS, Azure Disk |

Perbedaan inti: **object** tidak punya hirarki direktori sebenarnya dan sangat skalabel; **file** mempertahankan hirarki; **block** paling dekat ke disk fisik dan paling fleksibel untuk sistem operasi.

### 6.3 Studi Kasus Cloud Storage

Materi menampilkan contoh implementasi object storage dan arsitektur **CubeFS** — sistem penyimpanan terdistribusi yang menyatukan object, file, dan block storage dalam satu klaster dengan komponen metadata, data, dan client.

## 7. Ringkasan Cepat

- File system = metode OS mengelola file di media penyimpanan; diakses aplikasi lewat system call → VFS → driver → hardware.
- Hirarki FS (FHS) adalah tampilan yang dilihat pengguna, berbeda dari jenis FS yang dipakai.
- DFS = abstraksi terkoordinasi dari banyak media penyimpanan; menyembunyikan heterogenitas, kegagalan, dan konkurensi.
- DFS ≠ NAS/SAN: DFS adalah abstraksi level software di atas banyak node, umumnya memakai storage lokal (DAS) per node.
- Metadata dan data dipisahkan: metadata kecil dan direplikasi, data besar disebar dalam blok.
- HDFS: NameNode + DataNode, blok 128 MB, replikasi default 3, rack awareness, write-once read-many.
- Instalasi Hadoop 3.5.0: prasyarat JDK 17, pdsh, ssh; konfigurasi di `core-site.xml`, `hdfs-site.xml`, `mapred-site.xml`, `yarn-site.xml`, `hadoop-env.sh`; format NameNode sekali saja; UI di port 9870 dan 8088.
- Cloud storage: object, file, dan block storage; dapat menjadi backend DFS (mis. S3 untuk HDFS melalui `core-site.xml`).

## Daftar Istilah

| Istilah | Arti singkat |
| --- | --- |
| File system | Metode OS mengelola file pada media penyimpanan |
| VFS | Virtual File System, lapisan abstraksi di kernel |
| FHS | Filesystem Hierarchy Standard, standar hirarki direktori Linux |
| DFS | Distributed File System, FS logis di atas banyak node |
| DAS | Storage yang terpasang langsung ke satu server |
| NAS | Storage file yang diakses melalui jaringan |
| SAN | Jaringan penyimpanan yang menyajikan block device |
| Metadata | Informasi tentang data (nama, lokasi, permission) |
| NameNode | Node penyimpan metadata HDFS |
| DataNode | Node penyimpan blok data HDFS |
| Blok | Potongan file berukuran tetap (default 128 MB di HDFS) |
| Replication factor | Jumlah salinan setiap blok |
| Rack awareness | Penempatan salinan lintas rack agar tahan kegagalan |
| Commodity hardware | Perangkat keras massal, murah, mudah diganti |
| HDFS | Hadoop Distributed File System |
| YARN | Manajer sumber daya Hadoop |
| Object storage | Penyimpanan berbasis objek dalam bucket (S3, GCS) |
| Block storage | Volume blok untuk server/VM (EBS, Azure Disk) |
| File storage | Penyimpanan berhirarki via NFS/SMB (EFS, Azure Files) |

---

[← Minggu 5](../05/README.md) · [Daftar materi](../README.md)
