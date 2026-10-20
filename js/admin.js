(function () {
    "use strict";

    const STORAGE_PREFIX = "adiwiyata-admin-";
    const CATEGORIES = ["kegiatan", "artikel", "berita", "galeri", "tanaman"];
    const FS_API_AVAILABLE = typeof window.showDirectoryPicker === "function";

    const FIELDS = {
        kegiatan: ["judul", "tanggal", "kategori", "ringkas", "foto"],
        artikel: ["judul", "penulis", "tanggal", "isi", "foto"],
        berita: ["judul", "tanggal", "kategori", "ringkas", "foto"],
        galeri: ["judul", "tanggal", "foto"],
        tanaman: ["nama", "latin", "tanggalTanam", "penanam", "lokasi", "manfaat", "foto"]
    };

    const TITLE_FIELD = {
        kegiatan: "judul",
        artikel: "judul",
        berita: "judul",
        galeri: "judul",
        tanaman: "nama"
    };

    const SUB_FIELDS = {
        kegiatan: ["tanggal", "kategori"],
        artikel: ["tanggal", "penulis"],
        berita: ["tanggal", "kategori"],
        galeri: ["tanggal"],
        tanaman: ["tanggalTanam", "lokasi"]
    };

    const ARRAY_FIELDS = { artikel: ["isi"] };

    const lastAuto = {};
    const pendingImages = {};
    let dirHandle = null;
    let statusBase = "Folder proyek belum terhubung. Klik Hubungkan Folder untuk menulis otomatis.";

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const esc = (s) => String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    function slugify(str) {
        return String(str || "").toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "item";
    }

    function isArrayField(cat, field) {
        return (ARRAY_FIELDS[cat] || []).indexOf(field) >= 0;
    }

    function toArrayFieldValue(raw) {
        return String(raw || "").split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    }

    function fromArrayFieldValue(val) {
        if (Array.isArray(val)) return val.join("\n\n");
        return String(val || "");
    }

    function getValue(form, name) {
        const el = $('[data-field="' + name + '"]', form);
        return el ? el.value.trim() : "";
    }

    function load(cat) {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + cat);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    function save(cat, arr) {
        localStorage.setItem(STORAGE_PREFIX + cat, JSON.stringify(arr));
    }

    function getForm(cat) { return $("#form-" + cat); }
    function getField(form, name) { return $('[data-field="' + name + '"]', form); }

    function readFieldValue(form, cat, field) {
        const el = getField(form, field);
        const raw = el ? el.value.trim() : "";
        return isArrayField(cat, field) ? toArrayFieldValue(raw) : raw;
    }

    function writeFieldValue(form, cat, field, val) {
        const el = getField(form, field);
        if (!el) return;
        el.value = isArrayField(cat, field) ? fromArrayFieldValue(val) : (val == null ? "" : val);
    }

    function setStatus(msg) {
        statusBase = msg;
        const el = $("#sync-status");
        if (el) { el.textContent = msg; el.style.color = ""; }
    }

    function flashStatus(msg, isError) {
        const el = $("#sync-status");
        if (!el) return;
        el.textContent = msg;
        el.style.color = isError ? "#ff9d8f" : "#b8e3c2";
        setTimeout(function () {
            el.textContent = statusBase;
            el.style.color = "";
        }, 3500);
    }

    const IDB_NAME = "adiwiyata-fs";
    const IDB_STORE = "handles";

    function openIDB() {
        return new Promise(function (resolve, reject) {
            const req = indexedDB.open(IDB_NAME, 1);
            req.onupgradeneeded = function () { req.result.createObjectStore(IDB_STORE); };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function idbPut(key, val) {
        return openIDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, "readwrite");
                tx.objectStore(IDB_STORE).put(val, key);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function idbGet(key) {
        return openIDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, "readonly");
                const req = tx.objectStore(IDB_STORE).get(key);
                req.onsuccess = function () { resolve(req.result || null); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function idbDel(key) {
        return openIDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, "readwrite");
                tx.objectStore(IDB_STORE).delete(key);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    async function getOrCreateDir(root, path) {
        const parts = String(path || "").split("/").filter(Boolean);
        let dir = root;
        for (let i = 0; i < parts.length; i++) {
            dir = await dir.getDirectoryHandle(parts[i], { create: true });
        }
        return dir;
    }

    async function writeTextFile(path, content) {
        const parts = path.split("/");
        const filename = parts.pop();
        const dir = await getOrCreateDir(dirHandle, parts.join("/"));
        const file = await dir.getFileHandle(filename, { create: true });
        const w = await file.createWritable();
        await w.write(content);
        await w.close();
    }

    async function writeBinaryFile(path, buffer, mime) {
        const parts = path.split("/");
        const filename = parts.pop();
        const dir = await getOrCreateDir(dirHandle, parts.join("/"));
        const file = await dir.getFileHandle(filename, { create: true });
        const w = await file.createWritable();
        const blob = buffer instanceof Blob ? buffer : new Blob([buffer], { type: mime || "application/octet-stream" });
        await w.write(blob);
        await w.close();
        const check = await file.getFile();
        if (!check || check.size === 0) {
            throw new Error("File gambar tertulis 0 byte: " + path);
        }
        return check.size;
    }

    async function deleteFile(path) {
        if (!dirHandle || !path) return;
        const parts = path.split("/");
        const filename = parts.pop();
        try {
            const dir = await getOrCreateDir(dirHandle, parts.join("/"));
            await dir.removeEntry(filename);
        } catch (e) {}
    }

    async function updateIndexFile(cat) {
        if (!dirHandle) return;
        try {
            const dataDir = await dirHandle.getDirectoryHandle("data");
            const catDir = await dataDir.getDirectoryHandle(cat);
            const ids = [];
            for await (const entry of catDir.values()) {
                if (entry.kind === "file" && entry.name.endsWith(".json") && !entry.name.startsWith("_")) {
                    ids.push(entry.name.replace(/\.json$/, ""));
                }
            }
            await writeTextFile("data/" + cat + "/_index.json", JSON.stringify(ids, null, 2));
        } catch (e) {
            const ids = load(cat).map(x => x.id);
            await writeTextFile("data/" + cat + "/_index.json", JSON.stringify(ids, null, 2));
        }
    }

    async function writeEntryToFolder(cat, obj, pending) {
        const jsonPath = "data/" + cat + "/" + obj.id + ".json";
        await writeTextFile(jsonPath, JSON.stringify(obj, null, 2));
        let imgSize = 0;
        if (pending && pending.buffer && obj.foto) {
            imgSize = await writeBinaryFile(obj.foto, pending.buffer, pending.type);
        }
        await updateIndexFile(cat);
        return { jsonPath: jsonPath, imgPath: imgSize ? obj.foto : null, imgSize: imgSize };
    }

    async function deleteEntryFromFolder(cat, item) {
        if (!dirHandle || !item) return;
        try {
            const dataDir = await dirHandle.getDirectoryHandle("data");
            const catDir = await dataDir.getDirectoryHandle(cat);
            await catDir.removeEntry(item.id + ".json");
        } catch (e) {}
        await deleteFile(item.foto);
        await updateIndexFile(cat);
    }

    async function hasDir(root, name) {
        try { await root.getDirectoryHandle(name); return true; }
        catch (e) { return false; }
    }

    function setConnected(connected) {
        const btn = $("#btn-connect");
        const importBtn = $("#btn-import-folder");
        const syncBtn = $("#btn-sync-all");
        if (connected) {
            setStatus("Folder proyek terhubung. Setiap Simpan otomatis menulis JSON ke data/ dan gambar ke assets/images/.");
            if (btn) btn.textContent = "Putuskan Folder";
            if (importBtn) importBtn.disabled = false;
            if (syncBtn) syncBtn.disabled = false;
        } else {
            setStatus("Folder proyek belum terhubung. Klik Hubungkan Folder untuk menulis otomatis.");
            if (btn) btn.textContent = "Hubungkan Folder";
            if (importBtn) importBtn.disabled = true;
            if (syncBtn) syncBtn.disabled = true;
        }
    }

    async function connectFolder() {
        if (!FS_API_AVAILABLE) {
            alert("Browser ini tidak mendukung File System Access API. Gunakan Chrome atau Edge terbaru, atau unduh file JSON secara manual.");
            return;
        }
        try {
            let handle = await idbGet("root");
            if (handle) {
                const perm = await handle.requestPermission({ mode: "readwrite" });
                if (perm === "granted") {
                    dirHandle = handle;
                    setConnected(true);
                    return;
                }
            }
            handle = await window.showDirectoryPicker({ mode: "readwrite" });
            const hasData = await hasDir(handle, "data");
            const hasAssets = await hasDir(handle, "assets");
            if (!hasData || !hasAssets) {
                alert("Folder yang dipilih bukan folder proyek adiwiyata-smada-3 (harus berisi subfolder 'data' dan 'assets').");
                return;
            }
            await idbPut("root", handle);
            dirHandle = handle;
            setConnected(true);
        } catch (err) {
            if (err && err.name !== "AbortError") {
                alert("Gagal menghubungkan folder: " + err.message);
            }
        }
    }

    async function disconnectFolder() {
        dirHandle = null;
        try { await idbDel("root"); } catch (e) {}
        setConnected(false);
    }

    async function initDir() {
        if (!FS_API_AVAILABLE) {
            setStatus("Browser ini tidak mendukung tulis langsung ke folder. Anda dapat memakai tombol unduh manual.");
            const btn = $("#btn-connect");
            if (btn) btn.disabled = true;
            return;
        }
        try {
            const handle = await idbGet("root");
            if (!handle) { setConnected(false); return; }
            const perm = await handle.queryPermission({ mode: "readwrite" });
            if (perm === "granted") {
                dirHandle = handle;
                setConnected(true);
            } else {
                setStatus("Folder tersimpan. Klik Hubungkan Folder untuk memberi izin ulang.");
            }
        } catch (e) {
            setConnected(false);
        }
    }

    async function importFromFolder() {
        if (!dirHandle) return;
        if (!confirm("Impor data dari folder proyek ke browser? Data browser saat ini untuk semua kategori akan diganti.")) return;
        let count = 0;
        for (const cat of CATEGORIES) {
            const items = [];
            try {
                const dataDir = await dirHandle.getDirectoryHandle("data");
                const catDir = await dataDir.getDirectoryHandle(cat);
                for await (const entry of catDir.values()) {
                    if (entry.kind !== "file" || !entry.name.endsWith(".json") || entry.name.startsWith("_")) continue;
                    try {
                        const file = await entry.getFile();
                        const text = await file.text();
                        const obj = JSON.parse(text);
                        if (obj && obj.id) { items.push(obj); count++; }
                    } catch (e) {}
                }
            } catch (e) {}
            save(cat, items);
        }
        CATEGORIES.forEach(c => { clearForm(c); renderList(c); });
        flashStatus("Impor dari folder selesai. " + count + " item dibaca.");
    }

    async function syncAll() {
        if (!dirHandle) return;
        if (!confirm("Tulis semua data dari browser ke folder proyek? File di folder dengan nama sama akan ditimpa.")) return;

        let written = 0, failed = 0;
        for (const cat of CATEGORIES) {
            const arr = load(cat);
            for (const obj of arr) {
                const pending = pendingImages[cat];
                const usePending = pending && pending.id === obj.id ? pending : null;
                try {
                    if (usePending) {
                        obj.foto = "assets/images/" + cat + "/" + obj.id + "." + usePending.ext;
                    }
                    await writeEntryToFolder(cat, obj, usePending);
                    written++;
                } catch (err) {
                    failed++;
                    console.error("[sync]", cat, obj.id, err);
                }
            }
            try { await updateIndexFile(cat); } catch (e) {}
        }
        flashStatus("Sinkron selesai. " + written + " file ditulis, " + failed + " gagal.", failed > 0);
    }

    function clearForm(cat) {
        const form = getForm(cat);
        if (!form) return;
        form.reset();
        lastAuto[cat] = "";
        delete pendingImages[cat];
        const prev = $("[data-preview]", form);
        if (prev) prev.innerHTML = "";
        const titleEl = $("#" + cat + "-form-title");
        if (titleEl) titleEl.textContent = "Tambah " + capitalize(cat);
    }

    function fillForm(cat, entry) {
        const form = getForm(cat);
        if (!form) return;
        form.reset();
        delete pendingImages[cat];
        FIELDS[cat].forEach(f => writeFieldValue(form, cat, f, entry[f]));
        writeFieldValue(form, cat, "__original", entry.id);
        writeFieldValue(form, cat, "id", entry.id);
        lastAuto[cat] = entry.id;
        const prev = $("[data-preview]", form);
        if (prev) prev.innerHTML = entry.foto
            ? '<div class="ph"><img src="' + esc(entry.foto) + '" alt="" onerror="this.remove()"></div>'
            : "";
        const titleEl = $("#" + cat + "-form-title");
        if (titleEl) titleEl.textContent = "Edit: " + (entry[TITLE_FIELD[cat]] || entry.id);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function collectForm(cat) {
        const form = getForm(cat);
        const obj = {};
        FIELDS[cat].forEach(f => { obj[f] = readFieldValue(form, cat, f); });
        const idEl = getField(form, "id");
        obj.id = (idEl ? idEl.value.trim() : "") || slugify(obj[TITLE_FIELD[cat]] || "item");
        return obj;
    }

    function renderList(cat) {
        const list = $('[data-panel="' + cat + '"] [data-list]');
        if (!list) return;
        const arr = load(cat);
        const countEl = $('[data-panel="' + cat + '"] [data-count]');
        if (countEl) countEl.textContent = arr.length;

        const jsonPre = $('[data-panel="' + cat + '"] [data-json]');
        if (jsonPre) jsonPre.textContent = JSON.stringify(arr, null, 2);

        if (!arr.length) {
            list.innerHTML = '<div class="empty-state">Belum ada data ' + esc(cat) + '.</div>';
            return;
        }

        list.innerHTML = arr.map(e => {
            const title = e[TITLE_FIELD[cat]] || "(tanpa judul)";
            const sub = (SUB_FIELDS[cat] || []).map(f => e[f]).filter(Boolean).join(" · ");
            const thumb = e.foto
                ? '<div class="thumb"><img src="' + esc(e.foto) + '" alt="" onerror="this.remove()"></div>'
                : '<div class="thumb empty">?</div>';
            return '<div class="entry" data-id="' + esc(e.id) + '">' +
                thumb +
                '<div class="entry-body">' +
                    '<strong>' + esc(title) + '</strong>' +
                    '<span>' + esc(sub) + '</span>' +
                    '<code>' + esc(e.id) + '.json</code>' +
                '</div>' +
                '<div class="entry-actions">' +
                    '<button type="button" class="btn btn-mini" data-edit="' + esc(e.id) + '">Edit</button>' +
                    '<button type="button" class="btn btn-mini" data-download="' + esc(e.id) + '">⤓</button>' +
                    '<button type="button" class="btn btn-mini btn-danger" data-delete="' + esc(e.id) + '">Hapus</button>' +
                '</div>' +
            '</div>';
        }).join("");
    }

    async function handleSubmit(cat, e) {
        e.preventDefault();
        const form = getForm(cat);
        const obj = collectForm(cat);
        const arr = load(cat);
        const originalEl = getField(form, "__original");
        const original = originalEl ? originalEl.value : "";
        const originalItem = original ? arr.find(x => x.id === original) : null;
        const oldFoto = originalItem ? originalItem.foto : "";

        const pending = pendingImages[cat];
        if (pending) {
            pending.id = obj.id;
            obj.foto = "assets/images/" + cat + "/" + obj.id + "." + pending.ext;
        }

        if (original) {
            const idx = arr.findIndex(x => x.id === original);
            if (idx < 0) {
                let base = obj.id, n = 2;
                while (arr.some(x => x.id === obj.id)) obj.id = base + "-" + (n++);
                arr.push(obj);
            } else {
                if (obj.id !== original && arr.some(x => x.id === obj.id)) {
                    alert('Nama file "' + obj.id + '" sudah dipakai. Ubah dulu.');
                    return;
                }
                arr[idx] = obj;
            }
        } else {
            let base = obj.id, n = 2;
            while (arr.some(x => x.id === obj.id)) obj.id = base + "-" + (n++);
            arr.push(obj);
        }

        save(cat, arr);

        if (dirHandle) {
            try {
                if (original && original !== obj.id) {
                    try {
                        const dataDir = await dirHandle.getDirectoryHandle("data");
                        const catDir = await dataDir.getDirectoryHandle(cat);
                        await catDir.removeEntry(original + ".json");
                    } catch (e) {}
                }
                if (oldFoto && oldFoto !== obj.foto) {
                    await deleteFile(oldFoto);
                }
                const result = await writeEntryToFolder(cat, obj, pending);
                const parts = ["JSON: " + result.jsonPath];
                if (result.imgPath) parts.push("Gambar: " + result.imgPath + " (" + Math.round(result.imgSize / 1024) + " KB)");
                flashStatus("Tersimpan. " + parts.join(" | "));
            } catch (err) {
                console.error("[write]", err);
                flashStatus("Gagal menulis ke folder: " + err.message + ". Data tetap di browser.", true);
            }
        } else if (pending) {
            flashStatus("Data tersimpan di browser. Gambar belum ditulis karena folder belum dihubungkan.");
        }

        delete pendingImages[cat];
        clearForm(cat);
        renderList(cat);
    }

    function handleDelete(cat, id) {
        if (!confirm('Hapus data "' + id + '.json"?')) return;
        const arr = load(cat);
        const deleted = arr.find(x => x.id === id);
        const next = arr.filter(x => x.id !== id);
        save(cat, next);
        if (dirHandle && deleted) {
            deleteEntryFromFolder(cat, deleted).catch(err => console.error("[delete]", err));
        }
        renderList(cat);
    }

    function downloadFile(filename, content, type) {
        const blob = new Blob([content], { type: type || "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadItem(cat, id) {
        const arr = load(cat);
        const item = arr.find(x => x.id === id);
        if (!item) return;
        downloadFile(id + ".json", JSON.stringify(item, null, 2));
    }

    function downloadIndex(cat) {
        const ids = load(cat).map(x => x.id);
        downloadFile("_index.json", JSON.stringify(ids, null, 2));
    }

    function importJson(cat, file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            try {
                const parsed = JSON.parse(ev.target.result);
                const arr = load(cat);
                const normalize = (x) => {
                    const obj = {};
                    FIELDS[cat].forEach(f => {
                        if (isArrayField(cat, f)) {
                            const v = x[f];
                            obj[f] = Array.isArray(v) ? v.map(p => String(p)).filter(Boolean) : toArrayFieldValue(v);
                        } else {
                            obj[f] = x[f] != null ? String(x[f]) : "";
                        }
                    });
                    obj.id = x.id ? slugify(x.id) : slugify(obj[TITLE_FIELD[cat]] || "item");
                    return obj;
                };

                if (Array.isArray(parsed)) {
                    if (!confirm("Impor " + parsed.length + " data ke " + cat + "? Data lama akan diganti.")) return;
                    save(cat, parsed.map(normalize));
                } else if (parsed && typeof parsed === "object") {
                    const item = normalize(parsed);
                    const idx = arr.findIndex(x => x.id === item.id);
                    if (idx >= 0) arr[idx] = item;
                    else arr.push(item);
                    save(cat, arr);
                } else {
                    throw new Error("Format bukan array atau objek JSON");
                }
                clearForm(cat);
                renderList(cat);
            } catch (err) {
                alert("Gagal impor: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    function setupUpload(cat) {
        const form = getForm(cat);
        if (!form) return;
        const fileInput = $("[data-upload]", form);
        const trigger = $("[data-trigger-upload]", form);
        const preview = $("[data-preview]", form);

        trigger.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", async () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;

            const idEl = getField(form, "id");
            const idNow = (idEl && idEl.value.trim()) || slugify(getValue(form, TITLE_FIELD[cat]) || "foto");
            const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
            const mime = file.type || ("image/" + (ext === "jpg" ? "jpeg" : ext));

            try {
                const buffer = await file.arrayBuffer();
                if (!buffer || buffer.byteLength === 0) {
                    alert("File gambar kosong atau tidak bisa dibaca.");
                    return;
                }
                pendingImages[cat] = { buffer: buffer, ext: ext, id: idNow, type: mime };

                const fotoEl = getField(form, "foto");
                if (fotoEl) fotoEl.value = "assets/images/" + cat + "/" + idNow + "." + ext;

                const blob = new Blob([buffer], { type: mime });
                const url = URL.createObjectURL(blob);
                preview.innerHTML = '<div class="ph"><img src="' + url + '" alt="Pratinjau" onload="URL.revokeObjectURL(this.src)"></div>';
                flashStatus("Gambar siap: " + Math.round(buffer.byteLength / 1024) + " KB, akan ditulis ke assets/images/" + cat + "/");
            } catch (err) {
                console.error("[upload]", err);
                alert("Gagal membaca gambar: " + err.message);
            }
        });
    }

    function setupAutoId(cat) {
        const form = getForm(cat);
        if (!form) return;
        const titleInput = getField(form, TITLE_FIELD[cat]);
        const idInput = getField(form, "id");
        if (!titleInput || !idInput) return;

        titleInput.addEventListener("input", () => {
            if (!idInput.value || idInput.value === lastAuto[cat]) {
                idInput.value = slugify(titleInput.value);
                lastAuto[cat] = idInput.value;
            }
            const pending = pendingImages[cat];
            const fotoEl = getField(form, "foto");
            if (pending && fotoEl && idInput.value) {
                pending.id = idInput.value;
                fotoEl.value = "assets/images/" + cat + "/" + idInput.value + "." + pending.ext;
            }
        });

        idInput.addEventListener("input", () => {
            lastAuto[cat] = "";
            const pending = pendingImages[cat];
            const fotoEl = getField(form, "foto");
            if (pending && fotoEl && idInput.value) {
                pending.id = idInput.value;
                fotoEl.value = "assets/images/" + cat + "/" + idInput.value + "." + pending.ext;
            }
        });
    }

    function setupCategory(cat) {
        const form = getForm(cat);
        if (!form) return;

        form.addEventListener("submit", (e) => handleSubmit(cat, e));

        const resetBtn = $("[data-reset]", form);
        if (resetBtn) resetBtn.addEventListener("click", () => clearForm(cat));

        const list = $('[data-panel="' + cat + '"] [data-list]');
        if (list) {
            list.addEventListener("click", (e) => {
                const editBtn = e.target.closest("[data-edit]");
                const delBtn = e.target.closest("[data-delete]");
                const downBtn = e.target.closest("[data-download]");
                if (editBtn) {
                    const entry = load(cat).find(x => x.id === editBtn.dataset.edit);
                    if (entry) fillForm(cat, entry);
                } else if (delBtn) {
                    handleDelete(cat, delBtn.dataset.delete);
                } else if (downBtn) {
                    downloadItem(cat, downBtn.dataset.download);
                }
            });
        }

        const exportIndexBtn = $('[data-panel="' + cat + '"] [data-export-index]');
        if (exportIndexBtn) exportIndexBtn.addEventListener("click", () => downloadIndex(cat));

        const importInput = $('[data-panel="' + cat + '"] [data-import]');
        if (importInput) {
            importInput.addEventListener("change", () => {
                const file = importInput.files && importInput.files[0];
                if (file) importJson(cat, file);
                importInput.value = "";
            });
        }

        setupAutoId(cat);
        setupUpload(cat);
        renderList(cat);
    }

    async function generateBundle() {
        const D = {};

        try {
            const r = await fetch("data/site/site.json", { cache: "no-store" });
            if (r.ok) D.site = await r.json();
        } catch (e) {}
        try {
            const r = await fetch("data/tentang/tentang.json", { cache: "no-store" });
            if (r.ok) D.tentang = await r.json();
        } catch (e) {}
        try {
            const r = await fetch("data/pokja/pokja.json", { cache: "no-store" });
            if (r.ok) D.pokja = await r.json();
        } catch (e) {}

        CATEGORIES.forEach(c => { D[c] = load(c); });

        const missing = [];
        if (!D.site) missing.push("site");
        if (!D.tentang) missing.push("tentang");
        if (!D.pokja) missing.push("pokja");
        if (missing.length) {
            const ok = confirm(
                "Data berikut tidak bisa dibaca dari server: " + missing.join(", ") +
                ".\n\nBundle tetap dibuat, tetapi halaman yang butuh data itu akan menampilkan pesan error saat dibuka lewat file://.\n\n" +
                "Untuk bundle lengkap: jalankan admin lewat server (python -m http.server 8000), buka admin.html via localhost, lalu klik tombol ini.\n\nLanjutkan?"
            );
            if (!ok) return;
        }

        if (!D.site) D.site = { site: {}, stats: {} };
        if (!D.tentang) D.tentang = { apaItu: [], misi: [], fokus: [], timeline: [], fotoUtama: "", fotoCaption: "", visi: "" };
        if (!D.pokja) D.pokja = { pembina: { nama: "", jabatan: "", foto: "" }, ketua: { nama: "", jabatan: "", foto: "" }, divisi: [] };

        const js = "/* Bundle dibuat oleh admin.html */\nwindow.__ADIWIYATA_DATA__ = " + JSON.stringify(D, null, 2) + ";\n";
        downloadFile("data-bundle.js", js, "application/javascript");
    }

    function setupTabs() {
        $$(".tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const cat = tab.dataset.tab;
                $$(".tab").forEach(t => t.classList.toggle("active", t === tab));
                $$(".panel").forEach(p => { p.hidden = p.dataset.panel !== cat; });
            });
        });
    }

    function setupResetAll() {
        const btn = $("#btn-reset-all");
        if (!btn) return;
        btn.addEventListener("click", () => {
            if (!confirm("Hapus semua data admin dari browser? File di folder tidak akan terhapus.")) return;
            CATEGORIES.forEach(c => localStorage.removeItem(STORAGE_PREFIX + c));
            CATEGORIES.forEach(c => { clearForm(c); renderList(c); });
        });
    }

    function setupBundleBtn() {
        const btn = $("#btn-bundle");
        if (!btn) return;
        btn.addEventListener("click", () => { generateBundle(); });
    }

    function setupFolderButtons() {
        const connectBtn = $("#btn-connect");
        if (connectBtn) {
            connectBtn.addEventListener("click", async () => {
                if (dirHandle) await disconnectFolder();
                else await connectFolder();
            });
        }

        const importBtn = $("#btn-import-folder");
        if (importBtn) importBtn.addEventListener("click", importFromFolder);

        const syncBtn = $("#btn-sync-all");
        if (syncBtn) syncBtn.addEventListener("click", syncAll);
    }

    setupTabs();
    CATEGORIES.forEach(setupCategory);
    setupResetAll();
    setupBundleBtn();
    setupFolderButtons();
    initDir();
})();