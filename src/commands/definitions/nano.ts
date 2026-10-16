import type { CommandDefinition } from "../types";

export const nano: CommandDefinition = {
  id: "nano",
  name: "nano",
  category: "reading",
  form: { kind: "basic" },
  description: {
    en: "Open GNU nano, a terminal text editor.",
    id: "Buka GNU nano, editor teks terminal.",
  },
  explanation: {
    en: "nano edits text, unlike cat (prints contents) or less (pages through contents). Without a filename it opens an unnamed buffer; a named file need not already exist. Editing changes a buffer, and writing/saving may create or modify a file. -v opens view-only mode and disables editing, while -B requests a previous-version backup when saving. This app generates text only and does not launch an editor.",
    id: "nano mengedit teks, berbeda dari cat (mencetak isi) atau less (menelusuri isi per halaman). Tanpa nama file, nano membuka buffer tanpa nama; file bernama tidak harus sudah ada. Penyuntingan mengubah buffer, dan penulisan/penyimpanan dapat membuat atau mengubah file. -v membuka mode hanya lihat dan menonaktifkan penyuntingan, sedangkan -B meminta cadangan versi sebelumnya saat menyimpan. Aplikasi ini hanya menghasilkan teks dan tidak meluncurkan editor.",
  },
  syntax: "nano [-l] [-m] [-i] [-B] [-v] [-c] [-- file]",
  options: [
    {
      id: "numbers",
      flag: "-l",
      label: { en: "Line numbers", id: "Nomor baris" },
      description: {
        en: "Show line numbers beside the text.",
        id: "Tampilkan nomor baris di samping teks.",
      },
    },
    {
      id: "mouse",
      flag: "-m",
      label: { en: "Mouse support", id: "Dukungan mouse" },
      description: {
        en: "Enable mouse actions when supported by the terminal.",
        id: "Aktifkan tindakan mouse jika didukung terminal.",
      },
    },
    {
      id: "indent",
      flag: "-i",
      label: { en: "Automatic indentation", id: "Indentasi otomatis" },
      description: {
        en: "Reuse indentation when starting a new line.",
        id: "Gunakan kembali indentasi saat memulai baris baru.",
      },
    },
    {
      id: "backup",
      flag: "-B",
      label: { en: "Backup when saving", id: "Cadangkan saat menyimpan" },
      description: {
        en: "Back up the previous file version when saving. This does not save automatically and has no effect while only viewing.",
        id: "Cadangkan versi file sebelumnya saat menyimpan. Ini tidak menyimpan otomatis dan tidak berpengaruh saat hanya melihat.",
      },
    },
    {
      id: "view",
      flag: "-v",
      label: { en: "View-only mode", id: "Mode hanya lihat" },
      description: {
        en: "Disallow editing inside nano; this is not a replacement for filesystem permissions.",
        id: "Larang penyuntingan di dalam nano; ini bukan pengganti izin sistem file.",
      },
    },
    {
      id: "position",
      flag: "-c",
      label: { en: "Show cursor position", id: "Tampilkan posisi kursor" },
      description: {
        en: "Continuously show the cursor position.",
        id: "Tampilkan posisi kursor secara terus-menerus.",
      },
    },
  ],
  arguments: [
    {
      id: "path",
      label: { en: "File path", id: "Jalur file" },
      description: {
        en: "Optional: leave empty for an unnamed buffer. Enter one literal filename; existence is not checked. Leading + names use ./ to avoid line/search syntax.",
        id: "Opsional: kosongkan untuk buffer tanpa nama. Masukkan satu nama file literal; keberadaannya tidak diperiksa. Nama berawalan + menggunakan ./ agar tidak dianggap sintaks baris/pencarian.",
      },
      required: false,
      placeholder: "notes.txt",
    },
  ],
  warnings: [
    {
      en: "GNU nano must be installed and run in a terminal. Saving from editing mode may change files. Version, terminal support, nanorc settings, and modern bindings can change options or shortcuts; the reference below uses traditional bindings.",
      id: "GNU nano harus terpasang dan dijalankan dalam terminal. Menyimpan dari mode penyuntingan dapat mengubah file. Versi, dukungan terminal, pengaturan nanorc, dan ikatan modern dapat mengubah opsi atau pintasan; referensi di bawah menggunakan ikatan tradisional.",
    },
  ],
  shortcuts: {
    description: {
      en: "Use these traditional GNU nano shortcuts inside the terminal editor. ^ means Ctrl; M- means Meta (usually Alt, or Esc followed by the key). Bindings can vary by version, terminal, and configuration. Ctrl + G opens the installed help; these keys do nothing inside this browser app.",
      id: "Gunakan pintasan GNU nano tradisional ini di dalam editor terminal. ^ berarti Ctrl; M- berarti Meta (biasanya Alt, atau Esc diikuti tombol). Ikatan dapat berbeda menurut versi, terminal, dan konfigurasi. Ctrl + G membuka bantuan yang terpasang; tombol ini tidak melakukan apa pun di dalam aplikasi browser ini.",
    },
    items: [
      {
        keys: "Ctrl + O",
        description: {
          en: "Write/save the buffer (confirm the filename)",
          id: "Tulis/simpan buffer (konfirmasi nama file)",
        },
      },
      {
        keys: "Ctrl + X",
        description: {
          en: "Exit the editor; changed buffers may prompt to save",
          id: "Keluar dari editor; buffer berubah dapat meminta penyimpanan",
        },
      },
      {
        keys: "Ctrl + K",
        description: {
          en: "Cut the current line or selected text",
          id: "Potong baris saat ini atau teks yang dipilih",
        },
      },
      {
        keys: "Ctrl + U",
        description: {
          en: "Paste the cut text",
          id: "Tempel teks yang dipotong",
        },
      },
      {
        keys: "Ctrl + W",
        description: { en: "Search for text", id: "Cari teks" },
      },
      {
        keys: "Ctrl + \\",
        description: { en: "Search and replace", id: "Cari dan ganti" },
      },
      {
        keys: "Ctrl + G",
        description: { en: "Open help", id: "Buka bantuan" },
      },
      { keys: "Alt + U", description: { en: "Undo", id: "Urungkan" } },
      { keys: "Alt + E", description: { en: "Redo", id: "Ulangi" } },
      {
        keys: "Ctrl + _",
        description: { en: "Go to line and column", id: "Ke baris dan kolom" },
      },
    ],
  },
  examples: [
    {
      command: "nano",
      description: {
        en: "Open an unnamed editing buffer.",
        id: "Buka buffer penyuntingan tanpa nama.",
      },
    },
    {
      command: "nano notes.txt",
      description: {
        en: "Open or prepare to create a named file.",
        id: "Buka atau persiapkan pembuatan file bernama.",
      },
    },
    {
      command: "nano -l script.sh",
      description: {
        en: "Show line numbers while editing.",
        id: "Tampilkan nomor baris saat menyunting.",
      },
    },
    {
      command: "nano -i config.txt",
      description: {
        en: "Use automatic indentation.",
        id: "Gunakan indentasi otomatis.",
      },
    },
    {
      command: "nano -B important.conf",
      description: {
        en: "Request a backup of the previous version when saving.",
        id: "Minta cadangan versi sebelumnya saat menyimpan.",
      },
    },
    {
      command: "nano -v readonly.txt",
      description: {
        en: "View without editing inside nano.",
        id: "Lihat tanpa menyunting di dalam nano.",
      },
    },
  ],
};
