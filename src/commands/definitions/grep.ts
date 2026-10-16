import type { CommandDefinition } from "../types";

export const grep: CommandDefinition = {
  id: "grep",
  name: "grep",
  category: "searching",
  form: {
    kind: "grouped",
    groups: [
      {
        id: "pattern",
        title: {
          en: "Search pattern and matching mode",
          id: "Pola pencarian dan mode pencocokan",
        },
        fields: ["matchMode", "pattern"],
      },
      {
        id: "targets",
        title: {
          en: "Target files and directories",
          id: "File dan direktori tujuan",
        },
        fields: ["recursiveMode", "paths"],
      },
      {
        id: "output",
        title: { en: "Output options", id: "Opsi keluaran" },
        fields: ["outputMode", "numbers", "ignoreCase"],
      },
      {
        id: "advanced",
        title: {
          en: "Advanced: matching controls",
          id: "Lanjutan: kendali pencocokan",
        },
        fields: ["invert", "line", "word"],
        advanced: true,
      },
    ],
  },
  description: {
    en: "Search file contents for text or regular-expression patterns.",
    id: "Cari isi file berdasarkan teks atau pola ekspresi reguler.",
  },
  explanation: {
    en: "GNU grep selects lines of file content; find selects filesystem entries. Basic regex is the default: metacharacters may have meaning. Extended regex (-E) supports forms such as error|warning without BRE escapes. Fixed strings (-F) treat regex punctuation as literal text. Select fixed mode for literal searches such as user.name. By default matching lines are printed. -v instead selects nonmatching lines. -c counts selected lines, not individual occurrences; -l lists only files containing selected lines. grep can read stdin, but this builder requires explicit paths and has no pipeline input.",
    id: "GNU grep memilih baris isi file; find memilih entri sistem file. Regex dasar adalah bawaan: metakarakter dapat memiliki makna. Regex diperluas (-E) mendukung bentuk seperti error|warning tanpa escape BRE. String tetap (-F) memperlakukan tanda baca regex sebagai teks literal. Pilih mode tetap untuk pencarian literal seperti user.name. Secara bawaan baris yang cocok ditampilkan. -v memilih baris yang tidak cocok. -c menghitung baris terpilih, bukan kemunculan individual; -l hanya mencantumkan file yang mengandung baris terpilih. grep dapat membaca stdin, tetapi pembuat ini memerlukan jalur eksplisit dan tidak memiliki masukan pipeline.",
  },
  syntax:
    "grep [-i] [-n] [-r | -R] [-v] [-w | -x] [-E | -F] [-l | -c] -e pattern -- path...",
  choices: [
    {
      id: "matchMode",
      label: { en: "Pattern matching mode", id: "Mode pencocokan pola" },
      description: {
        en: "Basic/extended regex interpret metacharacters; fixed text does not. Patterns are not evaluated or regex-validated by this app.",
        id: "Regex dasar/diperluas menafsirkan metakarakter; teks tetap tidak. Pola tidak dievaluasi atau divalidasi sebagai regex oleh aplikasi ini.",
      },
      defaultValue: "basic",
      items: [
        {
          value: "basic",
          label: {
            en: "Basic regular expression (default)",
            id: "Ekspresi reguler dasar (bawaan)",
          },
        },
        {
          value: "extended",
          label: {
            en: "Extended regular expression (-E)",
            id: "Ekspresi reguler diperluas (-E)",
          },
        },
        {
          value: "fixed",
          label: { en: "Fixed text (-F)", id: "Teks tetap (-F)" },
        },
      ],
    },
    {
      id: "recursiveMode",
      label: { en: "Recursive search", id: "Pencarian rekursif" },
      description: {
        en: "-r follows symlinks listed directly as operands but skips symlinks found during traversal. -R follows all symlinks and may search outside the intended tree.",
        id: "-r mengikuti tautan simbolis yang disebutkan langsung sebagai operand, tetapi melewati tautan yang ditemukan saat penelusuran. -R mengikuti semua tautan simbolis dan dapat mencari di luar pohon yang dimaksud.",
      },
      defaultValue: "none",
      items: [
        { value: "none", label: { en: "Disabled", id: "Nonaktif" } },
        {
          value: "recursive",
          label: { en: "Recursive (-r)", id: "Rekursif (-r)" },
        },
        {
          value: "follow",
          label: {
            en: "Recursive, follow all symlinks (-R)",
            id: "Rekursif, ikuti semua tautan simbolis (-R)",
          },
        },
      ],
    },
    {
      id: "outputMode",
      label: { en: "Output display", id: "Tampilan keluaran" },
      description: {
        en: "Line numbers apply only to line output and are omitted for filenames or counts.",
        id: "Nomor baris hanya berlaku untuk keluaran baris dan dihilangkan untuk nama file atau hitungan.",
      },
      defaultValue: "lines",
      items: [
        {
          value: "lines",
          label: {
            en: "Selected lines (default)",
            id: "Baris terpilih (bawaan)",
          },
        },
        {
          value: "files",
          label: {
            en: "Matching filenames only (-l)",
            id: "Hanya nama file cocok (-l)",
          },
        },
        {
          value: "counts",
          label: {
            en: "Selected-line counts (-c)",
            id: "Hitungan baris terpilih (-c)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "ignoreCase",
      flag: "-i",
      label: { en: "Ignore case", id: "Abaikan huruf besar/kecil" },
      description: {
        en: "Match without case sensitivity, subject to locale rules.",
        id: "Cocokkan tanpa kepekaan huruf besar/kecil, sesuai aturan locale.",
      },
    },
    {
      id: "numbers",
      flag: "-n",
      when: { field: "outputMode", value: "lines" },
      label: { en: "Show line numbers", id: "Tampilkan nomor baris" },
      description: {
        en: "Prefix selected lines with their line number.",
        id: "Awali baris terpilih dengan nomor barisnya.",
      },
    },
    {
      id: "recursive",
      flag: "-r",
      choice: { field: "recursiveMode", value: "recursive" },
      label: { en: "Recursive", id: "Rekursif" },
      description: {
        en: "Search directories recursively without following symlinks encountered inside them.",
        id: "Cari direktori secara rekursif tanpa mengikuti tautan simbolis yang ditemukan di dalamnya.",
      },
    },
    {
      id: "follow",
      flag: "-R",
      choice: { field: "recursiveMode", value: "follow" },
      label: {
        en: "Follow symlinks recursively",
        id: "Ikuti tautan simbolis secara rekursif",
      },
      description: {
        en: "Follow all symbolic links during recursive search.",
        id: "Ikuti semua tautan simbolis saat pencarian rekursif.",
      },
    },
    {
      id: "invert",
      flag: "-v",
      label: { en: "Invert selection", id: "Balik pilihan" },
      description: {
        en: "Select lines that do not match; -c and -l then describe these selected lines.",
        id: "Pilih baris yang tidak cocok; -c dan -l kemudian menjelaskan baris terpilih ini.",
      },
    },
    {
      id: "word",
      flag: "-w",
      when: { field: "line", value: false },
      label: { en: "Whole words", id: "Kata utuh" },
      description: {
        en: "Require word boundaries (letters, digits, underscore are word constituents). Omitted when -x is selected.",
        id: "Wajibkan batas kata (huruf, digit, garis bawah adalah unsur kata). Dihilangkan jika -x dipilih.",
      },
    },
    {
      id: "line",
      flag: "-x",
      label: { en: "Whole lines", id: "Baris utuh" },
      description: {
        en: "Match the entire line; -w would be redundant and is omitted.",
        id: "Cocokkan seluruh baris; -w akan berlebihan dan dihilangkan.",
      },
    },
    {
      id: "extended",
      flag: "-E",
      choice: { field: "matchMode", value: "extended" },
      label: { en: "Extended regex", id: "Regex diperluas" },
      description: {
        en: "Interpret the pattern using GNU extended regular expressions.",
        id: "Tafsirkan pola menggunakan ekspresi reguler diperluas GNU.",
      },
    },
    {
      id: "fixed",
      flag: "-F",
      choice: { field: "matchMode", value: "fixed" },
      label: { en: "Fixed text", id: "Teks tetap" },
      description: {
        en: "Treat the pattern as literal text rather than a regex.",
        id: "Perlakukan pola sebagai teks literal, bukan regex.",
      },
    },
    {
      id: "filenames",
      flag: "-l",
      choice: { field: "outputMode", value: "files" },
      label: { en: "Filenames", id: "Nama file" },
      description: {
        en: "Print names of files containing selected lines.",
        id: "Tampilkan nama file yang mengandung baris terpilih.",
      },
    },
    {
      id: "counts",
      flag: "-c",
      choice: { field: "outputMode", value: "counts" },
      label: { en: "Line counts", id: "Hitungan baris" },
      description: {
        en: "Print the number of selected lines for each input file, not occurrences.",
        id: "Tampilkan jumlah baris terpilih untuk setiap file masukan, bukan kemunculan.",
      },
    },
  ],
  arguments: [
    {
      id: "pattern",
      label: { en: "Search pattern", id: "Pola pencarian" },
      description: {
        en: "Required; spaces are meaningful. The builder uses -e so a leading - stays a pattern. Shell quotes are added for you; regex meaning depends on the selected mode.",
        id: "Wajib; spasi bermakna. Pembuat menggunakan -e agar awalan - tetap menjadi pola. Kutip shell ditambahkan untuk Anda; makna regex bergantung pada mode yang dipilih.",
      },
      required: true,
      allowWhitespace: true,
      placeholder: "error",
    },
    {
      id: "paths",
      label: { en: "Target paths", id: "Jalur tujuan" },
      description: {
        en: "One literal file or directory per row. Directories need a recursive mode. *.ts is a literal filename here, not a shell glob; add individual files or use a directory recursively.",
        id: "Satu file atau direktori literal per baris. Direktori memerlukan mode rekursif. *.ts adalah nama file literal di sini, bukan glob shell; tambahkan file individual atau gunakan direktori secara rekursif.",
      },
      required: true,
      multiple: true,
      placeholder: "application.log",
    },
  ],
  warnings: [
    {
      en: "No files or regex matches are evaluated. GNU grep may reject invalid regex syntax or report permission/binary-file errors when run manually. Recursion may scan large trees, especially with -R. This app never runs grep or creates a pipeline.",
      id: "Tidak ada file atau kecocokan regex yang dievaluasi. GNU grep dapat menolak sintaks regex tidak valid atau melaporkan kesalahan izin/file biner saat dijalankan manual. Rekursi dapat memindai pohon besar, terutama dengan -R. Aplikasi ini tidak pernah menjalankan grep atau membuat pipeline.",
    },
  ],
  examples: [
    {
      command: 'grep "error" application.log',
      description: {
        en: "Select lines containing the basic regex error.",
        id: "Pilih baris yang mengandung regex dasar error.",
      },
    },
    {
      command: 'grep -i "warning" application.log',
      description: {
        en: "Ignore case when matching warning.",
        id: "Abaikan huruf besar/kecil saat mencocokkan warning.",
      },
    },
    {
      command: 'grep -n "TODO" src/main.ts',
      description: {
        en: "Show selected lines with line numbers.",
        id: "Tampilkan baris terpilih dengan nomor baris.",
      },
    },
    {
      command: 'grep -rn "error" ./logs',
      description: {
        en: "Search logs recursively and show line numbers.",
        id: "Cari log secara rekursif dan tampilkan nomor baris.",
      },
    },
    {
      command: 'grep -R "config" ./src',
      description: {
        en: "Follow all symbolic links during recursive search.",
        id: "Ikuti semua tautan simbolis saat pencarian rekursif.",
      },
    },
    {
      command: 'grep -v "DEBUG" application.log',
      description: {
        en: "Select lines without DEBUG.",
        id: "Pilih baris tanpa DEBUG.",
      },
    },
    {
      command: 'grep -w "error" application.log',
      description: { en: "Require a whole word.", id: "Wajibkan kata utuh." },
    },
    {
      command: 'grep -E "error|warning" application.log',
      description: {
        en: "Use extended-regex alternatives.",
        id: "Gunakan alternatif regex diperluas.",
      },
    },
    {
      command: 'grep -F "user.name" application.log',
      description: {
        en: "Match the dot literally as fixed text.",
        id: "Cocokkan titik secara literal sebagai teks tetap.",
      },
    },
    {
      command: 'grep -l -e "TODO" -- src/main.ts src/app.ts',
      description: {
        en: "List matching filenames from explicitly listed files. Shell *.ts examples require expansion outside this literal-path builder.",
        id: "Cantumkan nama file cocok dari file yang disebutkan eksplisit. Contoh shell *.ts memerlukan perluasan di luar pembuat jalur literal ini.",
      },
    },
    {
      command: 'grep -c "failed" application.log',
      description: {
        en: "Count selected lines, not individual matches.",
        id: "Hitung baris terpilih, bukan kecocokan individual.",
      },
    },
  ],
};
