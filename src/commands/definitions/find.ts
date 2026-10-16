import type { CommandDefinition } from "../types";

export const find: CommandDefinition = {
  id: "find",
  name: "find",
  category: "searching",
  form: {
    kind: "grouped",
    groups: [
      {
        id: "location",
        title: { en: "Search location", id: "Lokasi pencarian" },
        fields: ["start"],
      },
      {
        id: "names",
        title: { en: "Name and type filters", id: "Filter nama dan jenis" },
        fields: ["nameCase", "fileType", "namePattern", "empty"],
      },
      {
        id: "size-age",
        title: {
          en: "Advanced: size and modification age",
          id: "Lanjutan: ukuran dan usia modifikasi",
        },
        fields: [
          "useSize",
          "sizeComparison",
          "sizeUnit",
          "size",
          "useMtime",
          "mtimeComparison",
          "mtime",
        ],
        advanced: true,
      },
      {
        id: "depth",
        title: {
          en: "Advanced: search depth",
          id: "Lanjutan: kedalaman pencarian",
        },
        fields: ["useMinDepth", "minDepth", "useMaxDepth", "maxDepth"],
        advanced: true,
      },
    ],
  },
  description: {
    en: "Find filesystem entries by name, type, size, age, and depth.",
    id: "Temukan entri sistem file menurut nama, jenis, ukuran, usia, dan kedalaman.",
  },
  explanation: {
    en: "GNU find recursively visits entries from the starting path. Every enabled filter must match (implicit AND); matched paths are printed by default. Unlike grep, find selects filesystem entries rather than searching file contents. -name and -iname use filename globs such as *.txt, not regular expressions. A type of Any omits -type; File uses -type f and Directory uses -type d. Depth zero is the starting point. -empty matches empty regular files or empty directories.",
    id: "GNU find mengunjungi entri secara rekursif dari jalur awal. Setiap filter aktif harus cocok (AND implisit); jalur yang cocok ditampilkan secara bawaan. Berbeda dari grep, find memilih entri sistem file, bukan mencari isi file. -name dan -iname menggunakan glob nama file seperti *.txt, bukan ekspresi reguler. Jenis Apa saja menghilangkan -type; File menggunakan -type f dan Direktori menggunakan -type d. Kedalaman nol adalah titik awal. -empty mencocokkan file biasa kosong atau direktori kosong.",
  },
  syntax:
    "find starting-path [-mindepth N] [-maxdepth N] [-type f|d] [-name glob | -iname glob] [-size [+-]N[c|k|M|G]] [-mtime [+-]N] [-empty]",
  choices: [
    {
      id: "nameCase",
      label: { en: "Filename case", id: "Huruf besar/kecil nama file" },
      description: {
        en: "Used only when a filename glob is provided. -iname ignores case.",
        id: "Digunakan hanya jika glob nama file diisi. -iname mengabaikan huruf besar/kecil.",
      },
      defaultValue: "sensitive",
      items: [
        {
          value: "sensitive",
          label: {
            en: "Case-sensitive (-name)",
            id: "Peka huruf besar/kecil (-name)",
          },
        },
        {
          value: "insensitive",
          label: {
            en: "Ignore case (-iname)",
            id: "Abaikan huruf besar/kecil (-iname)",
          },
        },
      ],
    },
    {
      id: "fileType",
      label: { en: "Entry type", id: "Jenis entri" },
      description: {
        en: "Any adds no type restriction. -type f selects regular files; -type d selects directories.",
        id: "Apa saja tidak membatasi jenis. -type f memilih file biasa; -type d memilih direktori.",
      },
      defaultValue: "any",
      items: [
        { value: "any", label: { en: "Any", id: "Apa saja" } },
        {
          value: "file",
          label: { en: "File (-type f)", id: "File (-type f)" },
        },
        {
          value: "directory",
          label: { en: "Directory (-type d)", id: "Direktori (-type d)" },
        },
      ],
    },
    {
      id: "sizeComparison",
      label: { en: "Size comparison", id: "Perbandingan ukuran" },
      description: {
        en: "Compare rounded unit counts, not arbitrary exact byte sizes.",
        id: "Bandingkan jumlah satuan yang dibulatkan, bukan ukuran byte tepat sembarang.",
      },
      defaultValue: "exact",
      when: { field: "useSize", value: true },
      items: [
        {
          value: "exact",
          label: {
            en: "Exactly N units (no prefix)",
            id: "Tepat N satuan (tanpa awalan)",
          },
        },
        {
          value: "greater",
          label: {
            en: "Greater than N units (+)",
            id: "Lebih dari N satuan (+)",
          },
        },
        {
          value: "less",
          label: {
            en: "Less than N units (-)",
            id: "Kurang dari N satuan (-)",
          },
        },
      ],
    },
    {
      id: "sizeUnit",
      label: { en: "Size unit", id: "Satuan ukuran" },
      description: {
        en: "GNU find rounds sizes up to whole units. 10M means a rounded count of 10 MiB units, not exactly 10 MiB. Use c for byte comparisons; -size -1M matches only empty files.",
        id: "GNU find membulatkan ukuran ke atas menjadi satuan utuh. 10M berarti hitungan bulat 10 satuan MiB, bukan tepat 10 MiB. Gunakan c untuk perbandingan byte; -size -1M hanya cocok dengan file kosong.",
      },
      defaultValue: "M",
      when: { field: "useSize", value: true },
      items: [
        { value: "c", label: { en: "Bytes (c)", id: "Byte (c)" } },
        { value: "k", label: { en: "KiB blocks (k)", id: "Blok KiB (k)" } },
        { value: "M", label: { en: "MiB blocks (M)", id: "Blok MiB (M)" } },
        { value: "G", label: { en: "GiB blocks (G)", id: "Blok GiB (G)" } },
      ],
    },
    {
      id: "mtimeComparison",
      label: {
        en: "Modification-age comparison",
        id: "Perbandingan usia modifikasi",
      },
      description: {
        en: "The age is rounded down to completed 24-hour periods. 7 means 7 to under 8 days; +7 means at least 8 completed days; -7 means fewer than 7 completed days. These are not calendar dates.",
        id: "Usia dibulatkan ke bawah menjadi periode 24 jam yang telah selesai. 7 berarti 7 hingga kurang dari 8 hari; +7 berarti setidaknya 8 hari penuh; -7 berarti kurang dari 7 hari penuh. Ini bukan tanggal kalender.",
      },
      defaultValue: "exact",
      when: { field: "useMtime", value: true },
      items: [
        {
          value: "exact",
          label: { en: "Exactly N completed days", id: "Tepat N hari penuh" },
        },
        {
          value: "greater",
          label: {
            en: "More than N completed days (+)",
            id: "Lebih dari N hari penuh (+)",
          },
        },
        {
          value: "less",
          label: {
            en: "Fewer than N completed days (-)",
            id: "Kurang dari N hari penuh (-)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "nameSensitive",
      flag: "-name",
      choice: { field: "nameCase", value: "sensitive" },
      label: { en: "Filename glob", id: "Glob nama file" },
      description: {
        en: "Case-sensitive matching of the basename using a quoted glob, such as *.txt.",
        id: "Pencocokan nama dasar yang peka huruf besar/kecil menggunakan glob berkutip, seperti *.txt.",
      },
    },
    {
      id: "nameInsensitive",
      flag: "-iname",
      choice: { field: "nameCase", value: "insensitive" },
      label: {
        en: "Case-insensitive filename glob",
        id: "Glob nama tanpa kepekaan huruf besar/kecil",
      },
      description: {
        en: "Match a basename glob without case sensitivity.",
        id: "Cocokkan glob nama dasar tanpa kepekaan huruf besar/kecil.",
      },
    },
    {
      id: "useSize",
      flag: "-size",
      label: { en: "Filter by size", id: "Filter menurut ukuran" },
      description: {
        en: "Enable a positive whole-number size comparison with an explicit unit.",
        id: "Aktifkan perbandingan ukuran bilangan bulat positif dengan satuan eksplisit.",
      },
    },
    {
      id: "useMtime",
      flag: "-mtime",
      label: {
        en: "Filter by modification age",
        id: "Filter menurut usia modifikasi",
      },
      description: {
        en: "Compare completed 24-hour periods since modification, using a nonnegative integer.",
        id: "Bandingkan periode 24 jam penuh sejak modifikasi menggunakan bilangan bulat nonnegatif.",
      },
    },
    {
      id: "useMinDepth",
      flag: "-mindepth",
      label: { en: "Set minimum depth", id: "Tetapkan kedalaman minimum" },
      description: {
        en: "Do not apply tests above this depth; zero is the starting point.",
        id: "Jangan terapkan pengujian di atas kedalaman ini; nol adalah titik awal.",
      },
    },
    {
      id: "useMaxDepth",
      flag: "-maxdepth",
      label: { en: "Set maximum depth", id: "Tetapkan kedalaman maksimum" },
      description: {
        en: "Do not descend below this depth; zero examines only the starting point.",
        id: "Jangan turun melewati kedalaman ini; nol hanya memeriksa titik awal.",
      },
    },
    {
      id: "empty",
      flag: "-empty",
      label: { en: "Empty entries only", id: "Hanya entri kosong" },
      description: {
        en: "Match empty regular files or empty directories. Combine with a type to restrict it.",
        id: "Cocokkan file biasa kosong atau direktori kosong. Gabungkan dengan jenis untuk membatasinya.",
      },
    },
  ],
  arguments: [
    {
      id: "start",
      label: { en: "Starting path", id: "Jalur awal" },
      description: {
        en: "Defaults to the current directory (.). One literal path; leading expression-like names receive ./ rather than relying on --.",
        id: "Bawaan adalah direktori saat ini (.). Satu jalur literal; nama berawalan mirip ekspresi diberi ./, bukan mengandalkan --.",
      },
      required: true,
      defaultValue: ".",
      placeholder: ".",
    },
    {
      id: "namePattern",
      label: { en: "Filename glob pattern", id: "Pola glob nama file" },
      description: {
        en: "Optional. Enter *.txt without shell quotes. It stays quoted in output so find, not the shell, interprets the glob.",
        id: "Opsional. Masukkan *.txt tanpa kutip shell. Keluaran tetap berkutip agar find, bukan shell, yang menafsirkan glob.",
      },
      required: false,
      placeholder: "*.txt",
    },
    {
      id: "size",
      label: { en: "Size value", id: "Nilai ukuran" },
      description: {
        en: "Positive integer, without a sign or unit. Choose the operator and unit above.",
        id: "Bilangan bulat positif, tanpa tanda atau satuan. Pilih operator dan satuan di atas.",
      },
      required: true,
      when: { field: "useSize", value: true },
      placeholder: "10",
    },
    {
      id: "mtime",
      label: { en: "Completed days", id: "Hari penuh" },
      description: {
        en: "Nonnegative integer. Zero is the first completed-day bucket; comparisons use elapsed time, not calendar dates.",
        id: "Bilangan bulat nonnegatif. Nol adalah kelompok hari penuh pertama; perbandingan menggunakan waktu berlalu, bukan tanggal kalender.",
      },
      required: true,
      when: { field: "useMtime", value: true },
      placeholder: "7",
    },
    {
      id: "minDepth",
      label: { en: "Minimum depth", id: "Kedalaman minimum" },
      description: {
        en: "Nonnegative integer, not greater than an enabled maximum.",
        id: "Bilangan bulat nonnegatif, tidak lebih besar dari maksimum yang aktif.",
      },
      required: true,
      when: { field: "useMinDepth", value: true },
      placeholder: "0",
    },
    {
      id: "maxDepth",
      label: { en: "Maximum depth", id: "Kedalaman maksimum" },
      description: {
        en: "Nonnegative integer. Depth zero refers to the starting path itself.",
        id: "Bilangan bulat nonnegatif. Kedalaman nol merujuk pada jalur awal itu sendiri.",
      },
      required: true,
      when: { field: "useMaxDepth", value: true },
      placeholder: "2",
    },
  ],
  warnings: [
    {
      en: "Searches may be large or encounter permission errors. Paths, glob matches, and file metadata are not checked here. The builder emits only GNU find search filters, never -delete, -exec, Boolean groups, pipes, or redirection.",
      id: "Pencarian dapat besar atau mengalami kesalahan izin. Jalur, kecocokan glob, dan metadata file tidak diperiksa di sini. Pembuat hanya menghasilkan filter pencarian GNU find, tidak pernah -delete, -exec, grup Boolean, pipe, atau pengalihan.",
    },
  ],
  examples: [
    {
      command: 'find . -name "*.txt"',
      description: {
        en: "Find names ending in .txt; quote the glob.",
        id: "Temukan nama berakhiran .txt; kutip glob.",
      },
    },
    {
      command: 'find /home/user -type f -name "*.pdf"',
      description: {
        en: "Find regular PDF-named files under a directory.",
        id: "Temukan file biasa bernama PDF di bawah direktori.",
      },
    },
    {
      command: 'find . -iname "*.jpg"',
      description: {
        en: "Ignore case when matching JPG filenames.",
        id: "Abaikan huruf besar/kecil saat mencocokkan nama JPG.",
      },
    },
    {
      command: 'find . -type d -name "node_modules"',
      description: {
        en: "Find directories with this exact basename.",
        id: "Temukan direktori dengan nama dasar tepat ini.",
      },
    },
    {
      command: "find . -type f -size +10M",
      description: {
        en: "Match regular files whose rounded MiB count is greater than 10.",
        id: "Cocokkan file biasa dengan hitungan MiB dibulatkan lebih dari 10.",
      },
    },
    {
      command: "find . -type f -mtime -7",
      description: {
        en: "Match fewer than seven completed 24-hour periods of age.",
        id: "Cocokkan usia kurang dari tujuh periode 24 jam penuh.",
      },
    },
    {
      command: "find . -maxdepth 2 -type f",
      description: {
        en: "Limit traversal to depth two and select regular files.",
        id: "Batasi penelusuran hingga kedalaman dua dan pilih file biasa.",
      },
    },
    {
      command: "find . -type f -empty",
      description: {
        en: "Find empty regular files.",
        id: "Temukan file biasa kosong.",
      },
    },
  ],
};
