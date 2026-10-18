import type { CommandDefinition } from "../types";
import {
  processConcepts,
  processPidArgument,
  processUserArgument,
} from "../processLearning";

export const top: CommandDefinition = {
  id: "top",
  name: "top",
  category: "processes",
  form: { kind: "basic" },
  description: {
    en: "Configure an interactive or batch process monitor command.",
    id: "Atur perintah pemantau proses interaktif atau batch.",
  },
  explanation: {
    en: "top repeatedly updates process and resource information in a terminal, unlike a ps snapshot. -d sets seconds between updates; -p selects up to 20 PIDs and cannot be combined with effective-user filter -u. -H shows individual threads; combined with -p, top can include the monitored PIDs' thread groups. Batch -b does not accept interactive keys; use -n to limit updates in either mode. Saved top configuration and secure mode can alter behavior. This browser generates the command only: no CPU/memory metrics, process list, or monitor is simulated.",
    id: "top memperbarui informasi proses dan sumber daya secara berulang di terminal, berbeda dari cuplikan ps. -d menetapkan detik antar pembaruan; -p memilih hingga 20 PID dan tidak dapat digabung dengan filter pengguna efektif -u. -H menampilkan thread individual; bersama -p, top dapat menyertakan grup thread PID yang dipantau. Batch -b tidak menerima tombol interaktif; gunakan -n untuk membatasi pembaruan pada kedua mode. Konfigurasi top tersimpan dan mode aman dapat mengubah perilaku. Browser ini hanya menghasilkan perintah: metrik CPU/memori, daftar proses, atau pemantau tidak disimulasikan.",
  },
  syntax: "top [-b] [-H] [-d seconds] [-p pid,... | -u user] [-n updates]",
  options: [
    {
      id: "batch",
      flag: "-b",
      label: { en: "Batch output", id: "Keluaran batch" },
      description: {
        en: "Non-interactive output. Without -n it continues until stopped externally.",
        id: "Keluaran non-interaktif. Tanpa -n, berjalan hingga dihentikan dari luar.",
      },
    },
    {
      id: "threads",
      flag: "-H",
      label: { en: "Display threads", id: "Tampilkan thread" },
      description: {
        en: "Show individual threads rather than only process-level summaries.",
        id: "Tampilkan thread individual, bukan hanya ringkasan tingkat proses.",
      },
    },
  ],
  arguments: [
    {
      id: "delay",
      required: false,
      placeholder: "2",
      label: {
        en: "Refresh interval, seconds (-d)",
        id: "Interval penyegaran, detik (-d)",
      },
      description: {
        en: "Optional positive value with up to one decimal digit, e.g. 2 or 0.5. Secure mode may restrict changes; the browser checks syntax only.",
        id: "Nilai positif opsional dengan hingga satu digit desimal, misalnya 2 atau 0.5. Mode aman dapat membatasi perubahan; browser hanya memeriksa sintaks.",
      },
    },
    processPidArgument(false),
    processUserArgument,
    {
      id: "updates",
      required: false,
      placeholder: "1",
      label: { en: "Maximum updates (-n)", id: "Pembaruan maksimum (-n)" },
      description: {
        en: "Optional positive integer, in batch or interactive mode. For one batch snapshot select -b and enter 1.",
        id: "Bilangan bulat positif opsional, dalam mode batch atau interaktif. Untuk satu cuplikan batch pilih -b dan masukkan 1.",
      },
    },
  ],
  warnings: [
    {
      en: "The k (signal) and r (renice) shortcuts can change process state or request privileges in a real terminal. They are references only here. No shortcut handler, process access, or execution is provided.",
      id: "Pintasan k (sinyal) dan r (renice) dapat mengubah keadaan proses atau meminta hak istimewa di terminal sebenarnya. Di sini hanya berupa referensi. Tidak ada penanganan pintasan, akses proses, atau eksekusi.",
    },
  ],
  concepts: processConcepts,
  shortcuts: {
    description: {
      en: "Common procps-ng top keys, used inside the terminal monitor, not this page. Batch mode does not use these keys; permissions, configuration, secure mode, and versions may limit them.",
      id: "Tombol top procps-ng umum, digunakan di dalam pemantau terminal, bukan halaman ini. Mode batch tidak memakai tombol ini; izin, konfigurasi, mode aman, dan versi dapat membatasinya.",
    },
    items: [
      { keys: "q", description: { en: "Quit", id: "Keluar" } },
      {
        keys: "P",
        description: {
          en: "Sort by CPU usage",
          id: "Urutkan menurut penggunaan CPU",
        },
      },
      {
        keys: "M",
        description: {
          en: "Sort by memory usage",
          id: "Urutkan menurut penggunaan memori",
        },
      },
      {
        keys: "T",
        description: {
          en: "Sort by CPU time",
          id: "Urutkan menurut waktu CPU",
        },
      },
      {
        keys: "k",
        description: {
          en: "Request a signal to a process; can change process state",
          id: "Minta sinyal ke proses; dapat mengubah keadaan proses",
        },
      },
      {
        keys: "r",
        description: {
          en: "Request a priority change (renice); privileges may be needed",
          id: "Minta perubahan prioritas (renice); hak istimewa mungkin diperlukan",
        },
      },
      {
        keys: "H",
        description: {
          en: "Toggle individual thread display",
          id: "Alihkan tampilan thread individual",
        },
      },
      {
        keys: "1",
        description: {
          en: "Toggle per-CPU summary display",
          id: "Alihkan tampilan ringkasan per CPU",
        },
      },
      {
        keys: "h",
        description: { en: "Display help", id: "Tampilkan bantuan" },
      },
    ],
  },
  examples: [
    {
      command: "top",
      description: {
        en: "Open the terminal monitor with its current defaults.",
        id: "Buka pemantau terminal dengan bawaan saat ini.",
      },
    },
    {
      command: "top -d 2",
      description: {
        en: "Request two-second refreshes.",
        id: "Minta penyegaran dua detik.",
      },
    },
    {
      command: "top -p 1234",
      description: {
        en: "Monitor a specific PID.",
        id: "Pantau PID tertentu.",
      },
    },
    {
      command: "top -u root",
      description: {
        en: "Filter by effective user.",
        id: "Filter menurut pengguna efektif.",
      },
    },
    {
      command: "top -H",
      description: {
        en: "Display individual threads.",
        id: "Tampilkan thread individual.",
      },
    },
    {
      command: "top -b -n 1",
      description: {
        en: "Request a single batch update.",
        id: "Minta satu pembaruan batch.",
      },
    },
  ],
};
