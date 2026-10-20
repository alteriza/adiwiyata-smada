# Portal Adiwiyata SMADA (SMAN 2 Madiun)

Website statis (HTML, CSS, JavaScript) tanpa server atau database.
Buka `index.html` di browser untuk melihat hasilnya.

## Struktur folder

```
adiwiyata-smada/
├── index.html            Beranda
├── tentang.html          Tentang Adiwiyata (profil, visi misi, timeline)
├── pokja.html            Pokja Adiwiyata (struktur organisasi dan divisi)
├── tanaman.html          Ensiklopedia Tanaman (cari + filter)
├── tanaman-detail.html   Detail satu tanaman (tujuan QR Code)
├── galeri.html           Galeri foto dan artikel
├── kontak.html           Kontak dan saran
├── css/
│   └── style.css         Semua tampilan (warna, ukuran, layout)
├── js/
│   ├── data.js           ★ ISI KONTEN: edit file ini
│   └── main.js           Mesin website (biasanya tidak diubah)
└── assets/images/
    ├── fonts/            Poppins-Regular/Medium/SemiBold/Bold.ttf (opsional)
    ├── logo/             logo-sman2.png
    ├── hero/             hero.jpg (banner Beranda), komitmen.jpg
    ├── tentang/          sosialisasi.jpg
    ├── pokja/            pembina.jpg, ketua.jpg, penghijauan-1.jpg, dst.
    ├── tanaman/          satu foto per tanaman, mis. lidah-buaya.jpg
    ├── galeri/           galeri-01.jpg, galeri-02.jpg, dst.
    ├── kegiatan/         foto 3 kegiatan terbaru di Beranda
    └── artikel/          cadangan gambar untuk artikel
```

## Cara mengganti isi

1. Taruh foto di folder yang sesuai di `assets/images/`.
2. Buka `js/data.js`, ubah teks, nama file foto, atau tambah data.
3. Simpan, lalu muat ulang browser.

Jika foto belum ada, website menampilkan kotak hijau berisi keterangan, jadi tampilan tidak rusak.

### Menambah tanaman
Di `data.js`, salin satu blok `{ ... }` di dalam daftar `PLANTS`, ubah isinya, dan beri `id` unik (huruf kecil, tanpa spasi, mis. `"kamboja"`). Foto disimpan di `assets/images/tanaman/`.
Angka "Jenis Tanaman" di Beranda otomatis mengikuti jumlah tanaman.

### Menambah foto galeri
Tambah satu baris di daftar `GALERI`, lalu taruh fotonya di `assets/images/galeri/`.

## QR Code tanaman (dibuat terpisah)
Website tidak menampilkan gambar QR. QR dibuat dan dicetak terakhir, lalu ditempel di tanaman. Caranya:
1. Upload website ke hosting dan tentukan alamat finalnya.
2. Untuk tiap tanaman, buat QR statis dari URL: `https://ALAMAT-WEBSITE-KAMU/tanaman-detail.html?id=ID-TANAMAN`
   (ID-TANAMAN = nilai `id` di `js/data.js`, mis. `lidah-buaya`).
3. Cetak (tahan air), tempel di pot atau pohon, dan coba scan dulu.
Jangan mengubah `id` tanaman atau alamat website setelah QR dicetak, karena QR lama akan tidak berfungsi.

## Data yang masih contoh (WAJIB diganti)
Teks bertanda `[CONTOH]` atau `[ISI ...]` di `data.js` hanyalah contoh:
- Email tujuan formulir (`SITE.email`), link Instagram dan TikTok
- Nama Pembina, Ketua, dan anggota Pokja
- Visi dan misi lingkungan, timeline, dan pencapaian
- Data tanaman (tanggal tanam, penanam, lokasi) dan angka statistik
- Kegiatan, galeri, dan artikel

Data yang sudah berasal dari sumber sekolah: alamat, telepon, website, tahun berdiri (1 September 1953), dan kegiatan 4 Juni 2026.

## Formulir
Website ini statis, jadi tombol kirim pada formulir membuka aplikasi email di perangkat pengunjung dengan isi yang sudah terisi, dikirim ke `SITE.email`. Untuk pengiriman otomatis tanpa membuka email, gunakan layanan seperti Formspree atau Google Forms.

## Menayangkan online (gratis)
Upload seluruh folder ke Netlify Drop, GitHub Pages, atau Cloudflare Pages. Semua file harus tetap dalam susunan folder di atas.

## Font
Website memakai font Poppins dari folder `assets/fonts/` (bukan dari internet), supaya huruf tidak berubah-ubah saat halaman dimuat. Cara memasang ada di `assets/fonts/PETUNJUK.txt`. Tanpa file font tersebut, website memakai font bawaan perangkat dan tetap rapi.
