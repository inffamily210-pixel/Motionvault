# MotionVault

Website preset Alight Motion & CapCut dengan video demo. Data preset disimpan di **Firebase Firestore** (jadi kelihatan oleh semua pengunjung, bukan cuma di browser admin sendiri), dan login admin pakai **Firebase Authentication**.

> **Catatan:** paket ini sudah diisi config Firebase dari project **motionvault-48b63** (project khusus, sudah kamu buat sendiri) dan aturan keamanannya sudah dikunci khusus untuk email **nezzstore081@gmail.com** sebagai admin. Kalau nanti ganti akun admin, ingat update di dua tempat: `firestore.rules` (di Firebase Console) dan `ADMIN_EMAILS` di dalam `index.html`.

Isi paket ini:
```
index.html        → seluruh website (HTML+CSS+JS jadi satu file, config Firebase sudah terisi)
api/youtube-import.js → backend kecil (Vercel Function) khusus buat fitur impor channel YouTube — lihat bagian 4 di bawah
firestore.rules   → aturan keamanan database, tinggal copy-paste ke Firebase Console
vercel.json       → konfigurasi kecil buat Vercel
README.md         → panduan ini
```

---

## 1. Setup di Firebase Console (project motionvault-48b63)

Project-nya sudah ada, tinggal aktifkan 3 hal ini:

1. Buka [console.firebase.google.com](https://console.firebase.google.com) → pilih project **motionvault-48b63**.
2. **Build → Firestore Database** → kalau belum ada, klik **Create database** → pilih lokasi (mis. `asia-southeast2`) → mode **Production**.
3. Buka tab **Rules** → hapus isinya → tempel isi file `firestore.rules` dari paket ini → **Publish**.
4. **Build → Authentication → Get started** (kalau belum) → aktifkan provider **Email/Password**.
5. Tab **Users** → klik **Add user** → daftarkan **nezzstore081@gmail.com** dengan password pilihan kamu. Ini akun buat login ke panel admin MotionVault.

Config Firebase (`apiKey`, `projectId`, dst.) di dalam `index.html` **sudah otomatis terisi**, jadi langkah "copy config" bisa dilewati.

## 2. Coba dulu di lokal (opsional)

Buka `index.html` langsung di browser, atau jalankan server lokal sederhana:
```
npx serve .
```
Klik tombol **Admin** di pojok (atau di footer) → login pakai **nezzstore081@gmail.com** + passwordnya → di tab **Data**, klik **"Muat 7 preset contoh"** buat isi awal, atau langsung tambah preset sendiri lewat tab **Tambah Baru**.

## 3. Deploy ke Vercel

**Cara termudah (drag & drop, tanpa install apa pun):**
1. Buka [vercel.com/new](https://vercel.com/new) → login/daftar.
2. Pilih **"Deploy"** lalu drag folder ini (atau upload file zip-nya, Vercel otomatis extract) ke halaman deploy.
3. Vercel otomatis mendeteksi ini sebagai static site — tinggal klik **Deploy**.

**Atau lewat Vercel CLI:**
```bash
npm i -g vercel
cd motionvault      # folder hasil extract zip ini
vercel --prod
```

Setelah deploy, situs kamu langsung online dengan domain `*.vercel.app` (bisa diganti custom domain lewat dashboard Vercel).

## 4. (Opsional) Aktifkan impor otomatis dari channel YouTube

Di form **Tambah Baru**, tab YouTube, ada tombol **"Punya banyak preset di 1 channel? Impor sekaligus dari sini"** tepat di bawah pilihan YouTube/TikTok/Link MP4 — tinggal ketuk, tempel link akun/channel-nya (boleh juga langsung tempel link channel di field URL video, nanti kedeteksi otomatis). Semua video channel itu jadi draft preset — judul, thumbnail, dan link download yang ketemu di deskripsi tiap video (Google Drive, Mediafire, file `.xml`, dll.) otomatis keisi. Nggak langsung tersimpan — tinggal dicek satu-satu di daftar, pilih mana yang mau diimpor, baru disimpan ke Firestore.

Fitur ini butuh file baru `api/youtube-import.js` (sudah ada di paket ini) plus satu **YouTube Data API v3 key** (beda dari config Firebase di atas, dan cuma dipakai di server, nggak pernah kekirim ke browser):

1. Buka [console.cloud.google.com](https://console.cloud.google.com) → bikin/pilih project → **APIs & Services → Library** → cari **YouTube Data API v3** → **Enable**.
2. **APIs & Services → Credentials → Create Credentials → API key** → salin key-nya.
3. Di **Vercel** → project kamu → **Settings → Environment Variables** → tambah:
   - Name: `YOUTUBE_API_KEY`
   - Value: (key dari langkah 2)
4. Redeploy project (push ulang / drag-drop zip ini lagi) biar env variable-nya kepakai.

Kalau langkah ini belum dilakuin, tombol impor channel bakal nunjukin pesan error yang jelas — sisa website tetap jalan normal seperti biasa.

Catatan:
- Maksimal 200 video terbaru per channel dalam satu kali impor (biar nggak timeout / boros quota). Channel yang videonya lebih dari itu, video lama di luar itu perlu ditambahin manual lewat form biasa.
- Link `@handle`, `/channel/ID`, dan `/user/nama` selalu akurat. Link `/c/NamaCustom` (format URL lama) di-resolve lewat pencarian nama channel — best-effort, bisa salah kalau ada beberapa channel dengan nama mirip.
- Video yang deskripsinya nggak ada link sama sekali otomatis nggak dicentang di daftar (biar nggak ke-import kosong tanpa sadar), tapi tetap bisa dicentang manual kalau kamu tau linknya ada di tempat lain (mis. komentar) — lengkapi link-nya lewat Edit setelah diimpor.

---

## Soal link download (Google Drive / Alight Creative, dll)

Waktu tambah/edit preset di panel admin, field **"Link download preset"** sekarang bisa diisi lebih dari satu:
- Klik **"+ Tambah link download"** buat nambah baris baru.
- Isi nama sumbernya (bebas — bisa ketik "Google Drive", "Alight Creative", atau nama lain) dan URL-nya.
- Kalau preset cuma punya 1 link → pengunjung klik download langsung dibawa ke link itu.
- Kalau ada 2 link atau lebih → muncul popup kecil buat pengunjung pilih mau download dari sumber mana.

## Kenapa login admin dikunci ke satu email tertentu?

Rule keamanan dikunci ke email `nezzstore081@gmail.com` di dua tempat (`firestore.rules` di server, dan `ADMIN_EMAILS` di dalam `index.html`) sebagai standar keamanan — bukan cuma mengecek "sudah login", tapi juga "login sebagai siapa". Kalau nanti mau nambah admin lain, tinggal tambahkan emailnya di kedua tempat itu.

Kalau lupa password admin, ganti lewat Firebase Console → Authentication → Users → klik akunnya → **Reset password**.

## Backup data

Di panel admin → tab **Data** → **"Ekspor ke JSON"** buat download semua data preset kapan saja. File ini juga bisa dipakai buat **impor** lagi (menimpa seluruh data) — misalnya kalau mau pindah ke project Firebase lain.

