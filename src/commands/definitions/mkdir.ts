import type { CommandDefinition } from "../types";

export const mkdir: CommandDefinition = {
  id: "mkdir",
  name: "mkdir",
  category: "files",
  form: { kind: "basic" },
  description: {
    en: "Create one or more directories.",
    id: "Buat satu atau beberapa direktori.",
  },
  explanation: {
    en: "mkdir creates each requested directory. Without -p, missing parent directories cause an error. With -p, missing parents are created and an already-existing directory is allowed. -p is never added automatically. -m sets the mode of explicitly requested directories, not parents created by -p; existing directories are not changed by -p.",
    id: "mkdir membuat setiap direktori yang diminta. Tanpa -p, direktori induk yang belum ada menyebabkan kesalahan. Dengan -p, direktori induk dibuat dan direktori yang sudah ada diizinkan. -p tidak pernah ditambahkan otomatis. -m menetapkan mode direktori yang diminta secara eksplisit, bukan induk yang dibuat oleh -p; direktori yang sudah ada tidak diubah oleh -p.",
  },
  syntax: "mkdir [-p] [-v] [-m mode] -- path...",
  options: [
    {
      id: "parents",
      flag: "-p",
      label: { en: "Create parents", id: "Buat direktori induk" },
      description: {
        en: "Create missing parents and allow an existing directory.",
        id: "Buat induk yang belum ada dan izinkan direktori yang sudah ada.",
      },
    },
    {
      id: "verbose",
      flag: "-v",
      label: { en: "Verbose output", id: "Keluaran terperinci" },
      description: {
        en: "Print a message for each created directory.",
        id: "Tampilkan pesan untuk setiap direktori yang dibuat.",
      },
    },
    {
      id: "setMode",
      flag: "-m",
      label: { en: "Set permissions", id: "Tetapkan izin" },
      description: {
        en: "Set an octal mode for requested directories, such as 755 or 0700.",
        id: "Tetapkan mode oktal untuk direktori yang diminta, seperti 755 atau 0700.",
      },
    },
  ],
  arguments: [
    {
      id: "paths",
      label: { en: "Directory paths", id: "Jalur direktori" },
      description: {
        en: "One literal path per row. Add rows for multiple directories; do not enter shell quotes.",
        id: "Satu jalur literal per baris. Tambahkan baris untuk beberapa direktori; jangan masukkan kutip shell.",
      },
      required: true,
      multiple: true,
      placeholder: "projects/react/src",
    },
    {
      id: "permissions",
      label: { en: "Octal permission mode", id: "Mode izin oktal" },
      description: {
        en: "Use 3 or 4 octal digits (0–7), for example 755 or 0700. Symbolic modes are outside this builder.",
        id: "Gunakan 3 atau 4 digit oktal (0–7), misalnya 755 atau 0700. Mode simbolis tidak didukung pembuat ini.",
      },
      required: true,
      placeholder: "755",
      format: "permissions",
      when: { field: "setMode", value: true },
    },
  ],
  warnings: [
    {
      en: "Running this text can create directories. Permission results can depend on the implementation, inherited filesystem attributes, and filesystem context. Review all paths; none are verified here.",
      id: "Menjalankan teks ini dapat membuat direktori. Hasil izin dapat bergantung pada implementasi, atribut sistem file yang diwarisi, dan konteks sistem file. Periksa semua jalur; tidak ada yang diverifikasi di sini.",
    },
  ],
  examples: [
    {
      command: "mkdir projects",
      description: {
        en: "Create one directory; its parent must exist.",
        id: "Buat satu direktori; induknya harus sudah ada.",
      },
    },
    {
      command: "mkdir -p projects/react/src",
      description: {
        en: "Create nested directories including missing parents.",
        id: "Buat direktori bertingkat termasuk induk yang belum ada.",
      },
    },
    {
      command: "mkdir -v documents",
      description: {
        en: "Print a creation message.",
        id: "Tampilkan pesan pembuatan.",
      },
    },
    {
      command: "mkdir -m 755 shared",
      description: {
        en: "Request owner rwx and group/others rx permissions.",
        id: "Minta izin rwx untuk pemilik dan rx untuk grup/lainnya.",
      },
    },
    {
      command: "mkdir docs images backups",
      description: {
        en: "Create three directories.",
        id: "Buat tiga direktori.",
      },
    },
  ],
};
