import type { CommandDefinition } from "../types";

export const less: CommandDefinition = {
  id: "less",
  name: "less",
  category: "reading",
  form: { kind: "basic" },
  description: {
    en: "Browse a text file interactively in a terminal.",
    id: "Telusuri file teks secara interaktif dalam terminal.",
  },
  explanation: {
    en: "less is a pager: it lets you move through a file and search without printing everything at once like cat. It is useful for large logs. These options target common Linux less. The browser only generates text; paging and keyboard commands work after you manually open less in a terminal. The file path is not verified.",
    id: "less adalah pager: Anda dapat menelusuri file dan mencari tanpa mencetak semuanya sekaligus seperti cat. Ini berguna untuk log besar. Opsi ini ditujukan untuk less Linux yang umum. Browser hanya menghasilkan teks; penelusuran halaman dan perintah keyboard bekerja setelah Anda membuka less secara manual dalam terminal. Jalur file tidak diverifikasi.",
  },
  syntax: "less [-N] [-S] [-i | -I] [-F] [-R] [+G] -- file",
  choices: [
    {
      id: "searchCase",
      label: { en: "Search case mode", id: "Mode huruf pencarian" },
      description: {
        en: "-i ignores case only when the search contains no uppercase letters; -I ignores case for every search.",
        id: "-i mengabaikan huruf besar/kecil hanya jika pencarian tidak mengandung huruf besar; -I mengabaikannya untuk setiap pencarian.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: {
            en: "Default (case-sensitive)",
            id: "Bawaan (peka huruf besar/kecil)",
          },
        },
        {
          value: "smart",
          label: {
            en: "Ignore case unless uppercase is used (-i)",
            id: "Abaikan kecuali ada huruf besar (-i)",
          },
        },
        {
          value: "ignore",
          label: {
            en: "Always ignore case (-I)",
            id: "Selalu abaikan huruf besar/kecil (-I)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "numbers",
      flag: "-N",
      label: { en: "Line numbers", id: "Nomor baris" },
      description: {
        en: "Display a line number beside each displayed line.",
        id: "Tampilkan nomor baris di samping setiap baris yang ditampilkan.",
      },
    },
    {
      id: "chop",
      flag: "-S",
      label: {
        en: "Do not wrap long lines",
        id: "Jangan bungkus baris panjang",
      },
      description: {
        en: "Keep long lines on one screen row; scroll horizontally to see more.",
        id: "Pertahankan baris panjang pada satu baris layar; gulir horizontal untuk melihat sisanya.",
      },
    },
    {
      id: "smartCase",
      flag: "-i",
      choice: { field: "searchCase", value: "smart" },
      label: {
        en: "Conditional case ignoring",
        id: "Abaikan huruf besar/kecil bersyarat",
      },
      description: {
        en: "Ignore case when the search pattern contains no uppercase letters.",
        id: "Abaikan huruf besar/kecil jika pola pencarian tidak mengandung huruf besar.",
      },
    },
    {
      id: "ignoreCase",
      flag: "-I",
      choice: { field: "searchCase", value: "ignore" },
      label: { en: "Ignore case", id: "Abaikan huruf besar/kecil" },
      description: {
        en: "Ignore case even when uppercase letters occur in the search.",
        id: "Abaikan huruf besar/kecil meskipun pencarian mengandung huruf besar.",
      },
    },
    {
      id: "quitIfFits",
      flag: "-F",
      label: {
        en: "Exit if one screen fits",
        id: "Keluar jika muat satu layar",
      },
      description: {
        en: "Exit automatically if the file fits on the first screen.",
        id: "Keluar otomatis jika file muat pada layar pertama.",
      },
    },
    {
      id: "colors",
      flag: "-R",
      label: { en: "Display ANSI colors", id: "Tampilkan warna ANSI" },
      description: {
        en: "Pass supported ANSI color sequences through instead of displaying them as notation; supported sequences depend on less version.",
        id: "Teruskan urutan warna ANSI yang didukung, bukan menampilkannya sebagai notasi; urutan yang didukung bergantung pada versi less.",
      },
    },
    {
      id: "end",
      flag: "+G",
      label: { en: "Start at the end", id: "Mulai dari akhir" },
      description: {
        en: "Use the trusted startup command +G to begin at the end of the file.",
        id: "Gunakan perintah awal tepercaya +G untuk memulai dari akhir file.",
      },
    },
  ],
  arguments: [
    {
      id: "path",
      label: { en: "File path", id: "Jalur file" },
      description: {
        en: "Enter one literal file path. Spaces and shell characters stay literal; leading + names use ./ to avoid startup-command interpretation.",
        id: "Masukkan satu jalur file literal. Spasi dan karakter shell tetap literal; nama berawalan + menggunakan ./ agar tidak dianggap perintah awal.",
      },
      required: true,
      placeholder: "application.log",
    },
  ],
  warnings: [
    {
      en: "Interactive viewing requires less installed in a terminal. Environment settings such as LESS, LESSOPEN, and key bindings can affect behavior. No viewer or file contents are simulated here.",
      id: "Penayangan interaktif memerlukan less yang terpasang dalam terminal. Pengaturan lingkungan seperti LESS, LESSOPEN, dan ikatan tombol dapat memengaruhi perilaku. Tidak ada penampil atau isi file yang disimulasikan di sini.",
    },
  ],
  shortcuts: {
    description: {
      en: "Use these common keys inside less after opening it in a terminal. Type a search pattern and press Enter. Bindings can be customized.",
      id: "Gunakan tombol umum ini di dalam less setelah membukanya dalam terminal. Ketik pola pencarian dan tekan Enter. Ikatan tombol dapat disesuaikan.",
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
        keys: "g",
        description: { en: "Go to the beginning", id: "Ke awal file" },
      },
      { keys: "G", description: { en: "Go to the end", id: "Ke akhir file" } },
      {
        keys: "/text",
        description: {
          en: "Search forward for text",
          id: "Cari teks ke depan",
        },
      },
      {
        keys: "?text",
        description: {
          en: "Search backward for text",
          id: "Cari teks ke belakang",
        },
      },
      {
        keys: "n",
        description: {
          en: "Next match in the search direction",
          id: "Kecocokan berikutnya sesuai arah pencarian",
        },
      },
      {
        keys: "N",
        description: {
          en: "Previous match (reverse search direction)",
          id: "Kecocokan sebelumnya (balik arah pencarian)",
        },
      },
      { keys: "q", description: { en: "Quit less", id: "Keluar dari less" } },
    ],
  },
  examples: [
    {
      command: "less notes.txt",
      description: {
        en: "Open a file in the terminal pager.",
        id: "Buka file dalam pager terminal.",
      },
    },
    {
      command: "less -N application.log",
      description: {
        en: "Browse with line numbers.",
        id: "Telusuri dengan nomor baris.",
      },
    },
    {
      command: "less -S large-file.txt",
      description: {
        en: "Keep long lines unwrapped.",
        id: "Pertahankan baris panjang tanpa pembungkusan.",
      },
    },
    {
      command: "less -R colored-output.txt",
      description: {
        en: "Show supported embedded ANSI colors.",
        id: "Tampilkan warna ANSI tertanam yang didukung.",
      },
    },
    {
      command: "less +G server.log",
      description: {
        en: "Begin at the end of a log file.",
        id: "Mulai dari akhir file log.",
      },
    },
  ],
};
