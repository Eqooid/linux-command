import type { CommandDefinition } from "../types";
import { accessOptions, accessPaths, reportingChoice } from "./accessFields";

export const chmod: CommandDefinition = {
  id: "chmod",
  name: "chmod",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "Build numeric or symbolic file-permission changes.",
    id: "Buat perubahan izin file numerik atau simbolis.",
  },
  explanation: {
    en: "Permissions have owner, group, and others classes. Within each digit, read contributes 4, write 2, and execute 1: rwx is 7, r-x is 5, and r-- is 4. A regular file's read/write/execute permissions control reading, changing, and attempting execution; execute does not grant administrator privileges. For directories, read lists names, write permits changes to entries (usually with execute), and execute means search/traversal. Numeric mode sets the nine ordinary permission bits; this builder does not configure special bits. Symbolic clauses target u/g/o/a, add (+), remove (-), or assign (=) r/w/x, and are applied in row order. Explicit classes avoid implicit umask filtering. chmod changes access permissions, while chown changes ownership. ACLs, special directory bits, symlinks, filesystem rules, and existing state can affect actual results.",
    id: "Izin memiliki kelas pemilik, grup, dan lainnya. Dalam setiap digit, baca bernilai 4, tulis 2, dan eksekusi 1: rwx adalah 7, r-x adalah 5, dan r-- adalah 4. Izin baca/tulis/eksekusi file biasa mengendalikan pembacaan, perubahan, dan percobaan eksekusi; eksekusi tidak memberi hak administrator. Untuk direktori, baca menampilkan nama, tulis mengizinkan perubahan entri (biasanya bersama eksekusi), dan eksekusi berarti pencarian/penelusuran. Mode numerik menetapkan sembilan bit izin biasa; builder ini tidak mengatur bit khusus. Klausa simbolis menargetkan u/g/o/a, menambah (+), menghapus (-), atau menetapkan (=) r/w/x, dan diterapkan menurut urutan baris. Kelas eksplisit menghindari penyaringan umask implisit. chmod mengubah izin akses, sedangkan chown mengubah kepemilikan. ACL, bit direktori khusus, tautan simbolis, aturan sistem file, dan keadaan awal dapat memengaruhi hasil sebenarnya.",
  },
  syntax: "chmod [-R] [-v | -c] [-f] -- mode path...",
  choices: [
    {
      id: "permissionMode",
      label: { en: "Permission mode", id: "Mode izin" },
      description: {
        en: "Numeric mode sets ordinary bits. Symbolic mode describes changes; it cannot predict the resulting permissions without the current mode.",
        id: "Mode numerik menetapkan bit biasa. Mode simbolis menjelaskan perubahan; hasil izin tidak dapat diprediksi tanpa mode awal.",
      },
      defaultValue: "numeric",
      items: [
        {
          value: "numeric",
          label: { en: "Numeric (octal)", id: "Numerik (oktal)" },
        },
        {
          value: "symbolic",
          label: { en: "Symbolic clauses", id: "Klausa simbolis" },
        },
      ],
    },
    reportingChoice,
  ],
  options: accessOptions,
  arguments: [
    {
      id: "numeric",
      editor: "numeric-permissions",
      required: true,
      defaultValue: "644",
      placeholder: "644",
      when: { field: "permissionMode", value: "numeric" },
      label: { en: "Octal permissions", id: "Izin oktal" },
      description: {
        en: "Exactly three digits, 0–7. Checkboxes and the octal input stay synchronized; r=4, w=2, x=1. Special bits are outside this editor.",
        id: "Tepat tiga digit, 0–7. Kotak centang dan input oktal tetap tersinkron; r=4, w=2, x=1. Bit khusus berada di luar editor ini.",
      },
    },
    {
      id: "clauses",
      editor: "symbolic-permissions",
      required: true,
      multiple: true,
      defaultValue: "u+x",
      placeholder: "u+x",
      when: { field: "permissionMode", value: "symbolic" },
      label: { en: "Symbolic permission clauses", id: "Klausa izin simbolis" },
      description: {
        en: "Choose a class, operation, and r/w/x permissions per row. Rows are applied in order; = with no permissions clears that class. No X, s, t, permission copying, or arbitrary mode expressions.",
        id: "Pilih kelas, operasi, dan izin r/w/x per baris. Baris diterapkan berurutan; = tanpa izin mengosongkan kelas tersebut. Tanpa X, s, t, penyalinan izin, atau ekspresi mode bebas.",
      },
    },
    accessPaths,
  ],
  warnings: [
    {
      en: "Review every target. chmod 777 is usually discouraged because everyone can read, write, and execute/search. Numeric modes do not necessarily clear pre-existing special directory bits. This app does not inspect files or change permissions.",
      id: "Periksa setiap tujuan. chmod 777 biasanya tidak dianjurkan karena semua orang dapat membaca, menulis, dan mengeksekusi/menelusuri. Mode numerik tidak selalu menghapus bit direktori khusus yang sudah ada. Aplikasi ini tidak memeriksa file atau mengubah izin.",
    },
  ],
  examples: [
    {
      command: "chmod 644 file.txt",
      description: {
        en: "Owner reads/writes; group and others read.",
        id: "Pemilik membaca/menulis; grup dan lainnya membaca.",
      },
    },
    {
      command: "chmod 755 script.sh",
      description: {
        en: "Owner has rwx; group and others have r-x. Review whether execution is appropriate.",
        id: "Pemilik memiliki rwx; grup dan lainnya r-x. Periksa apakah eksekusi sesuai.",
      },
    },
    {
      command: "chmod 700 private-folder",
      description: {
        en: "Ordinary owner permissions only; directory x permits traversal.",
        id: "Izin biasa hanya untuk pemilik; x direktori mengizinkan penelusuran.",
      },
    },
    {
      command: "chmod 600 secret.txt",
      description: {
        en: "Owner read/write only; not a guarantee of confidentiality against privileged accounts.",
        id: "Baca/tulis hanya untuk pemilik; bukan jaminan kerahasiaan terhadap akun berhak istimewa.",
      },
    },
    {
      command: "chmod u+x script.sh",
      description: {
        en: "Add owner execute permission.",
        id: "Tambahkan izin eksekusi pemilik.",
      },
    },
    {
      command: "chmod g-w file.txt",
      description: {
        en: "Remove group write permission.",
        id: "Hapus izin tulis grup.",
      },
    },
    {
      command: "chmod o-r secret.txt",
      description: {
        en: "Remove others' read permission.",
        id: "Hapus izin baca lainnya.",
      },
    },
    {
      command: "chmod a+r document.txt",
      description: {
        en: "Add read permission for all classes.",
        id: "Tambahkan izin baca untuk semua kelas.",
      },
    },
    {
      command: "chmod u=rw,g=r,o= file.txt",
      description: {
        en: "Assign ordinary permissions with three ordered clauses.",
        id: "Tetapkan izin biasa dengan tiga klausa berurutan.",
      },
    },
    {
      command: "chmod -R 755 public/",
      description: {
        en: "Apply recursively, including executable bits on regular files. Review scope; not a general-purpose recommendation.",
        id: "Terapkan secara rekursif, termasuk bit eksekusi pada file biasa. Periksa cakupan; bukan anjuran umum.",
      },
    },
  ],
};
