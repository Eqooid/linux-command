import type { CommandDefinition } from "../types";
import { htopSortKeys } from "../htop";
import { processConcepts, processUserArgument } from "../processLearning";

export const htop: CommandDefinition = {
  id: "htop",
  name: "htop",
  category: "processes",
  description: {
    en: "Configure an enhanced interactive process monitor, without inspecting real processes.",
    id: "Atur pemantau proses interaktif lanjutan, tanpa memeriksa proses nyata.",
  },
  explanation: {
    en: "htop is an interactive terminal process viewer with scrolling, selectable columns and process trees. ps shows a snapshot; top and htop update repeatedly, with different interfaces, options and configuration. CPU usage describes processor activity over an interval; memory usage reflects resident memory and is not the same as virtual address space. PID identifies a process, state describes whether it is running, sleeping, stopped or a zombie, and a tree shows parent/child relationships. -u filters by user and -p by PID; filters can be combined. -d uses tenths of a second, so 20 is about two seconds, not 20 milliseconds. This builder accepts 1–100 to avoid htop's delay clamping. Sort keys use a conservative documented subset; in supported versions tree sorting applies to children of each process. --readonly restricts process/system-changing features inside htop, but is not a security sandbox. Availability, saved configuration, terminal keys and fields vary by version/platform. htop may need separate installation. This app never runs it, reads process data or simulates CPU/memory metrics.",
    id: "htop adalah penampil proses terminal interaktif dengan pengguliran, kolom terpilih, dan pohon proses. ps menampilkan cuplikan; top dan htop memperbarui berulang kali, dengan antarmuka, opsi, dan konfigurasi berbeda. Penggunaan CPU menjelaskan aktivitas prosesor selama interval; penggunaan memori mencerminkan memori resident dan berbeda dari ruang alamat virtual. PID mengidentifikasi proses, keadaan menjelaskan apakah berjalan, tidur, berhenti sementara, atau zombie, dan pohon menunjukkan hubungan induk/anak. -u memfilter pengguna dan -p memfilter PID; filter dapat digabung. -d memakai sepersepuluh detik, sehingga 20 sekitar dua detik, bukan 20 milidetik. Builder ini menerima 1–100 untuk menghindari pembatasan jeda htop. Kunci pengurutan memakai sebagian kecil yang terdokumentasi; pada versi yang mendukung, pengurutan pohon diterapkan ke anak setiap proses. --readonly membatasi fitur pengubahan proses/sistem di dalam htop, tetapi bukan sandbox keamanan. Ketersediaan, konfigurasi tersimpan, tombol terminal, dan kolom bervariasi menurut versi/platform. htop mungkin perlu dipasang terpisah. Aplikasi ini tidak pernah menjalankannya, membaca data proses, atau menyimulasikan metrik CPU/memori.",
  },
  syntax:
    "htop [-u user] [-p pid,...] [-d tenths] [-s PID|PERCENT_CPU|PERCENT_MEM] [-t] [--readonly]",
  form: {
    kind: "grouped",
    groups: [
      {
        id: "filters",
        title: { en: "Process filters", id: "Filter proses" },
        fields: ["username", "pids"],
      },
      {
        id: "refresh",
        title: { en: "Refresh and sorting", id: "Penyegaran dan pengurutan" },
        fields: ["delay", "sort"],
      },
      {
        id: "display",
        title: { en: "Display and interaction", id: "Tampilan dan interaksi" },
        fields: ["tree", "readonly"],
      },
    ],
  },
  choices: [
    {
      id: "sort",
      label: { en: "Sort column (-s)", id: "Kolom pengurutan (-s)" },
      description: {
        en: "Use the installed default or the documented PID, PERCENT_CPU or PERCENT_MEM keys. Available fields and tree/sort interaction may vary; htop --sort-key=help lists local fields when manually run.",
        id: "Gunakan bawaan terpasang atau kunci PID, PERCENT_CPU, atau PERCENT_MEM yang terdokumentasi. Kolom tersedia dan interaksi pohon/pengurutan dapat berbeda; htop --sort-key=help menampilkan kolom lokal saat dijalankan manual.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: {
            en: "Installed configuration default",
            id: "Bawaan konfigurasi terpasang",
          },
        },
        ...htopSortKeys.map((value) => ({
          value,
          label: { en: value, id: value },
        })),
      ],
    },
  ],
  options: [
    {
      id: "userFilter",
      flag: "-u",
      argument: "username",
      label: { en: "Filter by user", id: "Filter menurut pengguna" },
      description: {
        en: "Show processes matching the supplied common username; user existence is not checked.",
        id: "Tampilkan proses yang cocok dengan nama pengguna umum; keberadaan pengguna tidak diperiksa.",
      },
    },
    {
      id: "pidFilter",
      flag: "-p",
      argument: "pids",
      label: { en: "Filter by PID list", id: "Filter menurut daftar PID" },
      description: {
        en: "One comma-separated positive PID list. Accidental empty entries around valid values are removed.",
        id: "Satu daftar PID positif dipisah koma. Entri kosong tak sengaja di sekitar nilai valid dihapus.",
      },
    },
    {
      id: "delayOption",
      flag: "-d",
      argument: "delay",
      label: { en: "Refresh delay", id: "Jeda penyegaran" },
      description: {
        en: "Delay between updates in tenths of a second, not milliseconds.",
        id: "Jeda antar pembaruan dalam sepersepuluh detik, bukan milidetik.",
      },
    },
    {
      id: "sortOption",
      flag: "-s",
      choice: { field: "sort", value: "PERCENT_CPU" },
      label: { en: "Sort key", id: "Kunci pengurutan" },
      description: {
        en: "Select one allowlisted column; CLI keys remain unchanged across languages.",
        id: "Pilih satu kolom yang diizinkan; kunci CLI tidak berubah saat bahasa berganti.",
      },
    },
    {
      id: "tree",
      flag: "-t",
      label: { en: "Tree view", id: "Tampilan pohon" },
      description: {
        en: "Show process parent/child relationships. This is not a shell job table.",
        id: "Tampilkan hubungan induk/anak proses. Ini bukan tabel job shell.",
      },
    },
    {
      id: "readonly",
      flag: "--readonly",
      label: { en: "Read-only mode", id: "Mode hanya-baca" },
      description: {
        en: "Restrict process/system-changing features inside supported htop versions. This is not a security sandbox or an authorization guarantee.",
        id: "Batasi fitur pengubahan proses/sistem dalam versi htop yang mendukung. Ini bukan sandbox keamanan atau jaminan otorisasi.",
      },
    },
  ],
  arguments: [
    {
      ...processUserArgument,
      label: { en: "Username filter (-u)", id: "Filter nama pengguna (-u)" },
      description: {
        en: "Optional common username. Can be combined with a PID filter; no account or process is inspected.",
        id: "Nama pengguna umum opsional. Dapat digabung dengan filter PID; akun atau proses tidak diperiksa.",
      },
    },
    {
      id: "pids",
      required: false,
      placeholder: "1234,5678",
      label: { en: "PID list (-p)", id: "Daftar PID (-p)" },
      description: {
        en: "Optional positive PIDs from 1–2147483647 separated by commas. Surrounding spaces and accidental empty entries are removed; a nonempty comma-only list is invalid. Leading zeroes normalize to decimal. Processes are not verified.",
        id: "PID positif opsional dari 1–2147483647 dipisah koma. Spasi di sekitar dan entri kosong tak sengaja dihapus; daftar hanya-koma yang tidak kosong tidak valid. Nol di awal dinormalisasi ke desimal. Proses tidak diverifikasi.",
      },
    },
    {
      id: "delay",
      required: false,
      placeholder: "20",
      label: {
        en: "Delay in tenths of a second (-d)",
        id: "Jeda dalam sepersepuluh detik (-d)",
      },
      description: {
        en: "Integer 1–100: 10 is about 1 second, 20 about 2 seconds. Leave blank for the installed configuration. Upstream htop clamps out-of-range values; this builder rejects them instead.",
        id: "Bilangan bulat 1–100: 10 sekitar 1 detik, 20 sekitar 2 detik. Kosongkan untuk konfigurasi terpasang. Htop upstream membatasi nilai di luar rentang; builder ini menolaknya.",
      },
    },
  ],
  warnings: [
    {
      en: "Text generation only: no users, PIDs, metrics or running processes are inspected. In a real htop session, signal and priority actions can interrupt applications or require privileges; --readonly restricts those features where supported but does not create a security sandbox.",
      id: "Hanya pembuatan teks: pengguna, PID, metrik, dan proses berjalan tidak diperiksa. Dalam sesi htop nyata, tindakan sinyal dan prioritas dapat mengganggu aplikasi atau memerlukan hak istimewa; --readonly membatasi fitur tersebut bila didukung tetapi tidak membuat sandbox keamanan.",
    },
  ],
  concepts: processConcepts,
  comparison: [
    {
      command: "ps",
      description: {
        en: "Display a snapshot of process information.",
        id: "Tampilkan cuplikan informasi proses.",
      },
    },
    {
      command: "top",
      description: {
        en: "Monitor processes interactively in a terminal.",
        id: "Pantau proses secara interaktif di terminal.",
      },
    },
    {
      command: "htop",
      description: {
        en: "Enhanced interactive process monitoring with trees and selectable fields.",
        id: "Pemantauan proses interaktif lanjutan dengan pohon dan kolom terpilih.",
      },
    },
    {
      command: "pgrep",
      description: {
        en: "Find process IDs matching criteria.",
        id: "Cari ID proses yang cocok dengan kriteria.",
      },
    },
  ],
  shortcuts: {
    description: {
      en: "Keys used inside htop after it starts in a terminal, not command-line options. Behavior varies by version and terminal configuration; read-only mode or permissions may disable actions. This app does not handle these keys or run htop.",
      id: "Tombol yang dipakai di dalam htop setelah dimulai di terminal, bukan opsi baris perintah. Perilaku berbeda menurut versi dan konfigurasi terminal; mode hanya-baca atau izin dapat menonaktifkan tindakan. Aplikasi ini tidak menangani tombol tersebut atau menjalankan htop.",
    },
    items: [
      { keys: "F1", description: { en: "Open help.", id: "Buka bantuan." } },
      {
        keys: "F2",
        description: { en: "Open setup.", id: "Buka pengaturan." },
      },
      {
        keys: "F3",
        description: { en: "Search processes.", id: "Cari proses." },
      },
      {
        keys: "F4",
        description: {
          en: "Filter the process list.",
          id: "Filter daftar proses.",
        },
      },
      {
        keys: "F5",
        description: { en: "Toggle tree view.", id: "Alihkan tampilan pohon." },
      },
      {
        keys: "F6",
        description: { en: "Choose sorting.", id: "Pilih pengurutan." },
      },
      {
        keys: "F9",
        description: {
          en: "Send a signal to selected processes where allowed; this can interrupt running applications.",
          id: "Kirim sinyal ke proses terpilih bila diizinkan; ini dapat mengganggu aplikasi berjalan.",
        },
      },
      {
        keys: "F10",
        description: { en: "Quit htop.", id: "Keluar dari htop." },
      },
    ],
  },
  examples: [
    {
      command: "htop",
      description: {
        en: "Open the installed htop configuration.",
        id: "Buka konfigurasi htop terpasang.",
      },
    },
    {
      command: "htop -u developer",
      description: {
        en: "Filter by a username without asserting it exists.",
        id: "Filter menurut nama pengguna tanpa menyatakan keberadaannya.",
      },
    },
    {
      command: "htop -p 1234,5678",
      description: {
        en: "Monitor selected PIDs if they exist and are visible.",
        id: "Pantau PID terpilih bila ada dan terlihat.",
      },
    },
    {
      command: "htop -d 20",
      description: {
        en: "Request about two seconds between updates.",
        id: "Minta sekitar dua detik antar pembaruan.",
      },
    },
    {
      command: "htop -s PERCENT_CPU",
      description: {
        en: "Sort by a documented CPU-usage column.",
        id: "Urutkan menurut kolom penggunaan CPU yang terdokumentasi.",
      },
    },
    {
      command: "htop -s PERCENT_MEM",
      description: {
        en: "Sort by a documented memory-usage column.",
        id: "Urutkan menurut kolom penggunaan memori yang terdokumentasi.",
      },
    },
    {
      command: "htop -t --readonly",
      description: {
        en: "Tree view with process-changing actions restricted where supported.",
        id: "Tampilan pohon dengan tindakan pengubahan proses dibatasi bila didukung.",
      },
    },
    {
      command: "sudo apt install htop",
      description: {
        en: "Ubuntu installation example only, if htop is missing. Package availability and authorization depend on that system. This is documentation, not an installation action in the app.",
        id: "Hanya contoh pemasangan Ubuntu, bila htop belum tersedia. Ketersediaan paket dan otorisasi bergantung pada sistem tersebut. Ini dokumentasi, bukan tindakan pemasangan di aplikasi.",
      },
    },
  ],
};
