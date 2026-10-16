import type { CommandDefinition } from "../types";

export const cp: CommandDefinition = {
  id: "cp",
  name: "cp",
  category: "files",
  form: { kind: "basic" },
  description: {
    en: "Copy files or directory trees to a destination.",
    id: "Salin file atau pohon direktori ke tujuan.",
  },
  explanation: {
    en: "cp leaves the source in place, unlike mv. For one source, a destination directory receives the source by name; otherwise the destination is the new file name. Multiple sources require an existing destination directory. -r copies directory trees; -a also preserves links and as many attributes as possible. -p requests mode, ownership, and timestamps where permitted. Attribute preservation depends on privileges and filesystem support.",
    id: "cp mempertahankan sumber, berbeda dari mv. Untuk satu sumber, direktori tujuan menerima sumber dengan namanya; jika bukan direktori, tujuan menjadi nama file baru. Beberapa sumber memerlukan direktori tujuan yang sudah ada. -r menyalin pohon direktori; -a juga mempertahankan tautan dan sebanyak mungkin atribut. -p meminta mode, kepemilikan, dan timestamp jika diizinkan. Pelestarian atribut bergantung pada hak akses dan dukungan sistem file.",
  },
  syntax: "cp [-a | [-r] [-p]] [-i | -n] [-u] [-v] -- source... destination",
  choices: [
    {
      id: "copyMode",
      label: { en: "Copy mode", id: "Mode salin" },
      description: {
        en: "Archive mode includes recursion and preservation; redundant -r and -p are omitted.",
        id: "Mode arsip mencakup rekursi dan pelestarian; -r dan -p yang berlebihan dihilangkan.",
      },
      defaultValue: "standard",
      items: [
        {
          value: "standard",
          label: { en: "Standard copy", id: "Salin standar" },
        },
        { value: "archive", label: { en: "Archive (-a)", id: "Arsip (-a)" } },
      ],
    },
    {
      id: "overwrite",
      label: { en: "Overwrite behavior", id: "Perilaku penimpaan" },
      description: {
        en: "Default may overwrite. Choose one mode; update (-u) cannot be combined with no-clobber (-n) here.",
        id: "Bawaan dapat menimpa. Pilih satu mode; pembaruan (-u) tidak dapat digabungkan dengan tanpa penimpaan (-n) di sini.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: { en: "Default behavior", id: "Perilaku bawaan" },
        },
        {
          value: "interactive",
          label: {
            en: "Ask before overwriting (-i)",
            id: "Tanya sebelum menimpa (-i)",
          },
        },
        {
          value: "noClobber",
          label: { en: "Do not overwrite (-n)", id: "Jangan timpa (-n)" },
        },
      ],
    },
  ],
  options: [
    {
      id: "archive",
      flag: "-a",
      choice: { field: "copyMode", value: "archive" },
      label: { en: "Archive", id: "Arsip" },
      description: {
        en: "Recursive copying with link and attribute preservation; broader than -r alone.",
        id: "Salin rekursif dengan pelestarian tautan dan atribut; lebih luas daripada -r saja.",
      },
    },
    {
      id: "recursive",
      flag: "-r",
      when: { field: "copyMode", value: "standard" },
      label: {
        en: "Copy directories recursively",
        id: "Salin direktori secara rekursif",
      },
      description: {
        en: "Copy directory contents and descendants. GNU -R is an equivalent spelling; this builder uses -r.",
        id: "Salin isi direktori dan turunannya. GNU -R adalah penulisan setara; pembuat ini menggunakan -r.",
      },
    },
    {
      id: "interactive",
      flag: "-i",
      choice: { field: "overwrite", value: "interactive" },
      label: { en: "Interactive overwrite", id: "Penimpaan interaktif" },
      description: {
        en: "Ask before overwriting an existing destination file.",
        id: "Tanya sebelum menimpa file tujuan yang sudah ada.",
      },
    },
    {
      id: "noClobber",
      flag: "-n",
      choice: { field: "overwrite", value: "noClobber" },
      label: { en: "No clobber", id: "Tanpa penimpaan" },
      description: {
        en: "Skip existing destination files. GNU deprecates -n; exit-status behavior varies across implementations.",
        id: "Lewati file tujuan yang sudah ada. GNU tidak lagi menganjurkan -n; perilaku status keluar berbeda antarimplementasi.",
      },
    },
    {
      id: "update",
      flag: "-u",
      label: { en: "Update only", id: "Hanya perbarui" },
      description: {
        en: "Copy non-directory files only when missing or newer than the destination; -n would make this redundant.",
        id: "Salin file bukan direktori hanya jika tujuan belum ada atau sumber lebih baru; -n membuat opsi ini berlebihan.",
      },
    },
    {
      id: "verbose",
      flag: "-v",
      label: { en: "Verbose output", id: "Keluaran terperinci" },
      description: {
        en: "Display what is being copied.",
        id: "Tampilkan apa yang disalin.",
      },
    },
    {
      id: "preserve",
      flag: "-p",
      when: { field: "copyMode", value: "standard" },
      label: { en: "Preserve attributes", id: "Pertahankan atribut" },
      description: {
        en: "Preserve mode, ownership, and timestamps where permitted.",
        id: "Pertahankan mode, kepemilikan, dan timestamp jika diizinkan.",
      },
    },
  ],
  arguments: [
    {
      id: "sources",
      label: { en: "Source paths", id: "Jalur sumber" },
      description: {
        en: "One literal source per row. Copying directories needs -r or -a. Paths are not verified.",
        id: "Satu sumber literal per baris. Menyalin direktori memerlukan -r atau -a. Jalur tidak diverifikasi.",
      },
      required: true,
      multiple: true,
      placeholder: "file.txt",
    },
    {
      id: "destination",
      label: { en: "Destination path", id: "Jalur tujuan" },
      description: {
        en: "For multiple sources this must be an existing directory. For one source it may be a directory or a new file name.",
        id: "Untuk beberapa sumber, tujuan harus berupa direktori yang sudah ada. Untuk satu sumber, tujuan dapat berupa direktori atau nama file baru.",
      },
      required: true,
      placeholder: "./backup/",
    },
  ],
  warnings: [
    {
      en: "Running this text may overwrite destination data. The app cannot check paths, file types, symlinks, or permissions. These options assume common GNU/Linux cp, not every Unix implementation.",
      id: "Menjalankan teks ini dapat menimpa data tujuan. Aplikasi tidak dapat memeriksa jalur, jenis file, tautan simbolis, atau izin. Opsi ini mengasumsikan cp GNU/Linux yang umum, bukan setiap implementasi Unix.",
    },
  ],
  examples: [
    {
      command: "cp file.txt backup.txt",
      description: {
        en: "Copy a file with a new name; leave the source in place.",
        id: "Salin file dengan nama baru; pertahankan sumber.",
      },
    },
    {
      command: "cp file.txt ./backup/",
      description: {
        en: "Copy into an existing directory.",
        id: "Salin ke direktori yang sudah ada.",
      },
    },
    {
      command: "cp -r project/ backup/",
      description: {
        en: "Copy a directory tree recursively.",
        id: "Salin pohon direktori secara rekursif.",
      },
    },
    {
      command: "cp -iv source.txt destination.txt",
      description: {
        en: "Ask before overwriting and display the copy operation.",
        id: "Tanya sebelum menimpa dan tampilkan operasi salin.",
      },
    },
    {
      command: "cp -a project/ project-backup/",
      description: {
        en: "Copy recursively with archive preservation semantics.",
        id: "Salin secara rekursif dengan pelestarian mode arsip.",
      },
    },
    {
      command: "cp -u report.txt ./archive/",
      description: {
        en: "Copy when missing or newer than the destination.",
        id: "Salin jika tujuan belum ada atau sumber lebih baru.",
      },
    },
    {
      command: "cp file1.txt file2.txt backup/",
      description: {
        en: "Copy two sources into an existing destination directory.",
        id: "Salin dua sumber ke direktori tujuan yang sudah ada.",
      },
    },
  ],
};
