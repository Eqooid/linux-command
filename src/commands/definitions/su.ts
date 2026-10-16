import type { CommandDefinition } from "../types";
import { privilegeCommandArguments } from "./accessFields";

export const su: CommandDefinition = {
  id: "su",
  name: "su",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "Generate a user-switching shell or constrained shell command.",
    id: "Buat shell pengganti pengguna atau perintah shell terbatas.",
  },
  explanation: {
    en: "su starts a shell with substitute user/group identity; no username normally means root. Unlike sudo's policy-controlled command authorization, su commonly authenticates using the target account's password through PAM, but actual requirements depend on configuration. Login mode (-l, also written -) initializes a login-like environment and changes to the target home. Plain su retains more of the current environment. -m (alias -p) requests environment preservation, but login mode ignores it and PAM may still change variables. Root access increases the impact of mistakes. This app never asks for a password or changes identity.",
    id: "su memulai shell dengan identitas pengguna/grup pengganti; tanpa nama pengguna biasanya berarti root. Berbeda dari otorisasi perintah sudo yang dikendalikan kebijakan, su umumnya mengautentikasi melalui PAM memakai kata sandi akun tujuan, tetapi kebutuhan sebenarnya bergantung pada konfigurasi. Mode login (-l, juga ditulis -) menyiapkan lingkungan mirip login dan berpindah ke home tujuan. su biasa mempertahankan lebih banyak lingkungan saat ini. -m (alias -p) meminta pelestarian lingkungan, tetapi mode login mengabaikannya dan PAM masih dapat mengubah variabel. Akses root meningkatkan dampak kesalahan. Aplikasi ini tidak meminta kata sandi atau mengubah identitas.",
  },
  syntax:
    "su [-l] [-m] [-s /path/to/shell] [-- user] | su [-m] -s /bin/sh -c 'serialized simple command' [-- user]",
  choices: [
    {
      id: "mode",
      label: { en: "User-switch mode", id: "Mode penggantian pengguna" },
      description: {
        en: "Choose switching, a login shell, or one constrained command. Command mode fixes the shell to /bin/sh for POSIX quoting; target restrictions can still override shell selection.",
        id: "Pilih penggantian pengguna, shell login, atau satu perintah terbatas. Mode perintah menetapkan shell /bin/sh untuk kutip POSIX; pembatasan akun tujuan tetap dapat mengesampingkan pilihan shell.",
      },
      defaultValue: "switch",
      items: [
        { value: "switch", label: { en: "Switch user", id: "Ganti pengguna" } },
        {
          value: "login",
          label: {
            en: "Start a login shell (-l)",
            id: "Mulai shell login (-l)",
          },
        },
        {
          value: "command",
          label: {
            en: "One constrained command (-c)",
            id: "Satu perintah terbatas (-c)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "loginMode",
      flag: "-l",
      choice: { field: "mode", value: "login" },
      label: { en: "Login shell", id: "Shell login" },
      description: {
        en: "Login-like environment; -l is equivalent to the traditional standalone - before a username.",
        id: "Lingkungan mirip login; -l setara dengan - tersendiri sebelum nama pengguna.",
      },
    },
    {
      id: "commandMode",
      flag: "-c",
      choice: { field: "mode", value: "command" },
      label: { en: "Shell command", id: "Perintah shell" },
      description: {
        en: "Pass one inner command string to the shell. The builder separately quotes each inner token, then quotes that complete string for the outer shell.",
        id: "Teruskan satu string perintah dalam ke shell. Builder mengutip setiap token dalam secara terpisah, lalu mengutip string lengkap itu untuk shell luar.",
      },
    },
    {
      id: "preserve",
      flag: "-m",
      when: { field: "mode", value: "login", not: true },
      label: {
        en: "Preserve environment (-m / -p)",
        id: "Pertahankan lingkungan (-m / -p)",
      },
      description: {
        en: "Request preservation of the current environment; PAM and system policy still apply. Hidden and omitted in login mode.",
        id: "Minta pelestarian lingkungan saat ini; PAM dan kebijakan sistem tetap berlaku. Disembunyikan dan diabaikan dalam mode login.",
      },
    },
  ],
  arguments: [
    {
      id: "user",
      required: false,
      placeholder: "alice",
      label: { en: "Target username", id: "Nama pengguna tujuan" },
      description: {
        en: "Empty normally selects root. Common account names only; no account is checked.",
        id: "Kosong biasanya memilih root. Hanya nama akun umum; akun tidak diperiksa.",
      },
    },
    {
      id: "shell",
      required: false,
      placeholder: "/bin/bash",
      when: { field: "mode", value: "command", not: true },
      label: { en: "Shell path (-s)", id: "Jalur shell (-s)" },
      description: {
        en: "Optional simple absolute path. Restricted accounts may ignore this unless the caller is root; installed shells are not inspected.",
        id: "Jalur absolut sederhana opsional. Akun terbatas dapat mengabaikannya kecuali pemanggil adalah root; shell terpasang tidak diperiksa.",
      },
    },
    ...privilegeCommandArguments("command"),
  ],
  warnings: [
    {
      en: "Switching identity, especially to root, can enable system-wide changes. Nested quoting preserves literal arguments but cannot make a privileged operation safe. No password prompts, authentication, or shell execution occur in this browser.",
      id: "Mengganti identitas, terutama ke root, dapat memungkinkan perubahan seluruh sistem. Kutip bertingkat mempertahankan argumen literal tetapi tidak membuat operasi berhak istimewa menjadi aman. Tidak ada permintaan kata sandi, autentikasi, atau eksekusi shell dalam browser ini.",
    },
  ],
  examples: [
    {
      command: "su",
      description: {
        en: "Request a shell as the default target, normally root.",
        id: "Minta shell sebagai pengguna tujuan bawaan, biasanya root.",
      },
    },
    {
      command: "su alice",
      description: {
        en: "Request a shell as alice.",
        id: "Minta shell sebagai alice.",
      },
    },
    {
      command: "su - alice",
      description: {
        en: "Login shell as alice; this builder emits the equivalent -l.",
        id: "Shell login sebagai alice; builder ini menghasilkan -l yang setara.",
      },
    },
    {
      command: "su -s /bin/bash alice",
      description: {
        en: "Request Bash, subject to account restrictions.",
        id: "Minta Bash, sesuai pembatasan akun.",
      },
    },
    {
      command: "su -m alice",
      description: {
        en: "Request environment preservation without login mode.",
        id: "Minta pelestarian lingkungan tanpa mode login.",
      },
    },
    {
      command: "su -s /bin/sh -c 'id -u' alice",
      description: {
        en: "Request a simple POSIX-shell command; the builder quotes its tokens explicitly.",
        id: "Minta perintah shell POSIX sederhana; builder mengutip tokennya secara eksplisit.",
      },
    },
  ],
};
