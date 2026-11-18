# Kode Minggu 4 — Replikasi PostgreSQL dan Cluster Apache Ignite

Contoh konfigurasi pendamping materi [Minggu 4](../README.md).

## Prasyarat

- Docker Engine / Docker Desktop
- Docker Compose (plugin `docker compose` atau `docker-compose`)
- Port bebas: `5432`, `5433`, `10300`–`10302`, `10800`

## 1. PostgreSQL 18 — Streaming Replication

Berkas: [`postgresql/`](postgresql)

| Berkas | Fungsi |
| --- | --- |
| `00_init.sql` | Membuat user `replicator` dan physical replication slot |
| `docker-compose.yaml` | Primary (port 5432) dan replica (port 5433) |
| `env.sh` | Alias perintah Docker (opsional, Bash) |

```bash
cd postgresql
docker compose up -d

# cek status container (harus healthy)
docker compose ps

# uji replikasi: buat tabel di primary (nama container dari `docker compose ps`)
docker exec -it <nama-container-primary> psql -U zuser -d zdb -c "CREATE TABLE uji(id int);"
```

> Hati-hati: nama container mengikuti nama direktori. Periksa dengan `docker ps`, lalu sesuaikan perintah `docker exec`.

**High availability:** jika primary mati, promosikan replica dengan `pg_promote()` dari dalam container replica, lalu node tersebut dapat melayani tulis.

## 2. Apache Ignite 3 — Cluster Master–Master

Berkas: [`ignite/`](ignite)

| Berkas | Fungsi |
| --- | --- |
| `docker-compose.yaml` | Tiga node (`node1`–`node3`), image `apacheignite/ignite:3.1.0` |
| `env.sh` | Alias untuk CLI dan Docker Compose |
| `sql/` | `schema.sql` + dataset contoh Chinook |

```bash
cd ignite
docker compose up -d

# inisialisasi cluster (sekali saja)
docker run --rm -it --network=host -e LANG=C.UTF-8 -e LC_ALL=C.UTF-8 \
  apacheignite/ignite:3.1.0 cli \
  cluster init --name=ignite3 --metastorage-group=node1,node2,node3

# masuk ke CLI dengan direktori SQL ter-mount
docker run --rm -it --network=host -e LANG=C.UTF-8 -e LC_ALL=C.UTF-8 \
  -v ./sql:/opt/ignite/sql apacheignite/ignite:3.1.0 cli
```

Di dalam CLI: jalankan `sql`, lalu eksekusi `current_catalog.sql`, `schema.sql`, `media_and_genre.sql`, `ee_and_cust.sql`, `tracks.sql`, `invoices.sql`.

**Verifikasi replikasi:** buka `http://localhost:10301` dan `http://localhost:10302` (REST API tiap node), lalu periksa `SELECT * FROM system.tables WHERE schema = 'PUBLIC';` — data yang dibuat di node `10300` harus terlihat di kedua node lain.

## Catatan

- `docker compose down` untuk menghentikan semua container.
- Dataset `tracks.sql` dan `invoices.sql` berukuran besar; jalankan satu per satu agar CLI tidak timeout.
- Konfigurasi ini untuk latihan, bukan untuk produksi (tanpa TLS, tanpa manajemen rahasia).

## Tautan

- Materi: [04/README.md](../README.md)
- Daftar materi: [README.md](../../README.md)
