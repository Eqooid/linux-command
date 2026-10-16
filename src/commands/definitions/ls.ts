import type { CommandDefinition } from "../types";

export const ls: CommandDefinition = {
  id: "ls",
  name: "ls",
  category: "navigation",
  form: { kind: "basic" },
  description: {
    en: "List files and directories.",
    id: "Tampilkan daftar file dan direktori.",
  },
  explanation: {
    en: "ls lists directory contents, or the current directory when no path is given. These options target common GNU/Linux ls; other Unix implementations may differ. Select one hidden-entry mode and one primary sort mode. -h is most useful with -l, which displays sizes.",
    id: "ls menampilkan isi direktori, atau direktori saat ini jika jalur kosong. Opsi ini ditujukan untuk ls GNU/Linux yang umum; implementasi Unix lainnya dapat berbeda. Pilih satu mode entri tersembunyi dan satu mode pengurutan utama. -h paling berguna dengan -l yang menampilkan ukuran.",
  },
  syntax: "ls [-l | -1] [-a | -A] [-h] [-R] [-t | -S] [-r] [-d] [-- path]",
  choices: [
    {
      id: "visibility",
      label: { en: "Hidden entries", id: "Entri tersembunyi" },
      description: {
        en: "-a and -A are alternative visibility modes.",
        id: "-a dan -A merupakan pilihan mode tampilan alternatif.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: {
            en: "Default (no hidden entries)",
            id: "Bawaan (tanpa entri tersembunyi)",
          },
        },
        { value: "all", label: { en: "All (-a)", id: "Semua (-a)" } },
        {
          value: "almostAll",
          label: {
            en: "Hidden except . and .. (-A)",
            id: "Tersembunyi kecuali . dan .. (-A)",
          },
        },
      ],
    },
    {
      id: "sort",
      label: { en: "Primary sort order", id: "Pengurutan utama" },
      description: {
        en: "Default sorts by name. -r reverses the selected order.",
        id: "Bawaan mengurutkan menurut nama. -r membalik urutan yang dipilih.",
      },
      defaultValue: "name",
      items: [
        { value: "name", label: { en: "Name", id: "Nama" } },
        {
          value: "time",
          label: { en: "Modification time (-t)", id: "Waktu perubahan (-t)" },
        },
        { value: "size", label: { en: "Size (-S)", id: "Ukuran (-S)" } },
      ],
    },
    {
      id: "layout",
      label: { en: "Listing format", id: "Format daftar" },
      description: {
        en: "Long listing and one entry per line are alternative formats.",
        id: "Daftar panjang dan satu entri per baris merupakan format alternatif.",
      },
      defaultValue: "default",
      items: [
        { value: "default", label: { en: "Default", id: "Bawaan" } },
        { value: "long", label: { en: "Long (-l)", id: "Panjang (-l)" } },
        {
          value: "one",
          label: { en: "One per line (-1)", id: "Satu per baris (-1)" },
        },
      ],
    },
  ],
  options: [
    {
      id: "long",
      flag: "-l",
      choice: { field: "layout", value: "long" },
      label: { en: "Long format", id: "Format panjang" },
      description: {
        en: "Show permissions, owner, size, and modification time.",
        id: "Tampilkan izin, pemilik, ukuran, dan waktu perubahan.",
      },
    },
    {
      id: "all",
      flag: "-a",
      choice: { field: "visibility", value: "all" },
      label: { en: "All entries", id: "Semua entri" },
      description: {
        en: "Include hidden names, including . and .. .",
        id: "Sertakan nama tersembunyi, termasuk . dan .. .",
      },
    },
    {
      id: "almostAll",
      flag: "-A",
      choice: { field: "visibility", value: "almostAll" },
      label: { en: "Almost all entries", id: "Hampir semua entri" },
      description: {
        en: "Include hidden names except . and .. .",
        id: "Sertakan nama tersembunyi kecuali . dan .. .",
      },
    },
    {
      id: "human",
      flag: "-h",
      label: { en: "Readable sizes", id: "Ukuran mudah dibaca" },
      description: {
        en: "Use units such as K and M when sizes are shown, such as with -l.",
        id: "Gunakan satuan seperti K dan M saat ukuran ditampilkan, misalnya dengan -l.",
      },
    },
    {
      id: "recursive",
      flag: "-R",
      label: { en: "Recursive listing", id: "Daftar rekursif" },
      description: {
        en: "List subdirectories recursively; output may be very large.",
        id: "Tampilkan subdirektori secara rekursif; keluaran dapat sangat besar.",
      },
    },
    {
      id: "time",
      flag: "-t",
      choice: { field: "sort", value: "time" },
      label: { en: "Sort by time", id: "Urutkan menurut waktu" },
      description: {
        en: "Sort by modification time, newest first.",
        id: "Urutkan menurut waktu perubahan, terbaru dahulu.",
      },
    },
    {
      id: "size",
      flag: "-S",
      choice: { field: "sort", value: "size" },
      label: { en: "Sort by size", id: "Urutkan menurut ukuran" },
      description: {
        en: "Sort by file size, largest first.",
        id: "Urutkan menurut ukuran file, terbesar dahulu.",
      },
    },
    {
      id: "reverse",
      flag: "-r",
      label: { en: "Reverse order", id: "Balik urutan" },
      description: {
        en: "Reverse the selected sorting order.",
        id: "Balik urutan pengurutan yang dipilih.",
      },
    },
    {
      id: "directory",
      flag: "-d",
      label: { en: "Directories themselves", id: "Direktori itu sendiri" },
      description: {
        en: "List directory entries themselves instead of their contents. -R has no effect with -d.",
        id: "Tampilkan entri direktori itu sendiri, bukan isinya. -R tidak berpengaruh bersama -d.",
      },
    },
    {
      id: "one",
      flag: "-1",
      choice: { field: "layout", value: "one" },
      label: { en: "One per line", id: "Satu per baris" },
      description: {
        en: "Print one entry per line instead of long format.",
        id: "Tampilkan satu entri per baris, bukan format panjang.",
      },
    },
  ],
  arguments: [
    {
      id: "path",
      label: { en: "Target path", id: "Jalur tujuan" },
      description: {
        en: "Optional literal path; ~, variables, and wildcards are not expanded.",
        id: "Jalur literal opsional; ~, variabel, dan wildcard tidak diperluas.",
      },
      required: false,
      placeholder: "./src",
    },
  ],
  warnings: [
    {
      en: "Recursive listing can produce large output. Paths and permissions are not verified by this app.",
      id: "Daftar rekursif dapat menghasilkan keluaran besar. Jalur dan izin tidak diperiksa oleh aplikasi ini.",
    },
  ],
  examples: [
    {
      command: "ls",
      description: {
        en: "List the current directory.",
        id: "Tampilkan direktori saat ini.",
      },
    },
    {
      command: "ls -la",
      description: {
        en: "Show detailed entries, including hidden names.",
        id: "Tampilkan detail entri, termasuk nama tersembunyi.",
      },
    },
    {
      command: "ls -lah",
      description: {
        en: "Add readable sizes to the detailed listing.",
        id: "Tambahkan ukuran mudah dibaca pada daftar detail.",
      },
    },
    {
      command: "ls -lt",
      description: {
        en: "Sort detailed entries by modification time.",
        id: "Urutkan entri detail menurut waktu perubahan.",
      },
    },
    {
      command: "ls -R ./src",
      description: {
        en: "List src and its subdirectories.",
        id: "Tampilkan src dan subdirektorinya.",
      },
    },
    {
      command: "ls -ld /var/log",
      description: {
        en: "Show metadata for the directory itself.",
        id: "Tampilkan metadata direktori itu sendiri.",
      },
    },
  ],
};
