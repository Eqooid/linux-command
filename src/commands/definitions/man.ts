import type { CommandDefinition } from "../types";

export const man: CommandDefinition = {
  id: "man",
  name: "man",
  category: "help",
  form: { kind: "basic" },
  description: {
    en: "Read manual pages or search their descriptions.",
    id: "Baca halaman manual atau cari deskripsinya.",
  },
  explanation: {
    en: "Manual pages document commands, functions, and file formats. Read NAME, SYNOPSIS, DESCRIPTION, and OPTIONS to understand usage. The same topic can exist in multiple numbered sections: printf(1) is a command, while printf(3) is a library function. Normal lookup opens a page; -k searches names and short descriptions using a regular expression; -f shows short descriptions for a name. Shell builtins may be documented in the shell manual or Bash help instead of a standalone page. This builder targets Linux man-db and never checks whether a manual is installed.",
    id: "Halaman manual mendokumentasikan perintah, fungsi, dan format file. Baca NAME, SYNOPSIS, DESCRIPTION, dan OPTIONS untuk memahami penggunaannya. Topik yang sama dapat ada di beberapa bagian bernomor: printf(1) adalah perintah, sedangkan printf(3) adalah fungsi pustaka. Pencarian biasa membuka halaman; -k mencari nama dan deskripsi singkat memakai ekspresi reguler; -f menampilkan deskripsi singkat suatu nama. Builtin shell dapat didokumentasikan dalam manual shell atau help Bash, bukan halaman tersendiri. Builder ini ditujukan untuk man-db Linux dan tidak memeriksa apakah manual terpasang.",
  },
  syntax: "man [-k | -f | -a | -w] [-s section] -- topic",
  choices: [
    {
      id: "lookup",
      label: { en: "Manual lookup mode", id: "Mode pencarian manual" },
      description: {
        en: "Choose one mode. Keyword mode uses man-db/apropos regex matching, not shell expansion; regex validity is not checked here.",
        id: "Pilih satu mode. Mode kata kunci memakai pencocokan regex man-db/apropos, bukan ekspansi shell; validitas regex tidak diperiksa di sini.",
      },
      defaultValue: "page",
      items: [
        {
          value: "page",
          label: { en: "Open manual page", id: "Buka halaman manual" },
        },
        {
          value: "keyword",
          label: { en: "Search descriptions (-k)", id: "Cari deskripsi (-k)" },
        },
        {
          value: "short",
          label: {
            en: "Short descriptions (-f)",
            id: "Deskripsi singkat (-f)",
          },
        },
        {
          value: "all",
          label: {
            en: "All matching pages (-a)",
            id: "Semua halaman cocok (-a)",
          },
        },
        {
          value: "path",
          label: {
            en: "Manual file locations (-w)",
            id: "Lokasi file manual (-w)",
          },
        },
      ],
    },
    {
      id: "section",
      label: { en: "Manual section", id: "Bagian manual" },
      description: {
        en: "Default searches the configured section order. A selected section is emitted explicitly with -s, e.g. man -s 5 -- 'passwd' (equivalent to man 5 passwd).",
        id: "Bawaan mencari menurut urutan bagian yang dikonfigurasi. Bagian terpilih ditulis eksplisit dengan -s, misalnya man -s 5 -- 'passwd' (setara man 5 passwd).",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: { en: "Default section order", id: "Urutan bagian bawaan" },
        },
        {
          value: "1",
          label: { en: "1 — User commands", id: "1 — Perintah pengguna" },
        },
        {
          value: "2",
          label: { en: "2 — System calls", id: "2 — Panggilan sistem" },
        },
        {
          value: "3",
          label: { en: "3 — Library functions", id: "3 — Fungsi pustaka" },
        },
        {
          value: "4",
          label: { en: "4 — Special files", id: "4 — File khusus" },
        },
        {
          value: "5",
          label: { en: "5 — File formats", id: "5 — Format file" },
        },
        { value: "6", label: { en: "6 — Games", id: "6 — Permainan" } },
        { value: "7", label: { en: "7 — Miscellaneous", id: "7 — Lain-lain" } },
        {
          value: "8",
          label: {
            en: "8 — System administration",
            id: "8 — Administrasi sistem",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "keywordMode",
      flag: "-k",
      choice: { field: "lookup", value: "keyword" },
      label: { en: "Keyword search", id: "Pencarian kata kunci" },
      description: {
        en: "Search manual names and short descriptions using a keyword regex, like apropos.",
        id: "Cari nama manual dan deskripsi singkat memakai regex kata kunci, seperti apropos.",
      },
    },
    {
      id: "shortMode",
      flag: "-f",
      choice: { field: "lookup", value: "short" },
      label: { en: "Short description", id: "Deskripsi singkat" },
      description: {
        en: "Look up a name's short descriptions, like whatis.",
        id: "Cari deskripsi singkat suatu nama, seperti whatis.",
      },
    },
    {
      id: "allMode",
      flag: "-a",
      choice: { field: "lookup", value: "all" },
      label: { en: "All pages", id: "Semua halaman" },
      description: {
        en: "Display each matching page in succession rather than just the first.",
        id: "Tampilkan setiap halaman yang cocok secara berurutan, bukan hanya yang pertama.",
      },
    },
    {
      id: "pathMode",
      flag: "-w",
      choice: { field: "lookup", value: "path" },
      label: { en: "File locations", id: "Lokasi file" },
      description: {
        en: "Print the source manual file locations instead of displaying pages.",
        id: "Tampilkan lokasi file sumber manual alih-alih membuka halaman.",
      },
    },
  ],
  arguments: [
    {
      id: "topic",
      required: true,
      placeholder: "printf",
      label: {
        en: "Command or manual topic",
        id: "Perintah atau topik manual",
      },
      description: {
        en: "One literal argument. Enter a name such as ls, passwd, or printf(3); use the section selector for a number. Shell characters stay literal, though -k interprets a regex inside man.",
        id: "Satu argumen literal. Masukkan nama seperti ls, passwd, atau printf(3); gunakan pemilih bagian untuk angka. Karakter shell tetap literal, meskipun -k menafsirkan regex di dalam man.",
      },
    },
  ],
  warnings: [
    {
      en: "Pager -P configuration is intentionally omitted: man starts an external pager program, whose command-string parsing needs separate handling. Installed pages, pager settings, and man-db versions affect behavior.",
      id: "Konfigurasi pager -P sengaja tidak disediakan: man memulai program pager eksternal, yang penguraian string perintahnya memerlukan penanganan terpisah. Halaman terpasang, pengaturan pager, dan versi man-db memengaruhi perilaku.",
    },
  ],
  shortcuts: {
    description: {
      en: "Common keys when man uses less as its terminal pager. Use them after opening a page manually; other pagers or configurations may differ. Search modes and -w do not open this viewer.",
      id: "Tombol umum saat man memakai less sebagai pager terminal. Gunakan setelah membuka halaman secara manual; pager atau konfigurasi lain dapat berbeda. Mode pencarian dan -w tidak membuka penampil ini.",
    },
    items: [
      {
        keys: "Space",
        description: { en: "Next page", id: "Halaman berikutnya" },
      },
      {
        keys: "b",
        description: { en: "Previous page", id: "Halaman sebelumnya" },
      },
      {
        keys: "j / k",
        description: {
          en: "Move down / up one line",
          id: "Turun / naik satu baris",
        },
      },
      {
        keys: "g / G",
        description: { en: "Go to beginning / end", id: "Ke awal / akhir" },
      },
      {
        keys: "/text",
        description: {
          en: "Search forward, then press Enter",
          id: "Cari ke depan, lalu tekan Enter",
        },
      },
      {
        keys: "n / N",
        description: {
          en: "Next / previous search match",
          id: "Kecocokan pencarian berikutnya / sebelumnya",
        },
      },
      { keys: "h", description: { en: "Pager help", id: "Bantuan pager" } },
      {
        keys: "q",
        description: { en: "Quit the pager", id: "Keluar dari pager" },
      },
    ],
  },
  examples: [
    {
      command: "man ls",
      description: { en: "Read the ls manual.", id: "Baca manual ls." },
    },
    {
      command: "man 1 printf",
      description: {
        en: "Read the user-command version of printf.",
        id: "Baca versi perintah pengguna printf.",
      },
    },
    {
      command: "man 5 passwd",
      description: {
        en: "Read the passwd file-format manual.",
        id: "Baca manual format file passwd.",
      },
    },
    {
      command: "man -k network",
      description: {
        en: "Search manual names and descriptions for network.",
        id: "Cari network dalam nama dan deskripsi manual.",
      },
    },
    {
      command: "man -f chmod",
      description: {
        en: "Show short descriptions for chmod.",
        id: "Tampilkan deskripsi singkat chmod.",
      },
    },
    {
      command: "man -a printf",
      description: {
        en: "Read all matching printf pages.",
        id: "Baca semua halaman printf yang cocok.",
      },
    },
    {
      command: "man -w ls",
      description: {
        en: "Show the source manual location for ls.",
        id: "Tampilkan lokasi sumber manual ls.",
      },
    },
  ],
};
