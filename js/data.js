/* =========================================================
   DATA PORTAL ADIWIYATA SMADA
   ---------------------------------------------------------
   Semua isi website diatur dari file ini. Anda cukup mengubah
   teks di bawah dan menaruh foto di folder assets/images/.
   Data bertanda [CONTOH] hanya contoh: ganti dengan data asli.
   ========================================================= */

const SITE = {
    nama: "SMAN 2 Madiun",
    singkatan: "SMADA",
    tagline: "Sekolah Prestasi",
    motto: "Widya Tinata Ambuka Budi",
    logo: "assets/images/logo/logo-sman2.png",
    logoCadangan: "https://smanegeri2madiun.sch.id/wp-content/uploads/2025/05/cropped-logo-pojok-scaled-1.png",
    alamat: "Jl. Biliton No. 24, Madiun Lor, Kecamatan Manguharjo, Kota Madiun, Jawa Timur 63122",
    telepon: "0351-453542",
    website: "smanegeri2madiun.sch.id",
    websiteUrl: "https://smanegeri2madiun.sch.id",
    email: "ISI_EMAIL_ADIWIYATA@gmail.com",          // <-- GANTI: tujuan pesan dari formulir
    instagram: "https://www.instagram.com/",          // <-- GANTI dengan link Instagram Adiwiyata SMADA
    tiktok: "https://www.tiktok.com/",                // <-- GANTI dengan link TikTok Adiwiyata SMADA
    youtube: "",                                      // opsional
    mapsEmbed: "https://maps.google.com/maps?q=SMAN%202%20Madiun&t=&z=15&ie=UTF8&iwloc=&output=embed"
};

/* Statistik di Beranda. Angka "jenis tanaman" otomatis dihitung dari daftar PLANTS
   kecuali Anda isi manual (ubah null menjadi angka, mis. 52). */
const STATS = {
    tanamanManual: null,
    anggotaPokja: "100+",     // [CONTOH]
    program: "10"             // [CONTOH]
};

/* ---------- Kegiatan terbaru (tampil 3 di Beranda) ---------- */
const KEGIATAN = [
    {
        judul: "Sosialisasi dan Pengukuhan Tim Adiwiyata",
        tanggal: "2026-06-04",
        kategori: "Adiwiyata",
        ringkas: "Sosialisasi program, pengukuhan Tim Adiwiyata, ikrar, dan penandatanganan komitmen bersama menuju Sekolah Adiwiyata.",
        foto: "assets/images/kegiatan/sosialisasi-adiwiyata.jpg"
    },
    {
        judul: "Jumat Bersih Lingkungan Sekolah",     // [CONTOH]
        tanggal: "2026-10-16",
        kategori: "Kebersihan",
        ringkas: "Seluruh kelas membersihkan area masing-masing dan memilah sampah organik dan anorganik.",
        foto: "assets/images/kegiatan/jumat-bersih.jpg"
    },
    {
        judul: "Penanaman Pohon dan Pendataan Tanaman",   // [CONTOH]
        tanggal: "2026-10-09",
        kategori: "Penghijauan",
        ringkas: "Siswa menanam dan mendata tanaman baru untuk Ensiklopedia Tanaman sekolah.",
        foto: "assets/images/kegiatan/penanaman.jpg"
    }
];

