let SITE = {};
let STATS = {};
let TENTANG = {};
let POKJA = {};
let KEGIATAN = [];
let PLANTS = [];
let LOKASI = [];
let GALERI = [];
let ARTIKEL = [];

const DATA_ROOT = "data";

async function loadBundleScript() {
    if (window.__ADIWIYATA_DATA__) return;
    await new Promise(function (resolve) {
        const s = document.createElement("script");
        s.src = "js/data-bundle.js";
        s.onload = resolve;
        s.onerror = resolve;
        document.head.appendChild(s);
    });
}

function applyBundle(D) {
    SITE = (D.site && D.site.site) || {};
    STATS = (D.site && D.site.stats) || {};
    TENTANG = D.tentang || {};
    POKJA = D.pokja || {};
    KEGIATAN = (D.kegiatan || []).concat(D.berita || []);
    ARTIKEL = D.artikel || [];
    GALERI = D.galeri || [];
    PLANTS = D.tanaman || [];
    LOKASI = Array.from(new Set(PLANTS.map(function (p) { return p.lokasi; }).filter(Boolean)));
}

async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal memuat " + path + " (" + res.status + ")");
    return res.json();
}

async function discoverFiles(category) {
    const base = DATA_ROOT + "/" + category + "/";
    try {
        const res = await fetch(base, { cache: "no-store" });
        if (res.ok) {
            const html = await res.text();
            const seen = new Set();
            const regex = /href\s*=\s*"([^"]+\.json)"/gi;
            let m;
            while ((m = regex.exec(html)) !== null) {
                const name = decodeURIComponent(m[1].split("/").pop());
                if (name && !name.startsWith("_")) seen.add(name);
            }
            if (seen.size) return Array.from(seen);
        }
    } catch (e) {}
    try {
        const res = await fetch(base + "_index.json", { cache: "no-store" });
        if (res.ok) {
            const arr = await res.json();
            if (Array.isArray(arr) && arr.length) {
                return arr
                    .map(function (n) { return n.endsWith(".json") ? n : n + ".json"; })
                    .filter(function (n) { return !n.startsWith("_"); });
            }
        }
    } catch (e) {}
    return [];
}

async function loadCollection(category) {
    const files = await discoverFiles(category);
    if (!files.length) return [];
    const items = await Promise.all(files.map(function (f) {
        return fetchJson(DATA_ROOT + "/" + category + "/" + f).catch(function () { return null; });
    }));
    return items.filter(Boolean);
}

async function loadAllData() {
    if (location.protocol === "file:") {
        await loadBundleScript();
        const D = window.__ADIWIYATA_DATA__;
        if (!D) throw new Error("__FILE_MODE__");
        if (!D.site || !D.tentang || !D.pokja) throw new Error("__FILE_MODE_INCOMPLETE__");
        applyBundle(D);
        return;
    }

    const results = await Promise.all([
        fetchJson(DATA_ROOT + "/site/site.json"),
        fetchJson(DATA_ROOT + "/tentang/tentang.json"),
        fetchJson(DATA_ROOT + "/pokja/pokja.json"),
        loadCollection("kegiatan"),
        loadCollection("berita"),
        loadCollection("artikel"),
        loadCollection("galeri"),
        loadCollection("tanaman")
    ]);

    const site = results[0];
    const tentang = results[1];
    const pokja = results[2];
    const kegiatan = results[3];
    const berita = results[4];
    const artikel = results[5];
    const galeri = results[6];
    const tanaman = results[7];

    SITE = site.site;
    STATS = site.stats;
    TENTANG = tentang;
    POKJA = pokja;
    KEGIATAN = kegiatan.concat(berita);
    ARTIKEL = artikel;
    GALERI = galeri;
    PLANTS = tanaman;
    LOKASI = Array.from(new Set(PLANTS.map(function (p) { return p.lokasi; }).filter(Boolean)));
}