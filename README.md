# MotionVault

Website preset Alight Motion & CapCut dengan video demo. Data preset disimpan di **Firebase Firestore** (jadi kelihatan oleh semua pengunjung, bukan cuma di browser admin sendiri), dan login admin pakai **Firebase Authentication**.

> **Catatan:** paket ini sudah diisi config Firebase dari project **motionvault-48b63** (project khusus, sudah kamu buat sendiri) dan aturan keamanannya sudah dikunci khusus untuk email **nezzstore081@gmail.com** sebagai admin. Kalau nanti ganti akun admin, ingat update di dua tempat: `firestore.rules` (di Firebase Console) dan `ADMIN_EMAILS` di dalam `index.html`.

Isi paket ini:
```
index.html        → seluruh website (HTML+CSS+JS jadi satu file, config Firebase sudah terisi)
api/youtube-import.js → backend kecil (Vercel Function) khusus buat fitur impor channel YouTube — lihat bagian 4 di bawah
package.json       → penanda buat Vercel supaya folder api/ di-build jadi function beneran (bukan disajikan sebagai file statis)
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

## 5. Update: rating, laporan link rusak, mode gelap/terang

**⚠️ Wajib dilakukan:** `firestore.rules` di paket ini isinya berubah (nambah aturan buat koleksi baru `reports` dan sub-koleksi `ratings`, plus benerin bug lama soal hitungan unduhan). Ulangi langkah 3 di bagian 1 di atas — **Firebase Console → Firestore Database → Rules → hapus isi lama → tempel isi `firestore.rules` yang baru → Publish.** Tanpa ini, fitur rating & laporan di bawah nggak akan bisa nyimpen data (kena tolak sama rule lama).

Yang baru:
- **Mode gelap/terang** — tombol ikon matahari/bulan di pojok kanan atas, tersimpan otomatis per perangkat.
- **Rating bintang** — muncul di detail preset (pas video-nya dibuka), pengunjung bisa kasih 1–5 bintang sekali per preset per perangkat. Rata-rata dihitung otomatis dari semua rating yang masuk.
- **Laporkan link rusak** — tombol ikon bendera di sebelah tombol favorit/share di detail preset. Laporan masuk ke tab baru **"Laporan"** di panel admin, lengkap dengan daftar link preset itu waktu dilaporkan dan tombol "Tandai selesai".
- **Cegah dobel impor** — pas impor channel YouTube yang sama lagi, video yang link-nya udah ada di database otomatis dikasih label "Sudah pernah diimpor" dan nggak dicentang default.
- **Perbaikan:** hitungan "unduhan" di tiap preset sekarang beneran kesimpen ke database waktu pengunjung (bukan cuma admin) klik download — sebelumnya cuma nambah di layar orang yang klik, nggak pernah benar-benar tersimpan.

## 6. Update: Smart Search & Rekomendasi Preset

Nggak perlu update `firestore.rules` — dua fitur ini cuma nambah field baru di preset yang sudah ada, bukan koleksi baru.

Yang baru:
- **Smart Search** — tombol ikon slider di toolbar, buka modal pencarian lanjutan: nama preset, creator, kategori, effect, rasio video, FPS, resolution — semua kriteria bisa digabung sekaligus. Field Effect/Rasio video/FPS/Resolution baru ada di form Tambah/Edit Preset (semua opsional — preset lama tetap aman, cuma dianggap "belum diisi").
- **Preset Serupa** — otomatis muncul di bagian bawah tiap detail preset (di bawah rating), isinya preset lain yang mirip (kategori/creator/effect/tag yang sama). Section-nya sembunyi otomatis kalau memang nggak ada yang mirip.
- **Rekomendasi buat kamu** — shelf horizontal di atas daftar utama beranda. Kalau pengunjung sudah pernah nge-favorit sesuatu, isinya dipersonalisasi berdasarkan kategori/tag/creator/effect dari favoritnya. Belum ada favorit sama sekali → otomatis nampilin preset Unggulan & paling banyak diunduh dulu (label section-nya ganti jadi "🔥 Lagi Populer"). Section ini baru muncul kalau total preset di database lebih dari 6, biar nggak keliatan redundan sama daftar utama pas katalog masih dikit.

## 7. Update: Dashboard admin & Kelola Tag/Creator

Nggak perlu update `firestore.rules` lagi — masih di collection `presets` yang sama, cuma nambah 2 tab di admin panel.

Yang baru:
- **Dashboard** — sekarang jadi tab pertama begitu admin login. Nampilin total preset, total unduhan, jumlah laporan yang belum diselesaikan, jumlah preset yang belum diisi Effect/Rasio/FPS/Resolution, daftar 5 preset terbaru (klik → langsung ke form edit), dan tombol pintasan ke Tambah Baru / Laporan / Kelola Tag & Creator.
- **Kelola Tag & Creator** — lihat semua tag/creator yang pernah dipakai beserta jumlah preset yang memakainya. Ganti nama sekali → otomatis update ke semua preset terkait. Hapus tag / kosongkan creator juga berlaku ke semua preset sekaligus, nggak perlu edit satu-satu.

**Sengaja belum dikerjain** dari wishlist awal: Manage Kategori, Activity Log, Announcement System, Maintenance Mode.
- Kategori beda kelas dari tag/creator — dipakai sebagai daftar tetap di banyak tempat (chip filter, form, Smart Search), jadi bikin itu "manageable" perlu bongkar lebih banyak bagian dengan hati-hati.
- Activity Log / Announcement / Maintenance Mode butuh collection Firestore baru + update `firestore.rules` — beda dari semua update sejauh ini yang murni nambah field ke collection `presets` yang sudah ada.

## 8. Update: Badge "Baru", Baru Dilihat, Bandingkan Preset

Nggak perlu update `firestore.rules` — Badge & Bandingkan murni tampilan (dihitung dari data yang sudah ada), dan Baru Dilihat cuma nambah satu key baru di localStorage pengunjung, sama kayak Favorit.

Yang baru:
- **Badge "Baru"** — nempel otomatis di preset yang ditambahkan dalam 7 hari terakhir (bisa diubah lewat konstanta `NEW_BADGE_DAYS` di `index.html`). Beda dari "Unggulan" yang manual, ini murni berdasarkan tanggal.
- **Baru Dilihat** — shelf baru di atas "Rekomendasi buat kamu", isinya preset yang baru dibuka pengunjung ini (localStorage, maksimal 12 preset, terbaru duluan).
- **Bandingkan Preset** — tiap card sekarang ada ikon compare (di sebelah ikon hati). Pilih 2 preset, muncul bar mengambang di bawah layar, tap "Bandingkan" buat lihat keduanya berdampingan (kategori, creator, effect, rasio, FPS, resolution, unduhan, tanggal ditambahkan).

## 9. Update: Announcement Banner & Maintenance Mode

⚠️ **Ini update pertama yang WAJIB update `firestore.rules` juga** — beda dari update-update sebelumnya. Ada collection baru (`settings`) buat nyimpen dua pengaturan ini, jadi rules-nya perlu tau collection itu boleh dibaca semua orang tapi cuma admin yang boleh ubah.

**Cara update rules:** Firebase Console → Firestore Database → Rules → tempel ulang isi `firestore.rules` yang baru → Publish. Kalau langkah ini kelewat, banner/maintenance-nya nggak bakal muncul ke pengunjung (gagal secara aman — situsnya tetap jalan normal, cuma fitur ini yang nggak nyala), dan nyimpen dari tab Pengaturan bakal gagal dengan pesan error izin.

Yang baru — tab **Pengaturan** di admin panel (antara Laporan & Data/Backup):
- **Announcement Banner** — banner di paling atas situs, muncul ke semua pengunjung sampai mereka tutup sendiri (per-pesan — kalau kamu ganti pesannya, banner muncul lagi meskipun pesan lama udah pernah ditutup). Ada 3 tipe warna: Info/Peringatan/Sukses.
- **Maintenance Mode** — kalau diaktifkan, semua pengunjung (kecuali kamu yang login admin) lihat layar "Sedang Maintenance" penuh, bukan situsnya. Ada tombol "Admin? Login di sini" di layar itu juga, jadi kamu tetap bisa masuk buat matiin lagi — nggak bakal kekunci sendiri.

## 10. Update: Akun Pengunjung — Fase 1 (Login Google)

⚠️ **Wajib update `firestore.rules` lagi** (collection baru: `users`) — sama seperti update sebelumnya, kalau langkah ini kelewat, situsnya tetap jalan normal, cuma tombol Login Google-nya nggak akan berfungsi (gagal dengan pesan error izin).

**Langkah tambahan yang WAJIB di Firebase Console** (beda dari update-update sebelumnya, ini bukan cuma soal rules):
1. **Build → Authentication → Sign-in method** → aktifkan provider **Google** (klik Enable → pilih email support kamu → Save).
2. Kalau situsnya sudah live di domain custom, cek juga **Authentication → Settings → Authorized domains** — domain Vercel kamu harus ada di situ (biasanya otomatis kalau masih pakai `*.vercel.app`).

Ini **fase pertama** dari sistem akun pengunjung — sengaja dipecah, karena ini pembalikan dari keputusan "admin-only" di awal proyek dan menyentuh banyak bagian sekaligus. Yang sudah jalan:
- Tombol **Login dengan Google** di header (ikon orang, di sebelah tombol Admin) — pengunjung yang login dapet profil otomatis (`users/{uid}`) dengan foto & nama dari akun Google mereka.
- Klik lagi tombol yang sama (sekarang jadi foto profil mereka) buka modal **Profil Saya** — bisa ganti nama tampilan & bio, atau Keluar.
- Field `level`, `xp`, `achievements`, `followerCount`, `followingCount` sudah ada di data (default 0/kosong) tapi **sengaja dikunci** dari pengunjung sendiri lewat rules — cuma admin yang bisa ubah buat sekarang. Ini jaga-jaga biar nggak ada yang curang set level sendiri lewat console browser, sebelum ada sistem auto-award yang lebih aman.

**Belum ada** (giliran-giliran berikutnya): auto-award XP/Achievement dari aktivitas, Leaderboard, Pesan antar pengguna, Notifikasi, dan redesign tampilan ke arah sidebar/multi-halaman.

## 11. Update: Manage Kategori & Follow System

Nggak perlu update rules buat Manage Kategori (masih di collection `presets` yang sama). **Follow System butuh update `firestore.rules` lagi** (collection baru: `follows`).

- **Manage Kategori** — tab admin "Kategori/Tag/Creator" sekarang punya section Kategori juga: ganti nama kategori berlaku ke semua preset yang memakainya. Nggak ada tombol hapus (tiap preset wajib punya kategori) — kalau mau "pensiunkan" satu kategori, ganti namanya jadi kategori lain yang sudah ada.
- **Follow System** — nama creator di halaman detail preset sekarang bisa diklik ("by [Nama]"), buka **Profil Creator**: daftar semua presetnya, total unduhan, jumlah pengikut, dan tombol Ikuti/Mengikuti. Klik Ikuti pas belum login otomatis munculin popup Google Sign-In dulu.
  - Creator di MotionVault masih sekadar label teks di preset (bukan akun beneran), jadi yang di-follow itu **namanya**, bukan akun tertentu. Kalau nama creator diganti lewat Manage Kategori/Tag/Creator, follower lama yang nempel di nama sebelumnya jadi nggak ke-link lagi ke nama baru — belum ada migrasi otomatis buat kasus ini.

## 12. Update: Level, XP & Achievement

⚠️ **Update `firestore.rules` lagi** — bukan collection baru kali ini, tapi rule `users` berubah lumayan banyak (lihat di bawah).

Cara dapet XP:
- **Check-in harian** — +5 XP pas pertama kali buka situs tiap hari (otomatis, sekali per hari), makin sering berturut-turut makin gede streak-nya.
- **Follow creator** — +3 XP tiap follow baru.
- **Download preset** — +2 XP tiap kali download (kalau lagi login).

**Level** dihitung otomatis dari total XP (`Level = XP ÷ 100, dibulatkan`) — bukan angka yang disimpan terpisah, jadi nggak ada yang perlu "disinkronkan". **Achievement** ada 7 macam (Follower Pertama, Unduhan Pertama, Kolektor, Kolektor Ulung, Setia 3 Hari, Setia Seminggu, Early Bird) — semua muncul di modal Profil Saya sebagai badge, lengkap sama progress bar XP ke level berikutnya.

**Soal keamanan — jujur-jujuran:** supaya pengunjung tetap bisa dapet XP tanpa perlu server tambahan (Cloud Functions), field `xp` di rules dibikin bisa naik sendiri tapi **dibatasi maksimal +10 per sekali simpan**, dan achievement cuma boleh ditambahin satu-satu dari daftar ID yang dikenal — nggak bisa loncat ke angka atau achievement sembarangan. Ini **persis pola yang sama** kayak counter "downloads" di preset yang udah lebih dulu ada. Bukan anti-cheat sempurna — orang yang benar-benar niat scripting masih bisa nge-spam +10 berkali-kali dalam waktu singkat — tapi buat situs preset non-kompetitif kayak ini, ini trade-off yang wajar. Kalau suatu saat XP/level mau dijadiin sesuatu yang lebih "bertaruh" (leaderboard hadiah, dll), baru pantas upgrade ke Cloud Functions.

## 13. Update: Leaderboard Pengguna

Nggak perlu update rules — cuma query baca dari collection `users` yang udah ada.

Section baru **"🏆 Leaderboard Pengguna"** di halaman Statistik (nav bar bawah), nampilin top 10 pengunjung berdasarkan total XP — foto profil, nama, level, dan XP-nya. Belum bisa diklik buat lihat detail (halaman profil publik buat orang lain itu bagian dari redesign nanti).

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

