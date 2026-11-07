import type { CommandDefinition } from "../types";
import { accessOptions, accessPaths, reportingChoice } from "./accessFields";

export const chgrp: CommandDefinition = {
  id: "chgrp",
  name: "chgrp",
  category: "permissions",
  description: {
    en: "Change file group ownership using a group name, numeric GID or reference file.",
    id: "Ubah kepemilikan grup berkas memakai nama grup, GID numerik, atau berkas referensi.",
  },
  explanation: {
    en: "Linux files have a user owner and a group owner. chgrp changes only the group; chown changes user and/or group ownership, while chmod changes permission bits. Group names map to numeric GIDs. In this GNU builder, digit-only input is normalized and prefixed with + to force numeric-ID interpretation, even if a numeric-looking group name exists. Reference mode copies the group of an existing reference file, without a group operand. No metadata is read here. An ordinary owner may be allowed to select a group they belong to; authorization also depends on privileges, filesystem and system policy. sudo is optional, never automatic. Recursive changes affect descendants and require careful scope review. Changing a shared project's group does not automatically grant group write permission. Symlink handling and special permission bits depend on GNU behavior and filesystem context.",
    id: "Berkas Linux memiliki pemilik pengguna dan pemilik grup. chgrp hanya mengubah grup; chown mengubah kepemilikan pengguna dan/atau grup, sedangkan chmod mengubah bit izin. Nama grup dipetakan ke GID numerik. Dalam builder GNU ini, masukan hanya-digit dinormalisasi dan diberi awalan + untuk memastikan penafsiran ID numerik, meskipun ada nama grup yang menyerupai angka. Mode referensi menyalin grup berkas referensi yang sudah ada, tanpa operand grup. Tidak ada metadata yang dibaca di sini. Pemilik biasa mungkin diizinkan memilih grup yang diikutinya; otorisasi juga bergantung pada hak istimewa, sistem berkas, dan kebijakan sistem. sudo opsional, tidak pernah otomatis. Perubahan rekursif memengaruhi turunan dan memerlukan peninjauan cakupan. Mengubah grup proyek bersama tidak otomatis memberikan izin tulis grup. Penanganan symlink dan bit izin khusus bergantung pada perilaku GNU dan konteks sistem berkas.",
  },
  syntax:
    "[sudo] chgrp [-R] [-v | -c] -- group-or-+gid path...\n[sudo] chgrp [-R] [-v | -c] --reference=file -- path...",
  form: {
    kind: "grouped",
    groups: [
      {
        id: "ownership",
        title: { en: "Group ownership source", id: "Sumber kepemilikan grup" },
        fields: ["mode", "group", "reference"],
      },
      {
        id: "targets",
        title: { en: "Targets", id: "Tujuan" },
        fields: ["paths"],
      },
      {
        id: "options",
        title: { en: "Recursion and reporting", id: "Rekursi dan pelaporan" },
        fields: ["recursive", "reporting"],
      },
      {
        id: "privileges",
        title: { en: "Optional privileges", id: "Hak istimewa opsional" },
        fields: ["sudo"],
      },
    ],
  },
  choices: [
    {
      id: "mode",
      label: { en: "Ownership mode", id: "Mode kepemilikan" },
      description: {
        en: "Choose a direct group/GID or copy the group from a reference file. The two modes never generate together.",
        id: "Pilih grup/GID langsung atau salin grup dari berkas referensi. Kedua mode tidak pernah dihasilkan bersama.",
      },
      defaultValue: "direct",
      items: [
        {
          value: "direct",
          label: { en: "Direct group or GID", id: "Grup atau GID langsung" },
        },
        {
          value: "reference",
          label: {
            en: "Reference file (--reference)",
            id: "Berkas referensi (--reference)",
          },
        },
      ],
    },
    reportingChoice,
  ],
  options: [
    ...accessOptions.filter((option) => option.id !== "silent"),
    {
      id: "referenceOption",
      flag: "--reference",
      argument: "reference",
      when: { field: "mode", value: "reference" },
      label: { en: "Copy reference group", id: "Salin grup referensi" },
      description: {
        en: "Use the reference file's group ownership; it must exist when manually run. No direct group operand is emitted.",
        id: "Gunakan kepemilikan grup berkas referensi; berkas harus ada saat dijalankan manual. Operand grup langsung tidak dihasilkan.",
      },
    },
    {
      id: "sudo",
      flag: "sudo",
      label: {
        en: "Explicitly prepend sudo",
        id: "Tambahkan sudo secara eksplisit",
      },
      description: {
        en: "Off by default. Changing a group does not always require sudo; ownership, group membership and system policy matter. No password is requested or stored here.",
        id: "Nonaktif secara bawaan. Mengubah grup tidak selalu memerlukan sudo; kepemilikan, keanggotaan grup, dan kebijakan sistem berpengaruh. Tidak ada kata sandi yang diminta atau disimpan di sini.",
      },
    },
  ],
  arguments: [
    {
      id: "group",
      required: true,
      when: { field: "mode", value: "direct" },
      placeholder: "developers",
      label: { en: "Group name or GID", id: "Nama grup atau GID" },
      description: {
        en: "Common group name or decimal GID 0–4294967294. Digit-only values use GNU +gid to avoid numeric-name ambiguity. Names, IDs and membership are not verified.",
        id: "Nama grup umum atau GID desimal 0–4294967294. Nilai hanya-digit memakai +gid GNU untuk menghindari ambiguitas nama numerik. Nama, ID, dan keanggotaan tidak diverifikasi.",
      },
    },
    {
      id: "reference",
      required: true,
      when: { field: "mode", value: "reference" },
      placeholder: "template.txt",
      label: { en: "Reference file path", id: "Jalur berkas referensi" },
      description: {
        en: "One literal reference path, without shell quotes. Its group is copied when manually run; no file is inspected by the app.",
        id: "Satu jalur referensi literal, tanpa kutip shell. Grupnya disalin saat dijalankan manual; aplikasi tidak memeriksa berkas.",
      },
    },
    accessPaths,
  ],
  warnings: [
    {
      en: "Group changes can disrupt access and applications. Do not recursively change system directories without understanding the consequences. Files, groups, memberships, symlinks and authorization are never inspected; nothing is executed here.",
      id: "Perubahan grup dapat mengganggu akses dan aplikasi. Jangan mengubah direktori sistem secara rekursif tanpa memahami akibatnya. Berkas, grup, keanggotaan, symlink, dan otorisasi tidak pernah diperiksa; tidak ada yang dieksekusi di sini.",
    },
  ],
  comparison: [
    {
      command: "chmod",
      description: {
        en: "Change file permission bits.",
        id: "Ubah bit izin berkas.",
      },
    },
    {
      command: "chown",
      description: {
        en: "Change user and/or group ownership.",
        id: "Ubah kepemilikan pengguna dan/atau grup.",
      },
    },
    {
      command: "chgrp",
      description: {
        en: "Change group ownership only.",
        id: "Ubah hanya kepemilikan grup.",
      },
    },
  ],
  examples: [
    {
      command: "chgrp developers app.log",
      description: {
        en: "Assign a named group.",
        id: "Tetapkan grup bernama.",
      },
    },
    {
      command: "chgrp staff report.txt",
      description: {
        en: "Change the group of one report.",
        id: "Ubah grup satu laporan.",
      },
    },
    {
      command: "chgrp 1001 data.csv",
      description: {
        en: "Illustrative numeric GID syntax. The builder emits +1001 to force an ID rather than a numeric group-name lookup.",
        id: "Contoh sintaks GID numerik. Builder menghasilkan +1001 untuk memastikan ID, bukan pencarian nama grup numerik.",
      },
    },
    {
      command: "chgrp developers file1.txt file2.txt",
      description: {
        en: "Change multiple literal targets.",
        id: "Ubah beberapa tujuan literal.",
      },
    },
    {
      command: "chgrp -v staff report.txt",
      description: {
        en: "Report every processed file.",
        id: "Laporkan setiap berkas yang diproses.",
      },
    },
    {
      command: "chgrp -c staff report.txt",
      description: {
        en: "Report only actual changes.",
        id: "Laporkan hanya perubahan nyata.",
      },
    },
    {
      command: "chgrp --reference=template.txt report.txt",
      description: {
        en: "Copy the reference file's group without a direct group operand.",
        id: "Salin grup berkas referensi tanpa operand grup langsung.",
      },
    },
    {
      command: "sudo chgrp -R developers /srv/project",
      description: {
        en: "Shared-project example: explicitly request recursive group changes. This does not automatically grant group write permission; review the directory tree and authorization first.",
        id: "Contoh proyek bersama: minta perubahan grup rekursif secara eksplisit. Ini tidak otomatis memberikan izin tulis grup; tinjau pohon direktori dan otorisasi terlebih dahulu.",
      },
    },
  ],
};
