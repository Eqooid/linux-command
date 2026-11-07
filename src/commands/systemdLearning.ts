import type { CommandDefinition } from "./types";

export const systemdConcepts: NonNullable<CommandDefinition["concepts"]> = [
  {
    term: { en: "systemd", id: "systemd" },
    description: {
      en: "A Linux system and service manager. These commands require a systemd environment; some distributions and containers use other init systems or do not run a systemd manager.",
      id: "Pengelola sistem dan layanan Linux. Perintah ini memerlukan lingkungan systemd; sebagian distribusi dan container memakai sistem init lain atau tidak menjalankan pengelola systemd.",
    },
  },
  {
    term: { en: "Unit and service", id: "Unit dan layanan" },
    description: {
      en: "A unit is a resource managed by systemd. A .service unit describes a service; .socket handles socket activation, .timer schedules activation, .target groups units, and .mount represents a mount point. A service is only one kind of unit.",
      id: "Unit adalah sumber daya yang dikelola systemd. Unit .service menjelaskan layanan; .socket menangani aktivasi socket, .timer menjadwalkan aktivasi, .target mengelompokkan unit, dan .mount mewakili titik mount. Layanan hanya salah satu jenis unit.",
    },
  },
  {
    term: {
      en: "Unit file and manager reload",
      id: "Berkas unit dan muat ulang pengelola",
    },
    description: {
      en: "A unit file describes configuration and dependencies. daemon-reload rereads manager configuration and unit files and rebuilds dependencies; it does not automatically restart running services. reload nginx instead asks the service to reload its own configuration, if supported.",
      id: "Berkas unit menjelaskan konfigurasi dan dependensi. daemon-reload membaca ulang konfigurasi pengelola dan berkas unit serta membangun ulang dependensi; tidak otomatis memulai ulang layanan yang berjalan. reload nginx meminta layanan memuat ulang konfigurasinya sendiri, bila didukung.",
    },
  },
  {
    term: { en: "Active versus enabled", id: "Aktif dibandingkan diaktifkan" },
    description: {
      en: "Active describes runtime state; enabled describes installation links used for activation, often at boot. start activates now without enabling. enable sets up installation links without necessarily starting. enable --now enables and starts; disable --now disables and stops. Enabled does not guarantee healthy or running, and disabled does not prevent all activation.",
      id: "Aktif menjelaskan keadaan saat berjalan; diaktifkan menjelaskan tautan instalasi untuk aktivasi, sering saat boot. start mengaktifkan sekarang tanpa enable. enable membuat tautan instalasi tanpa harus menjalankan layanan. enable --now mengaktifkan dan memulai; disable --now menonaktifkan dan menghentikan. Enabled tidak menjamin sehat atau berjalan, dan disabled tidak mencegah semua aktivasi.",
    },
  },
  {
    term: {
      en: "System and user managers",
      id: "Pengelola sistem dan pengguna",
    },
    description: {
      en: "System units belong to the system manager; --user targets the calling user's manager. System changes may require policy authorization or administrator privileges. Many inspections are readable without sudo. No authorization, account, or manager is checked by this browser.",
      id: "Unit sistem milik pengelola sistem; --user menargetkan pengelola pengguna pemanggil. Perubahan sistem mungkin memerlukan otorisasi kebijakan atau hak administrator. Banyak pemeriksaan dapat dibaca tanpa sudo. Browser ini tidak memeriksa otorisasi, akun, atau pengelola.",
    },
  },
  {
    term: { en: "System journal", id: "Jurnal sistem" },
    description: {
      en: "systemd-journald stores structured log records. systemctl manages units; journalctl reads journal records. Unit filtering uses metadata, not a text search. By default journalctl shows all accessible journals; --system limits system/kernel messages and --user selects current-user service journals. Access and user-journal availability depend on configuration.",
      id: "systemd-journald menyimpan catatan log terstruktur. systemctl mengelola unit; journalctl membaca catatan jurnal. Filter unit memakai metadata, bukan pencarian teks. Secara bawaan journalctl menampilkan semua jurnal yang dapat diakses; --system membatasi pesan sistem/kernel dan --user memilih jurnal layanan pengguna saat ini. Akses dan ketersediaan jurnal pengguna bergantung pada konfigurasi.",
    },
  },
  {
    term: { en: "Log priority", id: "Prioritas log" },
    description: {
      en: "From most to least severe: emerg, alert, crit, err, warning, notice, info, debug. A single -p selection includes that severity and more severe messages; err includes emerg through err, not only errors of exactly that level.",
      id: "Dari paling hingga kurang parah: emerg, alert, crit, err, warning, notice, info, debug. Satu pilihan -p mencakup tingkat tersebut dan pesan yang lebih parah; err mencakup emerg hingga err, bukan hanya pesan tepat di tingkat itu.",
    },
  },
  {
    term: { en: "Boot logs", id: "Log boot" },
    description: {
      en: "-b selects the current boot and -b -1 the previous boot. Without an explicit boot selection, follow mode implies the current boot; --boot=all explicitly removes the boot restriction. Custom zero/negative offsets count from the newest stored boot; positive offsets count from the oldest stored boot (1 is oldest), not future boots. Previous logs may be unavailable after rotation or with volatile storage.",
      id: "-b memilih boot saat ini dan -b -1 boot sebelumnya. Tanpa pilihan boot eksplisit, mode ikuti menyiratkan boot saat ini; --boot=all menghapus pembatasan boot secara eksplisit. Offset kustom nol/negatif dihitung dari boot tersimpan terbaru; offset positif dihitung dari boot tersimpan terlama (1 adalah terlama), bukan boot mendatang. Log sebelumnya mungkin tidak tersedia setelah rotasi atau dengan penyimpanan sementara.",
    },
  },
  {
    term: {
      en: "Live following and ordering",
      id: "Mengikuti log langsung dan urutan",
    },
    description: {
      en: "-f waits for new records until interrupted, usually with Ctrl + C. It is incompatible with reverse ordering (-r). Without -n, following normally begins with a recent tail; ordinary output without filters starts with the oldest accessible records. The browser never streams or invents logs.",
      id: "-f menunggu catatan baru hingga diinterupsi, biasanya dengan Ctrl + C. Opsi ini tidak kompatibel dengan urutan terbalik (-r). Tanpa -n, mode ikuti biasanya dimulai dari bagian akhir terbaru; keluaran biasa tanpa filter dimulai dari catatan terlama yang dapat diakses. Browser tidak melakukan streaming atau mengarang log.",
    },
  },
  {
    term: { en: "Time and output formats", id: "Waktu dan format keluaran" },
    description: {
      en: "Time expressions are interpreted on the target Linux machine, not against the browser clock. This builder supports local YYYY-MM-DD HH:mm:ss and a small relative subset. short is the default readable format, short-iso uses ISO-style timestamps, cat prints message text without normal metadata, and json emits structured records. No-pager prints directly.",
      id: "Ekspresi waktu ditafsirkan di mesin Linux tujuan, bukan terhadap jam browser. Builder ini mendukung YYYY-MM-DD HH:mm:ss lokal dan sebagian kecil ekspresi relatif. short adalah format terbaca bawaan, short-iso memakai waktu bergaya ISO, cat mencetak teks pesan tanpa metadata biasa, dan json menghasilkan catatan terstruktur. No-pager mencetak langsung.",
    },
  },
];

