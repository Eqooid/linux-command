import type { CommandDefinition } from "../types";
import { accessOptions, accessPaths, reportingChoice } from "./accessFields";

export const chown: CommandDefinition = {
  id: "chown",
  name: "chown",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "Build owner and group changes for files or directories.",
    id: "Buat perubahan pemilik dan grup file atau direktori.",
  },
  explanation: {
    en: "Each file has a user owner and group owner. chown alice changes only the user; alice:developers changes both; :developers changes only the group. This builder never emits a trailing colon, which can otherwise select an owner's login group. Users may have a primary group and supplementary memberships, which affect access checks but do not automatically change an existing file's ownership. chmod changes permissions; chown changes who owns the object. Changing owner usually requires elevated privileges; group changes have their own restrictions. --from limits changes to matching current owner/group fields; it is not a preview, authorization check, or guarantee against races. Symlink handling and special bits depend on GNU behavior and filesystem context.",
    id: "Setiap file memiliki pemilik pengguna dan pemilik grup. chown alice hanya mengubah pengguna; alice:developers mengubah keduanya; :developers hanya mengubah grup. Builder ini tidak menghasilkan titik dua di akhir, yang dapat memilih grup login pemilik. Pengguna dapat memiliki grup utama dan keanggotaan tambahan, yang memengaruhi pemeriksaan akses tetapi tidak otomatis mengubah kepemilikan file yang sudah ada. chmod mengubah izin; chown mengubah siapa pemilik objek. Mengubah pemilik biasanya memerlukan hak istimewa; perubahan grup memiliki pembatasannya sendiri. --from membatasi perubahan ke kolom pemilik/grup saat ini yang cocok; ini bukan pratinjau, pemeriksaan otorisasi, atau jaminan terhadap kondisi balapan. Penanganan tautan simbolis dan bit khusus bergantung pada perilaku GNU dan konteks sistem file.",
  },
  syntax:
    "chown [-R] [-v | -c] [-f] [--from=current-owner:current-group] -- owner[:group] path...",
  choices: [reportingChoice],
  options: [
    ...accessOptions,
    {
      id: "conditional",
      flag: "--from",
      label: {
        en: "Match current ownership",
        id: "Cocokkan kepemilikan saat ini",
      },
      description: {
        en: "Only change objects matching the supplied current owner and/or group; omitted fields are not checked.",
        id: "Hanya ubah objek yang cocok dengan pemilik dan/atau grup saat ini; kolom kosong tidak diperiksa.",
      },
    },
  ],
  arguments: [
    {
      id: "owner",
      required: false,
      placeholder: "alice",
      label: { en: "New owner", id: "Pemilik baru" },
      description: {
        en: "Common account name. Leave empty for a group-only change; at least owner or group is required. Dotted owner-only names are rejected to avoid GNU's legacy owner.group interpretation.",
        id: "Nama akun umum. Kosongkan untuk perubahan grup saja; pemilik atau grup wajib diisi. Nama pemilik saja bertitik ditolak untuk menghindari penafsiran lama owner.group oleh GNU.",
      },
    },
    {
      id: "group",
      required: false,
      placeholder: "developers",
      label: { en: "New group", id: "Grup baru" },
      description: {
        en: "Common group name. Leave empty for an owner-only change. Names are not checked against a system database.",
        id: "Nama grup umum. Kosongkan untuk perubahan pemilik saja. Nama tidak diperiksa terhadap basis data sistem.",
      },
    },
    {
      id: "fromOwner",
      required: false,
      placeholder: "olduser",
      when: { field: "conditional", value: true },
      label: { en: "Current owner filter", id: "Filter pemilik saat ini" },
      description: {
        en: "Owner to match with --from; provide this or a current group.",
        id: "Pemilik yang dicocokkan dengan --from; isi ini atau grup saat ini.",
      },
    },
    {
      id: "fromGroup",
      required: false,
      placeholder: "oldgroup",
      when: { field: "conditional", value: true },
      label: { en: "Current group filter", id: "Filter grup saat ini" },
      description: {
        en: "Group to match. Both fields together require both current ownership values to match.",
        id: "Grup yang dicocokkan. Kedua kolom bersama mewajibkan kedua nilai kepemilikan saat ini cocok.",
      },
    },
    accessPaths,
  ],
  warnings: [
    {
      en: "Ownership changes can break applications or expose data, especially on system directories. Review targets, symlinks, and privileges. No sudo is added and no account, group, or path is verified. This app never changes real ownership.",
      id: "Perubahan kepemilikan dapat merusak aplikasi atau membuka data, terutama pada direktori sistem. Periksa tujuan, tautan simbolis, dan hak istimewa. sudo tidak ditambahkan dan akun, grup, atau jalur tidak diverifikasi. Aplikasi ini tidak mengubah kepemilikan sebenarnya.",
    },
  ],
  examples: [
    {
      command: "chown alice file.txt",
      description: {
        en: "Change only the user owner.",
        id: "Ubah hanya pemilik pengguna.",
      },
    },
    {
      command: "chown alice:developers project/",
      description: {
        en: "Change user and group owners.",
        id: "Ubah pemilik pengguna dan grup.",
      },
    },
    {
      command: "chown :developers shared-folder/",
      description: {
        en: "Change only group ownership.",
        id: "Ubah hanya kepemilikan grup.",
      },
    },
    {
      command: "chown -R alice:developers project/",
      description: {
        en: "Change ownership throughout the target tree; review scope carefully.",
        id: "Ubah kepemilikan di seluruh pohon tujuan; periksa cakupan dengan teliti.",
      },
    },
    {
      command: "chown -v alice report.txt",
      description: {
        en: "Report processed files.",
        id: "Laporkan file yang diproses.",
      },
    },
    {
      command: "chown --from=olduser alice file.txt",
      description: {
        en: "Change owner only where the current owner matches olduser.",
        id: "Ubah pemilik hanya jika pemilik saat ini cocok dengan olduser.",
      },
    },
  ],
};
