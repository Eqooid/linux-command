import type { CommandDefinition } from "../types";

export const mv: CommandDefinition = {
  id: "mv",
  name: "mv",
  category: "files",
  form: { kind: "basic" },
  description: {
    en: "Move or rename files and directories.",
    id: "Pindahkan atau ubah nama file dan direktori.",
  },
  explanation: {
    en: "mv may rename a single source when the destination is a new name, or move sources into an existing directory. Multiple sources require a destination directory. Unlike cp, a successful move removes the old source location. Within a filesystem it may use a rename operation; across filesystems it generally copies then removes the source. A move is not always atomic and failures can leave partial results. -b makes backups of destinations that would be overwritten; backup names depend on GNU backup settings.",
    id: "mv dapat mengubah nama satu sumber jika tujuan adalah nama baru, atau memindahkan sumber ke direktori yang sudah ada. Beberapa sumber memerlukan direktori tujuan. Berbeda dari cp, pemindahan yang berhasil menghapus lokasi sumber lama. Dalam satu sistem file, mv dapat menggunakan operasi perubahan nama; antar sistem file, mv umumnya menyalin lalu menghapus sumber. Pemindahan tidak selalu atomik dan kegagalan dapat meninggalkan hasil sebagian. -b membuat cadangan tujuan yang akan ditimpa; nama cadangan bergantung pada pengaturan cadangan GNU.",
  },
  syntax: "mv [-i | -n | -f] [-u] [-v] [-b] -- source... destination",
  choices: [
    {
      id: "overwrite",
      label: { en: "Overwrite behavior", id: "Perilaku penimpaan" },
      description: {
        en: "Choose one behavior. No-clobber (-n) cannot be combined with backup (-b) or update (-u) in this builder.",
        id: "Pilih satu perilaku. Tanpa penimpaan (-n) tidak dapat digabungkan dengan cadangan (-b) atau pembaruan (-u) dalam pembuat ini.",
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
        {
          value: "force",
          label: {
            en: "Overwrite without prompting (-f)",
            id: "Timpa tanpa bertanya (-f)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "interactive",
      flag: "-i",
      choice: { field: "overwrite", value: "interactive" },
      label: { en: "Interactive overwrite", id: "Penimpaan interaktif" },
      description: {
        en: "Prompt before overwriting existing destination files.",
        id: "Tanya sebelum menimpa file tujuan yang sudah ada.",
      },
    },
    {
      id: "noClobber",
      flag: "-n",
      choice: { field: "overwrite", value: "noClobber" },
      label: { en: "No clobber", id: "Tanpa penimpaan" },
      description: {
        en: "Do not overwrite existing destinations. -n is deprecated by GNU; exit-status behavior varies.",
        id: "Jangan timpa tujuan yang sudah ada. GNU tidak lagi menganjurkan -n; perilaku status keluar berbeda.",
      },
    },
    {
      id: "force",
      flag: "-f",
      choice: { field: "overwrite", value: "force" },
      label: { en: "Force overwrite", id: "Paksa penimpaan" },
      description: {
        en: "Overwrite without prompting; existing destination data may be lost.",
        id: "Timpa tanpa bertanya; data tujuan yang sudah ada dapat hilang.",
      },
    },
    {
      id: "update",
      flag: "-u",
      label: { en: "Update only", id: "Hanya perbarui" },
      description: {
        en: "Move only when the destination is missing or older, subject to directory and filesystem behavior.",
        id: "Pindahkan hanya jika tujuan belum ada atau lebih lama, bergantung pada perilaku direktori dan sistem file.",
      },
    },
    {
      id: "verbose",
      flag: "-v",
      label: { en: "Verbose output", id: "Keluaran terperinci" },
      description: {
        en: "Display the move or rename operation.",
        id: "Tampilkan operasi pemindahan atau perubahan nama.",
      },
    },
    {
      id: "backup",
      flag: "-b",
      label: { en: "Backup before overwrite", id: "Cadangkan sebelum menimpa" },
      description: {
        en: "Back up an existing destination before replacement. Incompatible with -n.",
        id: "Cadangkan tujuan yang sudah ada sebelum penggantian. Tidak kompatibel dengan -n.",
      },
    },
  ],
  arguments: [
    {
      id: "sources",
      label: { en: "Source paths", id: "Jalur sumber" },
      description: {
        en: "One literal source per row. Files and directories use the same move syntax.",
        id: "Satu sumber literal per baris. File dan direktori menggunakan sintaks pemindahan yang sama.",
      },
      required: true,
      multiple: true,
      placeholder: "old.txt",
    },
    {
      id: "destination",
      label: { en: "Destination path", id: "Jalur tujuan" },
      description: {
        en: "A new name or destination directory. Multiple sources require an existing directory; the app cannot verify it.",
        id: "Nama baru atau direktori tujuan. Beberapa sumber memerlukan direktori yang sudah ada; aplikasi tidak dapat memverifikasinya.",
      },
      required: true,
      placeholder: "new.txt",
    },
  ],
  warnings: [
    {
      en: "Running this text can replace destination data and remove the old source location. Review every path. No path, directory type, permission, or atomicity guarantee is verified here.",
      id: "Menjalankan teks ini dapat mengganti data tujuan dan menghapus lokasi sumber lama. Periksa setiap jalur. Jalur, jenis direktori, izin, dan jaminan atomisitas tidak diverifikasi di sini.",
    },
  ],
  examples: [
    {
      command: "mv old.txt new.txt",
      description: {
        en: "Rename a file if new.txt is not a directory.",
        id: "Ubah nama file jika new.txt bukan direktori.",
      },
    },
    {
      command: "mv report.txt ./documents/",
      description: {
        en: "Move a file into an existing directory.",
        id: "Pindahkan file ke direktori yang sudah ada.",
      },
    },
    {
      command: "mv file1.txt file2.txt ./archive/",
      description: {
        en: "Move two sources into an existing directory.",
        id: "Pindahkan dua sumber ke direktori yang sudah ada.",
      },
    },
    {
      command: "mv -i config.json config.backup.json",
      description: {
        en: "Ask before overwriting a destination.",
        id: "Tanya sebelum menimpa tujuan.",
      },
    },
    {
      command: "mv -n source.txt destination.txt",
      description: {
        en: "Keep an existing destination unchanged.",
        id: "Pertahankan tujuan yang sudah ada.",
      },
    },
    {
      command: "mv -v old-folder/ new-folder/",
      description: {
        en: "Display a directory move or rename.",
        id: "Tampilkan pemindahan atau perubahan nama direktori.",
      },
    },
    {
      command: "mv -b settings.conf settings-old.conf",
      description: {
        en: "Back up an existing destination before replacement.",
        id: "Cadangkan tujuan yang sudah ada sebelum penggantian.",
      },
    },
  ],
};