export const systemdComparison: NonNullable<CommandDefinition["comparison"]> = [
  {
    command: "systemctl status",
    description: {
      en: "Inspect unit state and recent status information.",
      id: "Periksa keadaan unit dan informasi status terbaru.",
    },
  },
  {
    command: "systemctl restart",
    description: {
      en: "Restart a unit; this can interrupt service.",
      id: "Mulai ulang unit; ini dapat mengganggu layanan.",
    },
  },
  {
    command: "systemctl enable",
    description: {
      en: "Configure unit enablement through installation links.",
      id: "Atur pengaktifan unit melalui tautan instalasi.",
    },
  },
  {
    command: "journalctl -u",
    description: {
      en: "Read journal records associated with a unit.",
      id: "Baca catatan jurnal yang terkait dengan unit.",
    },
  },
  {
    command: "journalctl -f",
    description: {
      en: "Follow incoming journal records in a terminal.",
      id: "Ikuti catatan jurnal baru di terminal.",
    },
  },
];

export const troubleshootingExample: CommandDefinition["examples"][number] = {
  command:
    "systemctl status nginx\njournalctl -u nginx.service -n 50\nsudo systemctl restart nginx\nsystemctl is-active nginx",
  description: {
    en: "Manual troubleshooting steps, not an executable workflow here. Inspect status and logs first. Restart only after reviewing the cause and operational impact: it can cause downtime and is not the automatic first response to every error. Names and authorization are examples, not verified facts.",
    id: "Langkah pemecahan masalah manual, bukan alur yang dieksekusi di sini. Periksa status dan log terlebih dahulu. Mulai ulang hanya setelah meninjau penyebab dan dampaknya: ini dapat menyebabkan waktu henti dan bukan respons pertama otomatis untuk setiap kesalahan. Nama dan otorisasi hanya contoh, bukan fakta terverifikasi.",
  },
};
