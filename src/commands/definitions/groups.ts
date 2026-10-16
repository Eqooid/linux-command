import type { CommandDefinition } from "../types";

export const groups: CommandDefinition = {
  id: "groups",
  name: "groups",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "List primary and supplementary group memberships.",
    id: "Tampilkan keanggotaan grup utama dan tambahan.",
  },
  explanation: {
    en: "Linux groups let accounts share access to files and other resources. A user has a primary group and may have supplementary groups. With no username, groups inspects the current process's credentials, normally inherited at login. With names, it consults the account database afresh; recent membership changes may therefore differ from the current session. The group lists correspond to id -Gn; multiple named users get username prefixes. No memberships are simulated here.",
    id: "Grup Linux memungkinkan akun berbagi akses ke file dan sumber daya lain. Pengguna memiliki grup utama dan dapat memiliki grup tambahan. Tanpa nama pengguna, groups memeriksa kredensial proses saat ini, biasanya diwarisi saat login. Dengan nama, basis data akun dibaca kembali; perubahan keanggotaan terbaru dapat berbeda dari sesi saat ini. Daftar grup sesuai dengan id -Gn; beberapa pengguna bernama mendapat awalan nama pengguna. Tidak ada keanggotaan yang disimulasikan di sini.",
  },
  syntax: "groups [-- username ...]",
  options: [],
  arguments: [
    {
      id: "usernames",
      multiple: true,
      required: false,
      placeholder: "alice",
      addLabel: { en: "Add username", id: "Tambah nama pengguna" },
      removeLabel: { en: "Remove username", id: "Hapus nama pengguna" },
      label: { en: "Usernames", id: "Nama pengguna" },
      description: {
        en: "Leave the single row empty for the current process. Add one common account name per row; every added row must be filled. Account existence is not checked.",
        id: "Kosongkan satu baris untuk proses saat ini. Tambahkan satu nama akun umum per baris; setiap baris tambahan wajib diisi. Keberadaan akun tidak diperiksa.",
      },
    },
  ],
  warnings: [
    {
      en: "Named-user results depend on the system's account services. Existing sessions may retain older group credentials.",
      id: "Hasil pengguna bernama bergantung pada layanan akun sistem. Sesi yang sedang berjalan dapat mempertahankan kredensial grup lama.",
    },
  ],
  examples: [
    {
      command: "groups",
      description: {
        en: "Inspect the current process's groups.",
        id: "Periksa grup proses saat ini.",
      },
    },
    {
      command: "groups alice",
      description: {
        en: "Look up one account's memberships.",
        id: "Cari keanggotaan satu akun.",
      },
    },
    {
      command: "groups alice bob",
      description: {
        en: "Look up two accounts with a username prefix for each list.",
        id: "Cari dua akun dengan awalan nama pengguna pada setiap daftar.",
      },
    },
  ],
};
