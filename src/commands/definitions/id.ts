import type { CommandDefinition } from "../types";

const selectedOutput = { field: "output", value: "all", not: true };
export const id: CommandDefinition = {
  id: "id",
  name: "id",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "Inspect user IDs, group IDs, and identity names.",
    id: "Periksa ID pengguna, ID grup, dan nama identitas.",
  },
  explanation: {
    en: "A UID identifies a user account; a GID identifies a group. The primary group is distinct from supplementary memberships. Default id reports real UID/GID, effective IDs when different, and group memberships. Select -u, -g, or -G for focused output. Effective identity is used for many access checks; real identity usually identifies the invoking account, but is not a record of the original login. -r requests real identity in selected output. A named account uses account-database information rather than another running process's credentials. whoami focuses on the effective username.",
    id: "UID mengidentifikasi akun pengguna; GID mengidentifikasi grup. Grup utama berbeda dari keanggotaan tambahan. id bawaan melaporkan UID/GID nyata, ID efektif jika berbeda, dan keanggotaan grup. Pilih -u, -g, atau -G untuk keluaran khusus. Identitas efektif digunakan untuk banyak pemeriksaan akses; identitas nyata biasanya menunjukkan akun pemanggil, tetapi bukan catatan login awal. -r meminta identitas nyata pada keluaran terpilih. Akun bernama memakai informasi basis data akun, bukan kredensial proses lain yang sedang berjalan. whoami berfokus pada nama pengguna efektif.",
  },
  syntax: "id [-u | -g | -G] [-n] [-r] [-z] [-- username]",
  choices: [
    {
      id: "output",
      label: { en: "Identity output", id: "Keluaran identitas" },
      description: {
        en: "Choose one output mode. Names, real IDs, and NUL termination require -u, -g, or -G in GNU id.",
        id: "Pilih satu mode keluaran. Nama, ID nyata, dan akhiran NUL memerlukan -u, -g, atau -G dalam GNU id.",
      },
      defaultValue: "all",
      items: [
        {
          value: "all",
          label: {
            en: "Full identity (default)",
            id: "Identitas lengkap (bawaan)",
          },
        },
        {
          value: "user",
          label: { en: "User ID (-u)", id: "ID pengguna (-u)" },
        },
        {
          value: "group",
          label: { en: "Primary group ID (-g)", id: "ID grup utama (-g)" },
        },
        {
          value: "groups",
          label: { en: "All group IDs (-G)", id: "Semua ID grup (-G)" },
        },
      ],
    },
  ],
  options: [
    {
      id: "userOutput",
      flag: "-u",
      choice: { field: "output", value: "user" },
      label: { en: "User ID", id: "ID pengguna" },
      description: {
        en: "Print only the effective UID unless -r selects the real UID.",
        id: "Tampilkan hanya UID efektif kecuali -r memilih UID nyata.",
      },
    },
    {
      id: "groupOutput",
      flag: "-g",
      choice: { field: "output", value: "group" },
      label: { en: "Primary group", id: "Grup utama" },
      description: {
        en: "Print only the effective primary GID, or the real GID with -r.",
        id: "Tampilkan hanya GID utama efektif, atau GID nyata dengan -r.",
      },
    },
    {
      id: "groupsOutput",
      flag: "-G",
      choice: { field: "output", value: "groups" },
      label: { en: "All groups", id: "Semua grup" },
      description: {
        en: "Print group IDs, including primary and supplementary memberships. -r is accepted with this mode in GNU id.",
        id: "Tampilkan ID grup, termasuk keanggotaan utama dan tambahan. -r diterima dalam mode ini oleh GNU id.",
      },
    },
    {
      id: "names",
      flag: "-n",
      when: selectedOutput,
      label: {
        en: "Names instead of numbers",
        id: "Nama sebagai pengganti angka",
      },
      description: {
        en: "Resolve selected IDs to account/group names (-u, -g, or -G only).",
        id: "Ubah ID terpilih menjadi nama akun/grup (hanya -u, -g, atau -G).",
      },
    },
    {
      id: "real",
      flag: "-r",
      when: selectedOutput,
      label: { en: "Real identity", id: "Identitas nyata" },
      description: {
        en: "Request real rather than effective IDs. For an explicit account, real/effective process distinctions do not apply.",
        id: "Minta ID nyata, bukan efektif. Untuk akun eksplisit, perbedaan nyata/efektif suatu proses tidak berlaku.",
      },
    },
    {
      id: "zero",
      flag: "-z",
      when: selectedOutput,
      label: { en: "NUL-separated output", id: "Keluaran dipisahkan NUL" },
      description: {
        en: "GNU id uses NUL characters instead of whitespace, including the final terminator. NUL is not a visible printed separator.",
        id: "GNU id memakai karakter NUL sebagai pengganti spasi, termasuk akhiran terakhir. NUL bukan pemisah cetak yang terlihat.",
      },
    },
  ],
  arguments: [
    {
      id: "username",
      required: false,
      placeholder: "alice",
      label: { en: "Username", id: "Nama pengguna" },
      description: {
        en: "Optional common account name. Empty selects the current process; existence is not checked. Numeric IDs and domain-specific naming schemes are outside this builder.",
        id: "Nama akun umum opsional. Kosong berarti proses saat ini; keberadaan tidak diperiksa. ID angka dan skema nama khusus domain berada di luar builder ini.",
      },
    },
  ],
  warnings: [
    {
      en: "Identity output depends on GNU coreutils and account services. No actual UID, GID, or username is inspected here.",
      id: "Keluaran identitas bergantung pada GNU coreutils dan layanan akun. UID, GID, atau nama pengguna sebenarnya tidak diperiksa di sini.",
    },
  ],
  examples: [
    {
      command: "id",
      description: {
        en: "Full identity of the current process.",
        id: "Identitas lengkap proses saat ini.",
      },
    },
    {
      command: "id alice",
      description: { en: "Look up a named account.", id: "Cari akun bernama." },
    },
    {
      command: "id -u",
      description: {
        en: "Effective numeric UID.",
        id: "UID efektif berupa angka.",
      },
    },
    {
      command: "id -un",
      description: {
        en: "Effective username, like whoami.",
        id: "Nama pengguna efektif, seperti whoami.",
      },
    },
    {
      command: "id -g",
      description: { en: "Effective primary GID.", id: "GID utama efektif." },
    },
    {
      command: "id -gn",
      description: { en: "Primary group name.", id: "Nama grup utama." },
    },
    {
      command: "id -G",
      description: { en: "All group IDs.", id: "Semua ID grup." },
    },
    {
      command: "id -Gn",
      description: {
        en: "All group names, comparable to groups.",
        id: "Semua nama grup, sebanding dengan groups.",
      },
    },
    {
      command: "id -ru",
      description: {
        en: "Real rather than effective UID.",
        id: "UID nyata, bukan efektif.",
      },
    },
  ],
};
