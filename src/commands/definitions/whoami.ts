import type { CommandDefinition } from "../types";

export const whoami: CommandDefinition = {
  id: "whoami",
  name: "whoami",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "Print the effective user's name.",
    id: "Tampilkan nama pengguna efektif.",
  },
  explanation: {
    en: "whoami reports the name associated with the process's effective UID, like id -un. The effective identity controls many permission checks and can differ from the original login user. Running a program through sudo can change its effective identity; this builder never adds sudo. No username is read or invented by the browser.",
    id: "whoami melaporkan nama yang terkait dengan UID efektif proses, seperti id -un. Identitas efektif menentukan banyak pemeriksaan izin dan dapat berbeda dari pengguna login awal. Menjalankan program melalui sudo dapat mengubah identitas efektifnya; builder ini tidak pernah menambahkan sudo. Browser tidak membaca atau mengarang nama pengguna.",
  },
  syntax: "whoami",
  options: [],
  arguments: [],
  warnings: [
    {
      en: "This generates text only. It does not inspect your browser or operating-system account.",
      id: "Ini hanya menghasilkan teks. Akun browser atau sistem operasi Anda tidak diperiksa.",
    },
  ],
  examples: [
    {
      command: "whoami",
      description: {
        en: "Ask the terminal utility to report the effective username when run manually.",
        id: "Minta utilitas terminal melaporkan nama pengguna efektif saat dijalankan secara manual.",
      },
    },
  ],
};
