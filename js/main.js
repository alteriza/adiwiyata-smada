/* =========================================================
   main.js - navbar, footer, dan pengisi konten dari data.js
   Biasanya tidak perlu diubah. Edit isi di js/data.js.
   ========================================================= */

(function () {
    "use strict";

    const $ = (sel, root) => (root || document).querySelector(sel);
    const page = document.body.dataset.page || "beranda";

    const esc = (s) => String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    function tgl(iso) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
        return m ? `${parseInt(m[3], 10)} ${BULAN[parseInt(m[2], 10) - 1]} ${m[1]}` : (iso || "");
    }
    const inisial = (nama) => String(nama).replace(/[\[\]]/g, "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";

    /* Gambar dengan placeholder: bila file belum ada, tampil kotak hijau + teks */
    function foto(src, alt, kelas) {
        return `<div class="ph ${kelas || ""}"><span class="ph-text">${esc(alt)}</span>` +
               `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.remove()"></div>`;
    }
    function avatar(src, nama) {
        return `<div class="avatar">${esc(inisial(nama))}<img src="${esc(src)}" alt="${esc(nama)}" onerror="this.remove()"></div>`;
    }

    /* ---------------- Navbar & Footer ---------------- */
    const MENU = [
        { id: "beranda", label: "Beranda", href: "index.html" },
        { id: "tentang", label: "Tentang", href: "tentang.html" },
        { id: "pokja", label: "Pokja", href: "pokja.html" },
        { id: "tanaman", label: "Data Tanaman", href: "tanaman.html" },
        { id: "galeri", label: "Galeri", href: "galeri.html" },
        { id: "kontak", label: "Kontak", href: "kontak.html" }
    ];
    const aktif = page === "tanaman-detail" ? "tanaman" : page;

    function renderNav() {
        const host = $("#site-header");
        if (!host) return;
        host.innerHTML = `
        <nav class="navbar">
            <a class="logo" href="index.html" aria-label="Beranda">
                <img src="${esc(SITE.logo)}" alt="Logo ${esc(SITE.nama)}"
                     onerror="this.onerror=null;this.src='${esc(SITE.logoCadangan)}'">
                <div class="logo-text">ADIWIYATA ${esc(SITE.singkatan)}<span>${esc(SITE.nama.toUpperCase())}</span></div>
            </a>
            <ul class="menu" id="site-menu">
                ${MENU.map(m => `<li><a href="${m.href}" class="${m.id === aktif ? "active" : ""}">${m.label}</a></li>`).join("")}
            </ul>
            <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu">Menu</button>
        </nav>`;
        const toggle = $(".menu-toggle", host), menu = $("#site-menu", host);
        toggle.addEventListener("click", () => {
            const open = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(open));
        });
        menu.addEventListener("click", (e) => {
            if (e.target.closest("a")) { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
        });
    }

    function renderFooter() {
        const host = $("#site-footer");
        if (!host) return;
        host.innerHTML = `
        <footer>
            <div class="footer-top">
                <div>
                    <strong>${esc(SITE.nama.toUpperCase())}</strong><br>
                    ${esc(SITE.motto)}
                    <p style="margin-top:10px;font-size:14px">${esc(SITE.alamat)}</p>
                </div>
                <div>
                    <h4>Menu</h4>
                    <ul>${MENU.map(m => `<li><a href="${m.href}">${m.label}</a></li>`).join("")}</ul>
                </div>
                <div>
                    <h4>Hubungi Kami</h4>
                    <ul>
                        <li>Telp. ${esc(SITE.telepon)}</li>
                        <li><a href="${esc(SITE.websiteUrl)}" target="_blank" rel="noopener">${esc(SITE.website)}</a></li>
                        <li><a href="${esc(SITE.instagram)}" target="_blank" rel="noopener">Instagram</a></li>
                        <li><a href="${esc(SITE.tiktok)}" target="_blank" rel="noopener">TikTok</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <div>© ${new Date().getFullYear()} ${esc(SITE.nama)} · Portal Adiwiyata</div>
                <div>Sekolah berkembang, lingkungan terjaga.</div>
            </div>
        </footer>`;
    }

    /* ---------------- Helper umum ---------------- */
    function jumlahTanaman() {
        return STATS.tanamanManual != null ? STATS.tanamanManual + "" : PLANTS.length + "";
    }

    /* Formulir statis: membuka aplikasi email dengan isi yang sudah terisi */
    function kirimEmail(subjek, baris) {
        const body = baris.map(([k, v]) => `${k}: ${v}`).join("\n");
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subjek)}&body=${encodeURIComponent(body)}`;
    }

    /* ---------------- Beranda ---------------- */
    function renderBeranda() {
        const stats = $("#stats");
        if (stats) {
            stats.innerHTML = [
                [jumlahTanaman() + "+", "Jenis Tanaman"],
                [STATS.anggotaPokja, "Anggota Pokja Aktif"],
                [STATS.program, "Program Lingkungan"]
            ].map(([n, l]) => `<div class="stat"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("");
        }
        const news = $("#news");
        if (news) {
            const urut = KEGIATAN.slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3);
            news.innerHTML = urut.map(k => `
                <article class="news-card reveal">
                    ${foto(k.foto, k.judul)}
                    <div class="news-body">
                        <span class="tag">${esc(k.kategori)}</span>
                        <h3>${esc(k.judul)}</h3>
                        <p>${esc(k.ringkas)}</p>
                        <time>${esc(tgl(k.tanggal))}</time>
                    </div>
                </article>`).join("");
        }
    }

    /* ---------------- Tentang ---------------- */
    function renderTentang() {
        const apa = $("#apa-itu");
        if (apa) apa.innerHTML = TENTANG.apaItu.map(p => `<p>${esc(p)}</p>`).join("");
        const fotoBox = $("#foto-tentang");
        if (fotoBox) fotoBox.innerHTML = foto(TENTANG.fotoUtama, TENTANG.fotoCaption) + `<figcaption>${esc(TENTANG.fotoCaption)}</figcaption>`;
        const visi = $("#visi-isi");
        if (visi) visi.textContent = TENTANG.visi;
        const misi = $("#misi-isi");
        if (misi) misi.innerHTML = TENTANG.misi.map(m => `<li>${esc(m)}</li>`).join("");
        const fokus = $("#fokus");
        if (fokus) fokus.innerHTML = TENTANG.fokus.map(f =>
            `<div class="focus-item reveal"><strong>${esc(f.judul)}</strong><p>${esc(f.teks)}</p></div>`).join("");
        const tl = $("#timeline");
        if (tl) tl.innerHTML = TENTANG.timeline.map(t =>
            `<div class="tl-item reveal"><time>${esc(t.waktu)}</time><h3>${esc(t.judul)}</h3><p>${esc(t.teks)}</p></div>`).join("");
    }

    /* ---------------- Pokja ---------------- */
    function renderPokja() {
        const org = $("#org");
        if (org) {
            org.innerHTML = `
                <div class="org-top">${avatar(POKJA.pembina.foto, POKJA.pembina.nama)}
                    <div><b>${esc(POKJA.pembina.nama)}</b><span>${esc(POKJA.pembina.jabatan)}</span></div></div>
                <div class="org-line"></div>
                <div class="org-top" style="background:var(--yellow-soft)">${avatar(POKJA.ketua.foto, POKJA.ketua.nama)}
                    <div><b>${esc(POKJA.ketua.nama)}</b><span>${esc(POKJA.ketua.jabatan)}</span></div></div>
                <div class="org-line"></div>
                <div class="org-bar"><i></i></div>
                <div class="divisi-row">
                    ${POKJA.divisi.map(d => `
                    <div class="divisi reveal">
                        <h3>${esc(d.nama)}</h3>
                        <p>${esc(d.deskripsi)}</p>
                        <div class="member-list">
                            ${d.anggota.map(a => `<div class="member">${avatar(a.foto, a.nama)}<div><b>${esc(a.nama)}</b><span>${esc(a.peran)}</span></div></div>`).join("")}
                        </div>
                    </div>`).join("")}
                </div>`;
        }
    }

    /* ---------------- Ensiklopedia Tanaman ---------------- */
    function kartuTanaman(p) {
        return `
        <article class="plant-card reveal">
            <a href="tanaman-detail.html?id=${encodeURIComponent(p.id)}">${foto(p.foto, p.nama)}</a>
            <div class="plant-info">
                <h3>${esc(p.nama)}</h3>
                <em>${esc(p.latin)}</em>
                <span class="meta">Ditanam: ${esc(tgl(p.tanggalTanam))}</span>
                <span class="meta">Penanam: ${esc(p.penanam)}</span>
                <span class="meta">Lokasi: ${esc(p.lokasi)}</span>
                <div class="plant-foot">
                    <a class="more" href="tanaman-detail.html?id=${encodeURIComponent(p.id)}">Lihat detail →</a>
                </div>
            </div>
        </article>`;
    }

    function renderTanaman() {
        const grid = $("#plant-grid");
        if (!grid) return;
        const cari = $("#cari"), filter = $("#filter-lokasi"), info = $("#result-info"), kosong = $("#empty");

        const daftarLokasi = Array.from(new Set(LOKASI.concat(PLANTS.map(p => p.lokasi))));
        filter.innerHTML = `<option value="">Semua lokasi</option>` + daftarLokasi.map(l => `<option>${esc(l)}</option>`).join("");

        function tampil() {
            const q = cari.value.trim().toLowerCase(), lok = filter.value;
            const hasil = PLANTS.filter(p =>
                (!lok || p.lokasi === lok) &&
                (!q || [p.nama, p.latin, p.penanam, p.manfaat, p.lokasi].join(" ").toLowerCase().includes(q)));
            grid.innerHTML = hasil.map(kartuTanaman).join("");
            kosong.style.display = hasil.length ? "none" : "block";
            info.textContent = `Menampilkan ${hasil.length} dari ${PLANTS.length} tanaman`;
            observeReveal();
        }
        cari.addEventListener("input", tampil);
        filter.addEventListener("change", tampil);
        tampil();
    }

    function renderDetail() {
        const box = $("#detail");
        if (!box) return;
        const id = new URLSearchParams(location.search).get("id");
        const p = PLANTS.find(x => x.id === id);
        if (!p) {
            box.innerHTML = `<div class="card" style="text-align:center"><h3>Tanaman tidak ditemukan</h3>
                <p style="margin:10px 0 18px;color:var(--muted)">Periksa kembali tautan atau QR Code.</p>
                <a class="btn btn-green" href="tanaman.html">Lihat semua tanaman</a></div>`;
            return;
        }
        document.title = `${p.nama} | Ensiklopedia Tanaman SMADA`;
        box.innerHTML = `
            <a class="back-link" href="tanaman.html">← Kembali ke Ensiklopedia</a>
            <div class="detail-layout">
                ${foto(p.foto, p.nama)}
                <div>
                    <span class="tag">${esc(p.lokasi)}</span>
                    <h2 style="font-size:clamp(28px,4vw,40px);color:var(--green-900);margin:10px 0 0">${esc(p.nama)}</h2>
                    <p style="color:var(--green-600);font-style:italic;font-size:18px">${esc(p.latin)}</p>
                    <table class="detail-table">
                        <tr><th>Nama lokal</th><td>${esc(p.nama)}</td></tr>
                        <tr><th>Nama latin</th><td><em>${esc(p.latin)}</em></td></tr>
                        <tr><th>Tanggal ditanam</th><td>${esc(tgl(p.tanggalTanam))}</td></tr>
                        <tr><th>Nama penanam</th><td>${esc(p.penanam)}</td></tr>
                        <tr><th>Lokasi tanam</th><td>${esc(p.lokasi)}</td></tr>
                        <tr><th>Manfaat</th><td>${esc(p.manfaat)}</td></tr>
                    </table>
                </div>
            </div>`;
    }

    /* ---------------- Galeri ---------------- */
    function renderGaleri() {
        const g = $("#gallery-grid");
        if (!g) return;
        g.innerHTML = GALERI.map((x, i) => `
            <div class="g-item reveal" data-i="${i}" tabindex="0" role="button" aria-label="Buka foto ${esc(x.judul)}">
                ${foto(x.foto, x.judul)}
                <div class="cap"><b>${esc(x.judul)}</b><span>${esc(tgl(x.tanggal))}</span></div>
            </div>`).join("");

        const lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap");
        function buka(i) {
            const x = GALERI[i];
            lbImg.src = x.foto; lbImg.alt = x.judul;
            lbImg.style.display = "";
            lbImg.onerror = () => { lbImg.style.display = "none"; };
            lbCap.textContent = x.judul + (x.tanggal ? " · " + tgl(x.tanggal) : "");
            lb.classList.add("open");
        }
        g.addEventListener("click", (e) => { const it = e.target.closest(".g-item"); if (it) buka(+it.dataset.i); });
        g.addEventListener("keydown", (e) => { if (e.key === "Enter") { const it = e.target.closest(".g-item"); if (it) buka(+it.dataset.i); } });
        lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "BUTTON") lb.classList.remove("open"); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });

        const art = $("#articles");
        art.innerHTML = ARTIKEL.map(a => `
            <details class="article">
                <summary>${esc(a.judul)}</summary>
                <div class="a-meta">Oleh ${esc(a.penulis)} · ${esc(tgl(a.tanggal))}</div>
                <div class="a-body">${a.isi.map(p => `<p>${esc(p)}</p>`).join("")}</div>
            </details>`).join("");

        document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === t));
            $("#tab-foto").style.display = t.dataset.tab === "foto" ? "" : "none";
            $("#tab-artikel").style.display = t.dataset.tab === "artikel" ? "" : "none";
        }));
        if (location.hash === "#artikel") document.querySelector('.tab[data-tab="artikel"]').click();
    }

    /* ---------------- Kontak ---------------- */
    function renderKontak() {
        const info = $("#kontak-info");
        if (!info) return;
        const sosial = [["Instagram", SITE.instagram], ["TikTok", SITE.tiktok], ["YouTube", SITE.youtube], ["Website Sekolah", SITE.websiteUrl]]
            .filter(s => s[1]);
        info.innerHTML = `
            <h3>Informasi Sekolah</h3>
            <div class="contact-item"><strong>Alamat</strong>${esc(SITE.alamat)}</div>
            <div class="contact-item"><strong>Telepon</strong>${esc(SITE.telepon)}</div>
            <div class="contact-item"><strong>Website</strong>${esc(SITE.website)}</div>
            <div class="socials">${sosial.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join("")}</div>`;
        const map = $("#peta");
        if (map) map.src = SITE.mapsEmbed;

        const form = $("#form-kontak");
        const jenisParam = new URLSearchParams(location.search).get("jenis");
        if (jenisParam) $("#jenis").value = jenisParam;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const f = new FormData(form);
            kirimEmail("[" + f.get("jenis") + "] Portal Adiwiyata SMADA", [
                ["Nama", f.get("nama")], ["Jenis pesan", f.get("jenis")], ["Pesan", f.get("pesan")]
            ]);
        });
    }

    /* ---------------- Animasi muncul ---------------- */
    let observer = null;
    function observeReveal() {
        const els = document.querySelectorAll(".reveal:not(.show)");
        if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
            els.forEach(el => el.classList.add("show")); return;
        }
        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("show"); observer.unobserve(en.target); } });
            }, { threshold: 0.1 });
        }
        els.forEach((el, i) => { el.style.setProperty("--d", (i % 4) * 90 + "ms"); observer.observe(el); });
    }

    /* ---------------- Jalankan ---------------- */
    renderNav();
    renderFooter();
    renderBeranda();
    renderTentang();
    renderPokja();
    renderTanaman();
    renderDetail();
    renderGaleri();
    renderKontak();
    document.querySelectorAll(".section-title, .shortcut, .card, .vm-card, .contact-box, .photo-frame, .g-item, .article").forEach(el => el.classList.add("reveal"));
    observeReveal();
})();
