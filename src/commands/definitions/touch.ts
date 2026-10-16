import type { CommandDefinition } from "../types";

export const touch: CommandDefinition = {
  id: "touch",
  name: "touch",
  category: "files",
  form: { kind: "basic" },
  description: {
    en: "Create empty files or update timestamps.",
    id: "Buat file kosong atau perbarui timestamp.",
  },
  explanation: {
    en: "touch updates timestamps on existing files and creates empty files when targets are missing, unless -c is selected. Access time records access to file data; modification time records changes to its contents. By default both are changed. -a and -m can be selected together to change both. The source can be current time, a reference file, or a specified timestamp; -r and -t are alternatives. touch does not erase existing file contents.",
    id: "touch memperbarui timestamp file yang sudah ada dan membuat file kosong untuk tujuan yang belum ada, kecuali -c dipilih. Waktu akses mencatat akses ke data file; waktu modifikasi mencatat perubahan isinya. Secara bawaan keduanya diubah. -a dan -m dapat dipilih bersama untuk mengubah keduanya. Sumbernya dapat berupa waktu saat ini, file referensi, atau timestamp tertentu; -r dan -t adalah alternatif. touch tidak menghapus isi file yang sudah ada.",
  },
  syntax:
    "touch [-a] [-m] [-c] [-r reference | -t CCYYMMDDhhmm[.ss]] -- path...",
  choices: [
    {
      id: "source",
      label: { en: "Timestamp source", id: "Sumber timestamp" },
      description: {
        en: "Choose one source. Explicit timestamps use the terminal environment time zone, not the browser time zone.",
        id: "Pilih satu sumber. Timestamp eksplisit menggunakan zona waktu lingkungan terminal, bukan zona waktu browser.",
      },
      defaultValue: "now",
      items: [
        { value: "now", label: { en: "Current time", id: "Waktu saat ini" } },
        {
          value: "reference",
          label: { en: "Reference file (-r)", id: "File referensi (-r)" },
        },
        {
          value: "timestamp",
          label: {
            en: "Explicit timestamp (-t)",
            id: "Timestamp eksplisit (-t)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "access",
      flag: "-a",
      label: { en: "Access time", id: "Waktu akses" },
      description: {
        en: "Change access time only, unless -m is also selected.",
        id: "Ubah hanya waktu akses, kecuali -m juga dipilih.",
      },
    },
    {
      id: "modify",
      flag: "-m",
      label: { en: "Modification time", id: "Waktu modifikasi" },
      description: {
        en: "Change modification time only, unless -a is also selected.",
        id: "Ubah hanya waktu modifikasi, kecuali -a juga dipilih.",
      },
    },
    {
      id: "noCreate",
      flag: "-c",
      label: { en: "Do not create files", id: "Jangan buat file" },
      description: {
        en: "Skip missing target files without creating them.",
        id: "Lewati file tujuan yang belum ada tanpa membuatnya.",
      },
    },
    {
      id: "referenceSource",
      flag: "-r",
      choice: { field: "source", value: "reference" },
      label: { en: "Reference source", id: "Sumber referensi" },
      description: {
        en: "Copy the selected timestamps from a reference file.",
        id: "Salin timestamp yang dipilih dari file referensi.",
      },
    },
    {
      id: "explicitSource",
      flag: "-t",
      choice: { field: "source", value: "timestamp" },
      label: { en: "Explicit source", id: "Sumber eksplisit" },
      description: {
        en: "Use CCYYMMDDhhmm with optional .ss (00–59). Short year formats and leap seconds are not supported by this builder.",
        id: "Gunakan CCYYMMDDhhmm dengan .ss opsional (00–59). Format tahun pendek dan detik kabisat tidak didukung pembuat ini.",
      },
    },
  ],
  arguments: [
    {
      id: "paths",
      label: { en: "Target file paths", id: "Jalur file tujuan" },
      description: {
        en: "One literal file path per row. A target named - is written as ./- to avoid GNU touch standard-output behavior.",
        id: "Satu jalur file literal per baris. Tujuan bernama - ditulis sebagai ./- untuk menghindari perilaku keluaran standar GNU touch.",
      },
      required: true,
      multiple: true,
      placeholder: "notes.txt",
    },
    {
      id: "reference",
      label: { en: "Reference file", id: "File referensi" },
      description: {
        en: "A literal path to the file whose timestamps should be used; existence is not checked.",
        id: "Jalur literal file yang timestamp-nya akan digunakan; keberadaannya tidak diperiksa.",
      },
      required: true,
      placeholder: "reference.txt",
      when: { field: "source", value: "reference" },
    },
    {
      id: "timestamp",
      label: {
        en: "Timestamp (CCYYMMDDhhmm[.ss])",
        id: "Timestamp (CCYYMMDDhhmm[.ss])",
      },
      description: {
        en: "Example: 202610140930 means 14 October 2026, 09:30 in the terminal time zone. Calendar validity is checked, not filesystem/time-zone support.",
        id: "Contoh: 202610140930 berarti 14 Oktober 2026, 09:30 dalam zona waktu terminal. Validitas kalender diperiksa, bukan dukungan sistem file/zona waktu.",
      },
      required: true,
      placeholder: "202610140930",
      format: "timestamp",
      when: { field: "source", value: "timestamp" },
    },
  ],
  warnings: [
    {
      en: "Running this text may create files or change timestamps. No file has been created by this app. Filesystem precision, permissions, and time-zone rules may affect results.",
      id: "Menjalankan teks ini dapat membuat file atau mengubah timestamp. Tidak ada file yang dibuat oleh aplikasi ini. Presisi sistem file, izin, dan aturan zona waktu dapat memengaruhi hasilnya.",
    },
  ],
  examples: [
    {
      command: "touch notes.txt",
      description: {
        en: "Create a missing file or update both timestamps.",
        id: "Buat file yang belum ada atau perbarui kedua timestamp.",
      },
    },
    {
      command: "touch file1.txt file2.txt",
      description: {
        en: "Use two target files.",
        id: "Gunakan dua file tujuan.",
      },
    },
    {
      command: "touch -c existing.txt",
      description: {
        en: "Update only if the file already exists.",
        id: "Perbarui hanya jika file sudah ada.",
      },
    },
    {
      command: "touch -m report.txt",
      description: {
        en: "Update only the modification time.",
        id: "Perbarui hanya waktu modifikasi.",
      },
    },
    {
      command: "touch -r reference.txt target.txt",
      description: {
        en: "Copy timestamps from a reference file.",
        id: "Salin timestamp dari file referensi.",
      },
    },
    {
      command: "touch -t 202610140930 document.txt",
      description: {
        en: "Request a specific local date and time.",
        id: "Minta tanggal dan waktu lokal tertentu.",
      },
    },
  ],
};
