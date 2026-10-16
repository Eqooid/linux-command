import type { CommandDefinition } from "../types";

export const cat: CommandDefinition = {
  id: "cat",
  name: "cat",
  category: "reading",
  form: { kind: "basic" },
  description: {
    en: "Display files in sequence or concatenate their contents.",
    id: "Tampilkan file berurutan atau gabungkan isinya.",
  },
  explanation: {
    en: "Concatenation means joining contents in order. cat writes each file to standard output, one after another, without adding a separator. It does not change the source files. Without a file, cat can read standard input, but this file-reading builder requires at least one path. Unlike less, cat does not provide interactive paging, so very large output is less convenient to navigate. In GNU cat, -b overrides -n; this builder selects only one numbering mode. -A includes -E and -T as well as other nonprinting-character notation.",
    id: "Konkatenasi berarti menggabungkan isi secara berurutan. cat menulis setiap file ke keluaran standar, satu demi satu, tanpa menambahkan pemisah. File sumber tidak diubah. Tanpa file, cat dapat membaca masukan standar, tetapi pembuat pembacaan file ini memerlukan setidaknya satu jalur. Berbeda dari less, cat tidak menyediakan penelusuran halaman interaktif, sehingga keluaran sangat besar kurang nyaman dinavigasi. Dalam GNU cat, -b mengesampingkan -n; pembuat ini memilih hanya satu mode penomoran. -A mencakup -E dan -T serta notasi karakter tak tercetak lainnya.",
  },
  syntax: "cat [-n | -b] [-s] [-A | [-E] [-T]] -- file...",
  choices: [
    {
      id: "numbering",
      label: { en: "Line numbering", id: "Penomoran baris" },
      description: {
        en: "Choose no numbering, all lines, or only non-empty lines (-b takes precedence over -n in GNU cat).",
        id: "Pilih tanpa penomoran, semua baris, atau hanya baris tidak kosong (-b mengesampingkan -n dalam GNU cat).",
      },
      defaultValue: "none",
      items: [
        {
          value: "none",
          label: { en: "No line numbers", id: "Tanpa nomor baris" },
        },
        {
          value: "all",
          label: { en: "All lines (-n)", id: "Semua baris (-n)" },
        },
        {
          value: "nonempty",
          label: { en: "Non-empty lines (-b)", id: "Baris tidak kosong (-b)" },
        },
      ],
    },
  ],
  options: [
    {
      id: "numberAll",
      flag: "-n",
      choice: { field: "numbering", value: "all" },
      label: { en: "Number all lines", id: "Nomori semua baris" },
      description: {
        en: "Number every output line, including empty lines.",
        id: "Nomori setiap baris keluaran, termasuk baris kosong.",
      },
    },
    {
      id: "numberNonempty",
      flag: "-b",
      choice: { field: "numbering", value: "nonempty" },
      label: { en: "Number non-empty lines", id: "Nomori baris tidak kosong" },
      description: {
        en: "Number only non-empty output lines; overrides -n in GNU cat.",
        id: "Nomori hanya baris keluaran tidak kosong; mengesampingkan -n dalam GNU cat.",
      },
    },
    {
      id: "squeeze",
      flag: "-s",
      label: { en: "Squeeze empty lines", id: "Ringkas baris kosong" },
      description: {
        en: "Reduce consecutive empty output lines to one.",
        id: "Ringkas baris keluaran kosong berturut-turut menjadi satu.",
      },
    },
    {
      id: "showAll",
      flag: "-A",
      label: {
        en: "Show invisible characters",
        id: "Tampilkan karakter tak terlihat",
      },
      description: {
        en: "Show nonprinting characters, tabs, and line endings (GNU -vET). Redundant -E and -T are omitted.",
        id: "Tampilkan karakter tak tercetak, tab, dan akhir baris (GNU -vET). -E dan -T yang berlebihan dihilangkan.",
      },
    },
    {
      id: "ends",
      flag: "-E",
      when: { field: "showAll", value: false },
      label: { en: "Mark line endings", id: "Tandai akhir baris" },
      description: {
        en: "Display $ at the end of each line.",
        id: "Tampilkan $ pada akhir setiap baris.",
      },
    },
    {
      id: "tabs",
      flag: "-T",
      when: { field: "showAll", value: false },
      label: { en: "Mark tabs", id: "Tandai tab" },
      description: {
        en: "Display tab characters as ^I.",
        id: "Tampilkan karakter tab sebagai ^I.",
      },
    },
  ],
  arguments: [
    {
      id: "paths",
      label: { en: "File paths", id: "Jalur file" },
      description: {
        en: "One literal file path per row, in output order. A filename - becomes ./- instead of standard input. No existence check is performed.",
        id: "Satu jalur file literal per baris, sesuai urutan keluaran. Nama file - menjadi ./-, bukan masukan standar. Keberadaan file tidak diperiksa.",
      },
      required: true,
      multiple: true,
      placeholder: "notes.txt",
    },
  ],
  warnings: [
    {
      en: "This app shows command text only, not file contents. Options target GNU cat. For large files, consider less for paging and searching in a terminal.",
      id: "Aplikasi ini hanya menampilkan teks perintah, bukan isi file. Opsi ditujukan untuk GNU cat. Untuk file besar, pertimbangkan less untuk penelusuran halaman dan pencarian dalam terminal.",
    },
  ],
  examples: [
    {
      command: "cat notes.txt",
      description: {
        en: "Write one file to standard output.",
        id: "Tulis satu file ke keluaran standar.",
      },
    },
    {
      command: "cat file1.txt file2.txt",
      description: {
        en: "Concatenate two files in the listed order.",
        id: "Gabungkan dua file sesuai urutan yang disebutkan.",
      },
    },
    {
      command: "cat -n notes.txt",
      description: {
        en: "Number all output lines.",
        id: "Nomori semua baris keluaran.",
      },
    },
    {
      command: "cat -b notes.txt",
      description: {
        en: "Number only non-empty lines.",
        id: "Nomori hanya baris tidak kosong.",
      },
    },
    {
      command: "cat -s output.log",
      description: {
        en: "Suppress repeated empty lines.",
        id: "Ringkas baris kosong berulang.",
      },
    },
    {
      command: "cat -A config.txt",
      description: {
        en: "Inspect nonprinting characters, tabs, and line endings.",
        id: "Periksa karakter tak tercetak, tab, dan akhir baris.",
      },
    },
  ],
};