/* ---------- Tentang Adiwiyata ---------- */
const TENTANG = {
    apaItu: [
        "Adiwiyata adalah program pembinaan sekolah peduli dan berbudaya lingkungan hidup. Melalui program ini, sekolah mengajak seluruh warganya untuk menjaga kebersihan, menghemat sumber daya, dan merawat alam.",
        "Di SMAN 2 Madiun, Adiwiyata bukan sekadar mengejar predikat. Yang lebih penting adalah perubahan kebiasaan: apakah kita konsisten menjaga kebersihan, memilah sampah, dan merawat tanaman setiap hari.",
        "Pada 4 Juni 2026, SMAN 2 Madiun memperkuat komitmen menuju Sekolah Adiwiyata melalui sosialisasi program, pengukuhan Tim Adiwiyata, ikrar, dan penandatanganan komitmen bersama."
    ],
    fotoUtama: "assets/images/tentang/sosialisasi.jpg",
    fotoCaption: "Sosialisasi bersama guru dan siswa",
    visi: "Terwujudnya warga sekolah yang peduli, berbudaya, dan bertindak nyata menjaga lingkungan hidup demi sekolah yang bersih, sehat, dan lestari.",   // [CONTOH] sesuaikan dengan visi lingkungan resmi sekolah
    misi: [                                                              // [CONTOH]
        "Menumbuhkan kesadaran lingkungan pada seluruh warga sekolah.",
        "Mewujudkan lingkungan sekolah yang bersih, sehat, dan hijau.",
        "Mengintegrasikan nilai lingkungan dalam pembelajaran.",
        "Mengelola sampah, air, dan energi secara bijak.",
        "Menjalin kerja sama dengan masyarakat dan mitra peduli lingkungan."
    ],
    fokus: [
        { judul: "Lingkungan Bersih", teks: "Membangun lingkungan sekolah yang bersih dan tertata." },
        { judul: "Lingkungan Sehat", teks: "Menciptakan lingkungan yang mendukung kesehatan warga sekolah." },
        { judul: "Kesadaran Lingkungan", teks: "Menumbuhkan kesadaran bahwa menjaga lingkungan adalah tanggung jawab bersama." },
        { judul: "Budaya Berkelanjutan", teks: "Menjadikan kepedulian lingkungan kebiasaan yang konsisten." }
    ],
    // Garis waktu. Tambah / ubah sesuai perjalanan sekolah.
    timeline: [
        { waktu: "1 September 1953", judul: "SMAN 2 Madiun berdiri", teks: "Sekolah mulai berdiri dan terus berkembang di Kota Madiun." },
        { waktu: "[ISI TAHUN]", judul: "Mulai menggagas program lingkungan", teks: "[CONTOH] Tuliskan awal kegiatan lingkungan di SMADA, misalnya Jumat Bersih atau bank sampah." },
        { waktu: "4 Juni 2026", judul: "Sosialisasi dan pengukuhan Tim Adiwiyata", teks: "Sosialisasi program, pengukuhan Tim Adiwiyata, ikrar, dan penandatanganan komitmen bersama." },
        { waktu: "[ISI TANGGAL]", judul: "Pencapaian terkini", teks: "[CONTOH] Tuliskan penilaian atau penghargaan Adiwiyata yang sudah diraih." }
    ]
};

/* ---------- Pokja Adiwiyata ---------- */
const POKJA = {
    pembina: { nama: "[ISI NAMA]", jabatan: "Kepala Sekolah / Guru Pembina", foto: "assets/images/pokja/pembina.jpg" },
    ketua:   { nama: "[ISI NAMA]", jabatan: "Ketua Pokja (Siswa)", foto: "assets/images/pokja/ketua.jpg" },
    divisi: [
        {
            nama: "Divisi Penghijauan",
            deskripsi: "Menanam, merawat, dan mendata tanaman sekolah.",
            anggota: [   // [CONTOH] ganti nama dan foto
                { nama: "[Nama Anggota 1]", peran: "Koordinator", foto: "assets/images/pokja/penghijauan-1.jpg" },
                { nama: "[Nama Anggota 2]", peran: "Anggota", foto: "assets/images/pokja/penghijauan-2.jpg" },
                { nama: "[Nama Anggota 3]", peran: "Anggota", foto: "assets/images/pokja/penghijauan-3.jpg" }
            ]
        },
        {
            nama: "Divisi Pengelolaan Sampah",
            deskripsi: "Memilah sampah, kompos, dan daur ulang.",
            anggota: [
                { nama: "[Nama Anggota 1]", peran: "Koordinator", foto: "assets/images/pokja/sampah-1.jpg" },
                { nama: "[Nama Anggota 2]", peran: "Anggota", foto: "assets/images/pokja/sampah-2.jpg" },
                { nama: "[Nama Anggota 3]", peran: "Anggota", foto: "assets/images/pokja/sampah-3.jpg" }
            ]
        },
        {
            nama: "Divisi Kampanye",
            deskripsi: "Mengajak warga sekolah lewat media sosial, poster, dan lomba.",
            anggota: [
                { nama: "[Nama Anggota 1]", peran: "Koordinator", foto: "assets/images/pokja/kampanye-1.jpg" },
                { nama: "[Nama Anggota 2]", peran: "Anggota", foto: "assets/images/pokja/kampanye-2.jpg" },
                { nama: "[Nama Anggota 3]", peran: "Anggota", foto: "assets/images/pokja/kampanye-3.jpg" }
            ]
        }
    ]
};

/* ---------- Ensiklopedia Tanaman ----------
   id      : unik, huruf kecil tanpa spasi (dipakai di link / QR Code)
   foto    : taruh file di assets/images/tanaman/ lalu tulis namanya di sini
   Tambah tanaman baru dengan menyalin satu blok { ... }, di akhir daftar. */
