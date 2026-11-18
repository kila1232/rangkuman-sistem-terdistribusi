# Kode Minggu 5 — Fault Tolerance

Contoh kode pendamping materi [Minggu 5](../README.md).

## 1. Heartbeat — `heartbeat/check-server.py`

Pemeriksaan sederhana apakah sebuah host:port dapat dihubungi (TCP connect).

```bash
python heartbeat/check-server.py localhost 8080
```

Keluaran: `Server up` atau `Server down`.

## 2. Failure Detection — `failure-detection/`

Prasyarat:

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install tenacity pybreaker requests
```

| Berkas | Pola | Inti konfigurasi |
| --- | --- | --- |
| `check-retry.py` | Retry | 5 percobaan, backoff eksponensial 4–10 detik, hanya untuk `ConnectionError` |
| `check-circuit-breaker.py` | Circuit breaker | `fail_max=4`, `reset_timeout=20` detik |

```bash
python failure-detection/check-retry.py
python failure-detection/check-circuit-breaker.py
```

Keduanya menargetkan `http://localhost:44777`; pastikan ada layanan yang berjalan di port tersebut, atau ubah URL-nya untuk melihat perilaku gagal.

## 3. Load Balancing — `load-balancing/`

Arsitektur: `client → nginx (port 80) → bs_app (2 instance)`.

```bash
cd load-balancing
docker compose up --build -d --scale bs_app=2
```

Lalu buka `http://localhost` berulang kali dan bandingkan `docker logs` tiap instance — request akan tersebar ke kedua instance.

| Berkas | Fungsi |
| --- | --- |
| `docker-compose.yml` | Service `bs_app` (di-scale) dan `nginx` |
| `nginx/nginx.conf` | `upstream backend { server bs_app:80; }` + `proxy_pass` |
| `blacksheep_lb/` | Aplikasi ASGI BlackSheep (template MVC), port 80 di dalam container |

Menghentikan semuanya:

```bash
docker compose down
```

> Catatan: konfigurasi ini belum memiliki health check aktif, sehingga nginx dapat tetap mengirim request ke instance yang mati sampai koneksi gagal. Untuk produksi, tambahkan `max_fails`/`fail_timeout` serta restart otomatis.

## Tautan

- Materi: [05/README.md](../README.md)
- Daftar materi: [README.md](../../README.md)
