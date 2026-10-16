import type { CommandDefinition } from "../types";
import { privilegeCommandArguments } from "./accessFields";

export const sudo: CommandDefinition = {
  id: "sudo",
  name: "sudo",
  category: "permissions",
  form: { kind: "basic" },
  description: {
    en: "Generate a command or shell request as another user.",
    id: "Buat permintaan perintah atau shell sebagai pengguna lain.",
  },
  explanation: {
    en: "sudo asks the system's security policy to authorize an operation as another user, usually root. sudo command runs that program directly; -i requests the target user's login shell and login-like environment, while -s starts a shell selected from SHELL or the invoking user's account, subject to policy. -l lists permissions, -v refreshes cached authentication, and standalone -k invalidates the current session's cache. This builder selects root explicitly with -u root except in standalone -k mode. Authorization and password requirements depend on configuration; membership in a group named sudo is neither universal nor proof of authorization.",
    id: "sudo meminta kebijakan keamanan sistem mengizinkan operasi sebagai pengguna lain, biasanya root. sudo command menjalankan program tersebut secara langsung; -i meminta shell login pengguna tujuan dan lingkungan mirip login, sedangkan -s memulai shell dari SHELL atau akun pengguna pemanggil, sesuai kebijakan. -l menampilkan izin, -v memperbarui autentikasi tersimpan, dan -k tersendiri membatalkan cache sesi saat ini. Builder ini memilih root secara eksplisit dengan -u root kecuali pada mode -k tersendiri. Izin dan kebutuhan kata sandi bergantung pada konfigurasi; keanggotaan grup bernama sudo tidak berlaku universal dan bukan bukti otorisasi.",
  },
  syntax:
    "sudo [-u user] [-g group] [-- executable argument...] | sudo [-u user] [-g group] [-i | -s | -l | -v] | sudo -k",
  choices: [
    {
      id: "mode",
      label: { en: "Privilege mode", id: "Mode hak istimewa" },
      description: {
        en: "Select one operation. Shell modes do not accept an arbitrary command string in this builder.",
        id: "Pilih satu operasi. Mode shell tidak menerima string perintah bebas dalam builder ini.",
      },
      defaultValue: "run",
      items: [
        {
          value: "run",
          label: { en: "Run one command", id: "Jalankan satu perintah" },
        },
        {
          value: "login",
          label: { en: "Login shell (-i)", id: "Shell login (-i)" },
        },
        { value: "shell", label: { en: "Shell (-s)", id: "Shell (-s)" } },
        {
          value: "list",
          label: { en: "List permissions (-l)", id: "Tampilkan izin (-l)" },
        },
        {
          value: "validate",
          label: {
            en: "Validate cached credentials (-v)",
            id: "Validasi kredensial tersimpan (-v)",
          },
        },
        {
          value: "invalidate",
          label: {
            en: "Invalidate cached credentials (-k)",
            id: "Batalkan kredensial tersimpan (-k)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "loginMode",
      flag: "-i",
      choice: { field: "mode", value: "login" },
      label: { en: "Login shell", id: "Shell login" },
      description: {
        en: "Request the target account's login shell and login-like environment.",
        id: "Minta shell login dan lingkungan mirip login akun tujuan.",
      },
    },
    {
      id: "shellMode",
      flag: "-s",
      choice: { field: "mode", value: "shell" },
      label: { en: "Shell", id: "Shell" },
      description: {
        en: "Start a shell without requesting a login environment; shell choice and environment depend on policy.",
        id: "Mulai shell tanpa meminta lingkungan login; pilihan shell dan lingkungan bergantung pada kebijakan.",
      },
    },
    {
      id: "listMode",
      flag: "-l",
      choice: { field: "mode", value: "list" },
      label: { en: "List permissions", id: "Tampilkan izin" },
      description: {
        en: "List permitted operations for the selected run-as user/group.",
        id: "Tampilkan operasi yang diizinkan untuk pengguna/grup tujuan terpilih.",
      },
    },
    {
      id: "validateMode",
      flag: "-v",
      choice: { field: "mode", value: "validate" },
      label: { en: "Refresh credentials", id: "Perbarui kredensial" },
      description: {
        en: "Refresh cached authentication without running a command; a terminal may ask for authentication.",
        id: "Perbarui autentikasi tersimpan tanpa menjalankan perintah; terminal dapat meminta autentikasi.",
      },
    },
    {
      id: "invalidateMode",
      flag: "-k",
      choice: { field: "mode", value: "invalidate" },
      label: { en: "Invalidate credentials", id: "Batalkan kredensial" },
      description: {
        en: "Invalidate this session's cached credentials. It does not revoke authorization or every session's cache.",
        id: "Batalkan kredensial tersimpan sesi ini. Ini tidak mencabut otorisasi atau cache semua sesi.",
      },
    },
  ],
  arguments: [
    {
      id: "user",
      required: true,
      defaultValue: "root",
      placeholder: "root",
      when: { field: "mode", value: "invalidate", not: true },
      label: { en: "Target user (-u)", id: "Pengguna tujuan (-u)" },
      description: {
        en: "Common account name. Root is selected explicitly by default; this does not establish permission to use it.",
        id: "Nama akun umum. Root dipilih secara eksplisit sebagai bawaan; ini tidak membuktikan izin untuk menggunakannya.",
      },
    },
    {
      id: "group",
      required: false,
      placeholder: "developers",
      when: { field: "mode", value: "invalidate", not: true },
      label: { en: "Target primary group (-g)", id: "Grup utama tujuan (-g)" },
      description: {
        en: "Optional common group name; account/group existence is not checked.",
        id: "Nama grup umum opsional; keberadaan akun/grup tidak diperiksa.",
      },
    },
    ...privilegeCommandArguments("run"),
  ],
  warnings: [
    {
      en: "Elevated privileges can affect the entire system. Review the executable and every argument. Quoting prevents shell expansion, not harmful program behavior. This app never executes commands, checks authorization, or requests or stores passwords.",
      id: "Hak istimewa yang ditingkatkan dapat memengaruhi seluruh sistem. Periksa program dan setiap argumen. Kutip mencegah ekspansi shell, bukan perilaku program yang berbahaya. Aplikasi ini tidak menjalankan perintah, memeriksa otorisasi, atau meminta maupun menyimpan kata sandi.",
    },
  ],
  examples: [
    {
      command: "sudo apt update",
      description: {
        en: "Request a package-index update; policy decides the default target, usually root.",
        id: "Minta pembaruan indeks paket; kebijakan menentukan pengguna bawaan, biasanya root.",
      },
    },
    {
      command: "sudo systemctl restart nginx",
      description: {
        en: "Request a service restart, subject to authorization.",
        id: "Minta mulai ulang layanan, sesuai otorisasi.",
      },
    },
    {
      command: "sudo -u postgres psql",
      description: {
        en: "Request psql as postgres.",
        id: "Minta psql sebagai postgres.",
      },
    },
    {
      command: "sudo -u www-data whoami",
      description: {
        en: "Request effective-username output as www-data.",
        id: "Minta keluaran nama pengguna efektif sebagai www-data.",
      },
    },
    {
      command: "sudo -g developers id",
      description: {
        en: "With -g but no -u, sudo runs as the invoking user with the selected group. This builder emits -u explicitly.",
        id: "Dengan -g tanpa -u, sudo berjalan sebagai pengguna pemanggil dengan grup terpilih. Builder ini menghasilkan -u secara eksplisit.",
      },
    },
    {
      command: "sudo -i",
      description: {
        en: "Request a login shell, usually as root.",
        id: "Minta shell login, biasanya sebagai root.",
      },
    },
    {
      command: "sudo -s",
      description: {
        en: "Request a shell without login-mode initialization.",
        id: "Minta shell tanpa inisialisasi mode login.",
      },
    },
    {
      command: "sudo -l",
      description: {
        en: "List permitted operations.",
        id: "Tampilkan operasi yang diizinkan.",
      },
    },
    {
      command: "sudo -v",
      description: {
        en: "Refresh cached authentication.",
        id: "Perbarui autentikasi tersimpan.",
      },
    },
    {
      command: "sudo -k",
      description: {
        en: "Invalidate cached authentication for this session.",
        id: "Batalkan autentikasi tersimpan untuk sesi ini.",
      },
    },
  ],
};