const PLANTS = [
    {
        id: "lidah-buaya", nama: "Lidah Buaya", latin: "Aloe vera",
        tanggalTanam: "2026-03-16", penanam: "Kelas X.A",
        lokasi: "Taman Depan", manfaat: "Tanaman obat; gel untuk perawatan kulit dan luka bakar ringan.",
        foto: "assets/images/tanaman/lidah-buaya.jpg"
    },
    {
        id: "pucuk-merah", nama: "Pucuk Merah", latin: "Syzygium myrtifolium",
        tanggalTanam: "2026-03-16", penanam: "Kelas X.B",
        lokasi: "Taman Depan", manfaat: "Peneduh, pagar hidup, dan tanaman hias.",
        foto: "assets/images/tanaman/pucuk-merah.jpg"
    },
    {
        id: "lidah-mertua", nama: "Lidah Mertua", latin: "Dracaena trifasciata",
        tanggalTanam: "2026-03-23", penanam: "Kelas X.C",
        lokasi: "Selasar Kelas", manfaat: "Tanaman hias dan penghijauan ruang; membantu memperbaiki kualitas udara dalam ruangan.",
        foto: "assets/images/tanaman/lidah-mertua.jpg"
    },
    {
        id: "mangga", nama: "Mangga", latin: "Mangifera indica",
        tanggalTanam: "2026-01-12", penanam: "Angkatan 2025",
        lokasi: "Kebun Belakang", manfaat: "Peneduh dan tanaman buah.",
        foto: "assets/images/tanaman/mangga.jpg"
    },
    {
        id: "ketapang-kencana", nama: "Ketapang Kencana", latin: "Terminalia mantaly",
        tanggalTanam: "2026-01-12", penanam: "Pak/Bu [Nama Guru]",
        lokasi: "Lapangan", manfaat: "Peneduh area terbuka.",
        foto: "assets/images/tanaman/ketapang-kencana.jpg"
    },
    {
        id: "hanjuang", nama: "Hanjuang", latin: "Cordyline fruticosa",
        tanggalTanam: "2026-02-02", penanam: "Kelas XI.A",
        lokasi: "Taman Depan", manfaat: "Tanaman hias dan pembatas taman.",
        foto: "assets/images/tanaman/hanjuang.jpg"
    }
    // ,{ id: "contoh-baru", nama: "...", latin: "...", tanggalTanam: "YYYY-MM-DD", penanam: "...", lokasi: "...", manfaat: "...", foto: "assets/images/tanaman/nama-file.jpg" }
];

/* Pilihan lokasi pada filter */
const LOKASI = ["Taman Depan", "Selasar Kelas", "Kebun Belakang", "Lapangan"];

/* ---------- Galeri Foto ---------- */
const GALERI = [
    { judul: "Sosialisasi Adiwiyata", tanggal: "2026-06-04", foto: "assets/images/galeri/galeri-01.jpg" },
    { judul: "Jumat Bersih", tanggal: "2026-10-16", foto: "assets/images/galeri/galeri-02.jpg" },
    { judul: "Penanaman Pohon", tanggal: "2026-10-09", foto: "assets/images/galeri/galeri-03.jpg" },
    { judul: "Pemilahan Sampah", tanggal: "[ISI TANGGAL]", foto: "assets/images/galeri/galeri-04.jpg" },
    { judul: "Panen Kompos", tanggal: "[ISI TANGGAL]", foto: "assets/images/galeri/galeri-05.jpg" },
    { judul: "Lomba Lingkungan", tanggal: "[ISI TANGGAL]", foto: "assets/images/galeri/galeri-06.jpg" }
];

/* ---------- Artikel edukasi (karya siswa) ---------- */
const ARTIKEL = [
    {
        judul: "Cara Membedakan Sampah Organik dan Anorganik di Kelas",
        penulis: "[Nama Siswa]", tanggal: "2026-10-12",
        isi: [
            "Sampah organik berasal dari bahan alami yang mudah membusuk, misalnya sisa makanan, daun, dan kertas tisu. Sampah anorganik sulit terurai, misalnya botol plastik, kemasan makanan ringan, dan kaleng.",
            "Di kelas, sediakan dua tempat sampah dengan label berbeda. Biasakan membuang sisa makanan ke tempat organik dan kemasan ke tempat anorganik. Kebiasaan kecil ini mempermudah pengelolaan sampah sekolah."
        ]
    },
    {
        judul: "Manfaat Tanaman Hias di Lingkungan Sekolah",   // [CONTOH]
        penulis: "[Nama Siswa]", tanggal: "2026-10-05",
        isi: [
            "Tanaman membuat suasana belajar lebih teduh dan nyaman. Tanaman juga membantu menyejukkan area sekitar dan menambah keindahan sekolah.",
            "Merawat tanaman mengajarkan tanggung jawab: menyiram, membersihkan daun kering, dan mengamati pertumbuhannya."
        ]
    }
];
