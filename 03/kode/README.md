# Kode Minggu 3 — Vector Clock dan Multithreading

Contoh kode pendamping materi [Minggu 3](../README.md).

## Prasyarat

- Python 3.10 atau lebih baru
- Tidak ada dependensi eksternal (hanya pustaka standar)

## Berkas

| Berkas | Isi |
| --- | --- |
| `vclocks.py` | Implementasi kelas `VectorClock`: `increment`, `send_message`, `receive_message`, `happens_before`, `is_concurrent` |
| `multithreads-example.py` | Lima thread yang menjalankan tugas I/O-bound secara konkuren |

## Menjalankan

```bash
python vclocks.py
python multithreads-example.py
```

**Keluaran yang diharapkan dari `vclocks.py`** (3 proses, urutan simulasi pada skrip):

```text
P0: [2, 0, 0]
P1: [2, 2, 0]
P2: [2, 2, 2]

VC0 happens before VC1: True
VC1 happens before VC0: False
VC0 is concurrent with VC2: False
```

`VC0 is concurrent with VC2` bernilai **False** karena P2 sudah menerima pesan dari P1 yang membawa nilai clock P0, sehingga kejadian P0 dapat diurutkan sebelum kejadian P2.

**Catatan `multithreads-example.py`:** lima thread masing-masing `sleep(5)` sehingga total waktu ± 5 detik, bukan 25 detik. Urutan baris "finished" bisa berbeda setiap eksekusi — contoh konkret eksekusi non-deterministik yang mendasari kebutuhan sinkronisasi.

## Tautan

- Materi: [03/README.md](../README.md)
- Daftar materi: [README.md](../../README.md)
