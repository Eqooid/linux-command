import type { CommandDefinition } from "../types";
import {
  processConcepts,
  processMatchingOptions,
  processUserArgument,
} from "../processLearning";

export const pgrep: CommandDefinition = {
  id: "pgrep",
  name: "pgrep",
  category: "processes",
  description: {
    en: "Find process IDs matching a regex and optional user or parent filters.",
    id: "Cari ID proses yang cocok dengan regex dan filter pengguna atau induk opsional.",
  },
  explanation: {
    en: "procps-ng pgrep lists PIDs selected by an extended regular expression and optional criteria. PID identifies a process; parent PID identifies its immediate parent. By default the pattern matches process names, normally limited to 15 characters. -f matches complete command lines instead. -x requires the whole selected name or command line to match, but does not escape regex metacharacters. -a only changes displayed output; it does not enable -f matching. -u selects effective user, -U real user, and -P immediate children of a parent PID; different criteria are combined with AND. A pattern may be omitted here when one of those filters is supplied. -n selects the newest and -o the oldest match by start time, not CPU activity; starts within one clock tick may be indistinguishable. pgrep is useful for reviewing potential matches before pkill, but processes and PIDs can change between commands. The browser never inspects processes or evaluates regex matches.",
    id: "pgrep procps-ng mencantumkan PID yang dipilih dengan ekspresi reguler extended dan kriteria opsional. PID mengidentifikasi proses; PID induk mengidentifikasi induk langsungnya. Secara bawaan pola mencocokkan nama proses, biasanya terbatas 15 karakter. -f mencocokkan baris perintah lengkap. -x mewajibkan seluruh nama atau baris perintah terpilih cocok, tetapi tidak mengubah metakarakter regex menjadi literal. -a hanya mengubah keluaran yang ditampilkan; tidak mengaktifkan pencocokan -f. -u memilih pengguna efektif, -U pengguna nyata, dan -P anak langsung dari PID induk; kriteria berbeda digabung dengan AND. Pola boleh dikosongkan di sini jika salah satu filter tersebut diisi. -n memilih kecocokan terbaru dan -o terlama menurut waktu mulai, bukan aktivitas CPU; proses yang dimulai dalam satu tick jam mungkin tidak dapat dibedakan. pgrep berguna untuk memeriksa calon kecocokan sebelum pkill, tetapi proses dan PID dapat berubah antar perintah. Browser tidak memeriksa proses atau mengevaluasi kecocokan regex.",
  },
  syntax:
    "pgrep [-f] [-x] [-i] [-l | -a | -c] [-n | -o] [-u user] [-U user] [-P positive-parent-pid] [-- pattern]",
  choices: [
    {
      id: "matching",
      label: { en: "Matching mode", id: "Mode pencocokan" },
      description: {
        en: "Process name is the default. Full command-line matching includes arguments and wrappers; exact matching remains regex-based in both modes.",
        id: "Nama proses adalah bawaan. Pencocokan baris perintah lengkap mencakup argumen dan pembungkus; pencocokan penuh tetap berbasis regex pada kedua mode.",
      },
      defaultValue: "name",
      items: [
        { value: "name", label: { en: "Process name", id: "Nama proses" } },
        {
          value: "full",
          label: {
            en: "Full command line (-f)",
            id: "Baris perintah lengkap (-f)",
          },
        },
      ],
    },
    {
      id: "output",
      label: { en: "Output mode", id: "Mode keluaran" },
      description: {
        en: "Choose one format. Listing a full command (-a) changes output, not matching. Count (-c) counts selected matches; newest/oldest selection limits that set.",
        id: "Pilih satu format. Menampilkan perintah lengkap (-a) mengubah keluaran, bukan pencocokan. Hitungan (-c) menghitung kecocokan terpilih; seleksi terbaru/terlama membatasi kumpulan itu.",
      },
      defaultValue: "pids",
      items: [
        { value: "pids", label: { en: "PID only", id: "Hanya PID" } },
        {
          value: "name",
          label: {
            en: "PID and process name (-l)",
            id: "PID dan nama proses (-l)",
          },
        },
        {
          value: "command",
          label: {
            en: "PID and full command line (-a)",
            id: "PID dan baris perintah lengkap (-a)",
          },
        },
        {
          value: "count",
          label: { en: "Count matches (-c)", id: "Hitung kecocokan (-c)" },
        },
      ],
    },
    {
      id: "age",
      label: { en: "Start-time selection", id: "Seleksi waktu mulai" },
      description: {
        en: "Select all, newest, or oldest matching processes. Newest and oldest are alternatives. A user/parent filter or pattern is still required by this builder.",
        id: "Pilih semua, terbaru, atau terlama dari proses yang cocok. Terbaru dan terlama adalah alternatif. Builder ini tetap memerlukan filter pengguna/induk atau pola.",
      },
      defaultValue: "all",
      items: [
        { value: "all", label: { en: "All matches", id: "Semua kecocokan" } },
        {
          value: "newest",
          label: { en: "Newest match (-n)", id: "Kecocokan terbaru (-n)" },
        },
        {
          value: "oldest",
          label: { en: "Oldest match (-o)", id: "Kecocokan terlama (-o)" },
        },
      ],
    },
  ],
  options: [
    ...processMatchingOptions.map((option) =>
      option.id === "full"
        ? { ...option, choice: { field: "matching", value: "full" } }
        : option,
    ),
    {
      id: "nameOutput",
      flag: "-l",
      choice: { field: "output", value: "name" },
      label: { en: "List names", id: "Tampilkan nama" },
      description: {
        en: "Display PID and process name.",
        id: "Tampilkan PID dan nama proses.",
      },
    },
    {
      id: "commandOutput",
      flag: "-a",
      choice: { field: "output", value: "command" },
      label: { en: "List full commands", id: "Tampilkan perintah lengkap" },
      description: {
        en: "Display PID and full command line without changing pattern matching mode.",
        id: "Tampilkan PID dan baris perintah lengkap tanpa mengubah mode pencocokan pola.",
      },
    },
    {
      id: "countOutput",
      flag: "-c",
      choice: { field: "output", value: "count" },
      label: { en: "Count", id: "Hitungan" },
      description: {
        en: "Display the number of selected matching processes instead of PID rows. Zero matches normally return a nonzero exit status.",
        id: "Tampilkan jumlah proses cocok yang terpilih, bukan baris PID. Nol kecocokan biasanya mengembalikan status keluar bukan nol.",
      },
    },
    {
      id: "newestSelection",
      flag: "-n",
      choice: { field: "age", value: "newest" },
      label: { en: "Newest", id: "Terbaru" },
      description: {
        en: "Select the most recently started matching process; clock-tick ties can be ambiguous.",
        id: "Pilih proses cocok yang paling baru dimulai; waktu sama dalam satu tick dapat ambigu.",
      },
    },
    {
      id: "oldestSelection",
      flag: "-o",
      choice: { field: "age", value: "oldest" },
      label: { en: "Oldest", id: "Terlama" },
      description: {
        en: "Select the least recently started matching process; this is not a CPU-time sort.",
        id: "Pilih proses cocok yang paling lama dimulai; ini bukan pengurutan waktu CPU.",
      },
    },
  ],
  arguments: [
    {
      id: "pattern",
      required: false,
      placeholder: "nginx",
      label: {
        en: "Process pattern (extended regex)",
        id: "Pola proses (regex extended)",
      },
      description: {
        en: "Required unless an effective user, real user, or parent PID is supplied. Leave completely empty to omit; whitespace-only patterns are rejected. Enter regex without shell quotes; spaces, apostrophes, and leading hyphens are serialized literally for the shell.",
        id: "Wajib kecuali pengguna efektif, pengguna nyata, atau PID induk diisi. Kosongkan sepenuhnya untuk menghilangkan pola; pola yang hanya berisi spasi ditolak. Masukkan regex tanpa kutip shell; spasi, apostrof, dan tanda hubung awal diserialisasi secara literal untuk shell.",
      },
    },
    processUserArgument,
    {
      ...processUserArgument,
      id: "realUsername",
      label: { en: "Real username (-U)", id: "Nama pengguna nyata (-U)" },
      description: {
        en: "Optional common real-account name. If -u is also supplied, both identity criteria must match. The account is not verified.",
        id: "Nama akun nyata umum opsional. Jika -u juga diisi, kedua kriteria identitas harus cocok. Akun tidak diverifikasi.",
      },
    },
    {
      id: "parentPid",
      required: false,
      placeholder: "1234",
      label: { en: "Parent PID (-P)", id: "PID induk (-P)" },
      description: {
        en: "Optional positive integer (1–2147483647). Selects immediate children, not the parent or all descendants; no process is checked. This filter allows omitting the pattern.",
        id: "Bilangan bulat positif opsional (1–2147483647). Memilih anak langsung, bukan induk atau semua turunan; proses tidak diperiksa. Filter ini mengizinkan pola dikosongkan.",
      },
    },
  ],
  form: {
    kind: "grouped",
    groups: [
      {
        id: "matching",
        title: { en: "Process matching", id: "Pencocokan proses" },
        fields: ["pattern", "matching", "exact", "ignoreCase"],
      },
      {
        id: "filters",
        title: {
          en: "User and parent-process filters",
          id: "Filter pengguna dan proses induk",
        },
        fields: ["username", "realUsername", "parentPid"],
      },
      {
        id: "output",
        title: { en: "Output format", id: "Format keluaran" },
        fields: ["output"],
      },
      {
        id: "advanced",
        title: { en: "Advanced selection", id: "Seleksi lanjutan" },
        fields: ["age"],
        advanced: true,
      },
    ],
  },
  concepts: processConcepts,
  comparison: [
    {
      command: "ps",
      description: {
        en: "Display process information.",
        id: "Tampilkan informasi proses.",
      },
    },
    {
      command: "pgrep",
      description: {
        en: "Find processes matching criteria and list IDs, names, commands, or counts.",
        id: "Cari proses yang cocok dengan kriteria dan tampilkan ID, nama, perintah, atau hitungan.",
      },
    },
    {
      command: "kill",
      description: {
        en: "Send signals to specified PIDs.",
        id: "Kirim sinyal ke PID yang ditentukan.",
      },
    },
    {
      command: "pkill",
      description: {
        en: "Send signals to processes matching criteria. Inspecting with pgrep first can help, but does not guarantee safety.",
        id: "Kirim sinyal ke proses yang cocok dengan kriteria. Memeriksa dengan pgrep terlebih dahulu dapat membantu, tetapi tidak menjamin keamanan.",
      },
    },
  ],
  warnings: [
    {
      en: "This generates an inspection command, not results. No real processes, users, PIDs, or regex matches are verified. Full command-line output can reveal sensitive arguments when run manually. Reviewing pgrep output before pkill is subject to PID reuse and changing matches; it is not a guarantee of safe signaling.",
      id: "Ini menghasilkan perintah pemeriksaan, bukan hasil. Proses, pengguna, PID, atau kecocokan regex sebenarnya tidak diverifikasi. Keluaran baris perintah lengkap dapat mengungkap argumen sensitif saat dijalankan secara manual. Memeriksa keluaran pgrep sebelum pkill tetap dipengaruhi penggunaan ulang PID dan perubahan kecocokan; ini bukan jaminan pemberian sinyal yang aman.",
    },
  ],
  examples: [
    {
      command: "pgrep nginx",
      description: {
        en: "Find PIDs by process-name regex.",
        id: "Cari PID menurut regex nama proses.",
      },
    },
    {
      command: "pgrep -l nginx",
      description: {
        en: "Include process names.",
        id: "Sertakan nama proses.",
      },
    },
    {
      command: "pgrep -a node",
      description: {
        en: "Display full command lines while still matching process names.",
        id: "Tampilkan baris perintah lengkap sambil tetap mencocokkan nama proses.",
      },
    },
    {
      command: "pgrep -f 'node server.js'",
      description: {
        en: "Match a full command-line regex; the dot remains a regex metacharacter.",
        id: "Cocokkan regex baris perintah lengkap; titik tetap metakarakter regex.",
      },
    },
    {
      command: "pgrep -x nginx",
      description: {
        en: "Match the entire name against the regex.",
        id: "Cocokkan seluruh nama terhadap regex.",
      },
    },
    {
      command: "pgrep -i firefox",
      description: { en: "Ignore case.", id: "Abaikan huruf besar/kecil." },
    },
    {
      command: "pgrep -u root sshd",
      description: {
        en: "Filter by effective user.",
        id: "Filter menurut pengguna efektif.",
      },
    },
    {
      command: "pgrep -U alice bash",
      description: {
        en: "Filter by real user.",
        id: "Filter menurut pengguna nyata.",
      },
    },
    {
      command: "pgrep -P 1234",
      description: {
        en: "Find immediate children without a pattern.",
        id: "Cari anak langsung tanpa pola.",
      },
    },
    {
      command: "pgrep -n python",
      description: {
        en: "Select the newest matching process.",
        id: "Pilih proses cocok terbaru.",
      },
    },
    {
      command: "pgrep -o nginx",
      description: {
        en: "Select the oldest matching process.",
        id: "Pilih proses cocok terlama.",
      },
    },
    {
      command: "pgrep -c sshd",
      description: {
        en: "Count selected matches.",
        id: "Hitung kecocokan terpilih.",
      },
    },
  ],
};
