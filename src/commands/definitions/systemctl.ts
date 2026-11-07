import type { CommandDefinition } from "../types";
import {
  changingActions,
  listingActions,
  unitActions,
  unitTypes,
} from "../systemd";
import {
  systemdComparison,
  systemdConcepts,
  troubleshootingExample,
} from "../systemdLearning";

export const systemctl: CommandDefinition = {
  id: "systemctl",
  name: "systemctl",
  category: "services",
  description: {
    en: "Inspect systemd units and configure service actions without executing them.",
    id: "Periksa unit systemd dan atur tindakan layanan tanpa mengeksekusinya.",
  },
  explanation: {
    en: "systemctl inspects or manages the systemd system or user manager. status shows runtime state and recent status information; is-active checks runtime activation, while is-enabled checks enablement. start activates a unit now; stop deactivates it; restart stops and starts it (and can start an inactive unit). reload asks the unit to reload its own configuration when supported; reload-or-restart falls back to restart. enable configures activation links, often for boot, while disable removes installation links. Neither automatically starts/stops without --now. list-units lists units loaded in memory; --all adds inactive loaded units. list-unit-files lists installed unit files, including templates. daemon-reload rereads manager configuration and unit files without restarting services. A missing suffix is often interpreted as .service, but this builder preserves your input unless you explicitly choose a suffix.",
    id: "systemctl memeriksa atau mengelola pengelola sistem atau pengguna systemd. status menampilkan keadaan berjalan dan informasi status terbaru; is-active memeriksa aktivasi saat berjalan, sedangkan is-enabled memeriksa pengaktifan. start mengaktifkan unit sekarang; stop menonaktifkannya; restart menghentikan lalu memulai (dan bisa memulai unit tidak aktif). reload meminta unit memuat ulang konfigurasinya sendiri bila didukung; reload-or-restart memakai restart bila reload tidak didukung. enable mengatur tautan aktivasi, sering untuk boot, sedangkan disable menghapus tautan instalasi. Keduanya tidak otomatis memulai/menghentikan tanpa --now. list-units mencantumkan unit yang dimuat dalam memori; --all menambahkan unit termuat yang tidak aktif. list-unit-files mencantumkan berkas unit terpasang, termasuk templat. daemon-reload membaca ulang konfigurasi pengelola dan berkas unit tanpa memulai ulang layanan. Nama tanpa akhiran sering dianggap .service, tetapi builder ini mempertahankan masukan kecuali Anda memilih akhiran secara eksplisit.",
  },
  syntax:
    "[sudo] systemctl [--user] [--now] [--type=type] [--all] action [-- unit]",
  form: {
    kind: "grouped",
    groups: [
      {
        id: "operation",
        title: { en: "Action and manager", id: "Tindakan dan pengelola" },
        fields: ["action", "scope"],
      },
      {
        id: "target",
        title: { en: "Unit and action options", id: "Unit dan opsi tindakan" },
        fields: ["unit", "unitType", "now", "all"],
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
      id: "action",
      label: { en: "Action", id: "Tindakan" },
      description: {
        en: "Choose one action; unit input and options adapt to it. Changes only happen if you run the copied command yourself.",
        id: "Pilih satu tindakan; masukan unit dan opsi menyesuaikannya. Perubahan hanya terjadi bila Anda menjalankan sendiri perintah yang disalin.",
      },
      defaultValue: "status",
      items: [
        {
          value: "status",
          label: {
            en: "status — inspect unit state",
            id: "status — periksa keadaan unit",
          },
        },
        {
          value: "start",
          label: {
            en: "start — activate now",
            id: "start — aktifkan sekarang",
          },
        },
        {
          value: "stop",
          label: {
            en: "stop — deactivate now",
            id: "stop — hentikan sekarang",
          },
        },
        {
          value: "restart",
          label: {
            en: "restart — stop and start",
            id: "restart — hentikan dan mulai",
          },
        },
        {
          value: "reload",
          label: {
            en: "reload — reload service configuration",
            id: "reload — muat ulang konfigurasi layanan",
          },
        },
        {
          value: "reload-or-restart",
          label: {
            en: "reload-or-restart — reload or restart",
            id: "reload-or-restart — muat ulang atau mulai ulang",
          },
        },
        {
          value: "enable",
          label: {
            en: "enable — configure activation links",
            id: "enable — atur tautan aktivasi",
          },
        },
        {
          value: "disable",
          label: {
            en: "disable — remove activation links",
            id: "disable — hapus tautan aktivasi",
          },
        },
        {
          value: "is-active",
          label: {
            en: "is-active — check runtime activation",
            id: "is-active — periksa aktivasi saat berjalan",
          },
        },
        {
          value: "is-enabled",
          label: {
            en: "is-enabled — check enablement",
            id: "is-enabled — periksa pengaktifan",
          },
        },
        {
          value: "list-units",
          label: {
            en: "list-units — list loaded units",
            id: "list-units — daftar unit termuat",
          },
        },
        {
          value: "list-unit-files",
          label: {
            en: "list-unit-files — list installed unit files",
            id: "list-unit-files — daftar berkas unit terpasang",
          },
        },
        {
          value: "daemon-reload",
          label: {
            en: "daemon-reload — reread manager configuration",
            id: "daemon-reload — baca ulang konfigurasi pengelola",
          },
        },
      ],
    },
    {
      id: "scope",
      label: { en: "Manager scope", id: "Cakupan pengelola" },
      description: {
        en: "Default system manager, or the current user's manager with --user. No sudo is offered for user mode.",
        id: "Pengelola sistem bawaan, atau pengelola pengguna saat ini dengan --user. Sudo tidak ditawarkan untuk mode pengguna.",
      },
      defaultValue: "system",
      items: [
        {
          value: "system",
          label: { en: "System manager", id: "Pengelola sistem" },
        },
        {
          value: "user",
          label: {
            en: "User manager (--user)",
            id: "Pengelola pengguna (--user)",
          },
        },
      ],
    },
    {
      id: "unitType",
      when: { field: "action", value: [...unitActions, ...listingActions] },
      label: { en: "Unit type", id: "Jenis unit" },
      description: {
        en: "For unit actions, a selected type explicitly appends its suffix to an unsuffixed name. Keep As entered for a name already ending in .service, .socket, etc. For listings this is a --type filter, not a suffix.",
        id: "Untuk tindakan unit, jenis terpilih menambahkan akhiran secara eksplisit ke nama tanpa akhiran. Biarkan Sesuai masukan untuk nama yang sudah berakhiran .service, .socket, dll. Untuk daftar, ini filter --type, bukan akhiran.",
      },
      defaultValue: "auto",
      items: [
        {
          value: "auto",
          label: {
            en: "As entered / all types",
            id: "Sesuai masukan / semua jenis",
          },
        },
        ...unitTypes.map((value) => ({
          value,
          label: { en: `.${value}`, id: `.${value}` },
        })),
      ],
    },
  ],
  options: [
    {
      id: "userScope",
      flag: "--user",
      choice: { field: "scope", value: "user" },
      label: { en: "User manager", id: "Pengelola pengguna" },
      description: {
        en: "Operate on the current user's manager rather than the system manager.",
        id: "Gunakan pengelola pengguna saat ini, bukan pengelola sistem.",
      },
    },
    {
      id: "typeFilter",
      flag: "--type",
      choice: { field: "unitType", value: "service" },
      when: { field: "action", value: listingActions },
      label: { en: "Listing type filter", id: "Filter jenis daftar" },
      description: {
        en: "Listing actions accept the selected unit type as --type=service/socket/timer/target/mount. Unit-specific actions instead use the explicit suffix selector.",
        id: "Tindakan daftar menerima jenis unit terpilih sebagai --type=service/socket/timer/target/mount. Tindakan unit memakai pemilih akhiran eksplisit.",
      },
    },
    {
      id: "now",
      flag: "--now",
      when: { field: "action", value: ["enable", "disable"] },
      label: {
        en: "Also start or stop now",
        id: "Sekaligus mulai atau hentikan sekarang",
      },
      description: {
        en: "enable --now enables and starts; disable --now disables and stops. Without this flag enable/disable change installation links only.",
        id: "enable --now mengaktifkan dan memulai; disable --now menonaktifkan dan menghentikan. Tanpa flag ini enable/disable hanya mengubah tautan instalasi.",
      },
    },
    {
      id: "all",
      flag: "--all",
      when: { field: "action", value: "list-units" },
      label: {
        en: "Include inactive loaded units",
        id: "Sertakan unit termuat yang tidak aktif",
      },
      description: {
        en: "Show inactive units still loaded in memory. This is not the list of every installed unit file.",
        id: "Tampilkan unit tidak aktif yang masih dimuat dalam memori. Ini bukan daftar setiap berkas unit terpasang.",
      },
    },
    {
      id: "sudo",
      flag: "sudo",
      when: [
        { field: "scope", value: "system" },
        { field: "action", value: changingActions },
      ],
      label: {
        en: "Explicitly prepend sudo",
        id: "Tambahkan sudo secara eksplisit",
      },
      description: {
        en: "Off by default. System policy determines authorization; many read-only inspections need no elevated privileges. No credentials are requested or stored here.",
        id: "Nonaktif secara bawaan. Kebijakan sistem menentukan otorisasi; banyak pemeriksaan hanya-baca tidak memerlukan hak istimewa. Tidak ada kredensial yang diminta atau disimpan di sini.",
      },
    },
  ],
  arguments: [
    {
      id: "unit",
      required: true,
      when: { field: "action", value: unitActions },
      placeholder: "nginx.service",
      label: { en: "Unit name", id: "Nama unit" },
      description: {
        en: "One literal identifier, such as nginx, nginx.service or worker@blue.service. No globs or filesystem paths. Existence and systemd availability are not checked.",
        id: "Satu ID literal, misalnya nginx, nginx.service atau worker@blue.service. Tanpa glob atau jalur sistem berkas. Keberadaan dan ketersediaan systemd tidak diperiksa.",
      },
    },
  ],
  warnings: [
    {
      en: "This is a text-only systemd builder. It does not connect to a manager, change a service, inspect state, or request administrator credentials. Unit names and privileges are not verified.",
      id: "Ini builder systemd berupa teks saja. Tidak menghubungi pengelola, mengubah layanan, memeriksa keadaan, atau meminta kredensial administrator. Nama unit dan hak istimewa tidak diverifikasi.",
    },
  ],
  concepts: systemdConcepts,
  comparison: systemdComparison,
  examples: [
    {
      command: "systemctl status nginx",
      description: {
        en: "Inspect a service; systemctl commonly assumes .service when omitted.",
        id: "Periksa layanan; systemctl umumnya menganggap .service bila tidak ditulis.",
      },
    },
    {
      command: "systemctl start nginx",
      description: {
        en: "Start now, without enabling at boot.",
        id: "Mulai sekarang, tanpa mengaktifkan saat boot.",
      },
    },
    {
      command: "systemctl stop apache2",
      description: {
        en: "Stop the selected unit; service availability can be affected.",
        id: "Hentikan unit terpilih; ketersediaan layanan dapat terpengaruh.",
      },
    },
    {
      command: "systemctl reload nginx",
      description: {
        en: "Ask a service to reload its own configuration, if supported.",
        id: "Minta layanan memuat ulang konfigurasinya sendiri, bila didukung.",
      },
    },
    {
      command: "systemctl reload-or-restart nginx",
      description: {
        en: "Reload where supported, otherwise restart.",
        id: "Muat ulang bila didukung, jika tidak mulai ulang.",
      },
    },
    {
      command: "sudo systemctl enable --now docker",
      description: {
        en: "Explicit sudo: configure activation links and start now.",
        id: "Sudo eksplisit: atur tautan aktivasi dan mulai sekarang.",
      },
    },
    {
      command: "systemctl disable --now nginx",
      description: {
        en: "Remove activation links and stop now.",
        id: "Hapus tautan aktivasi dan hentikan sekarang.",
      },
    },
    {
      command: "systemctl --user restart my-app.service",
      description: {
        en: "Restart a unit in the current user's manager.",
        id: "Mulai ulang unit dalam pengelola pengguna saat ini.",
      },
    },
    {
      command: "systemctl list-units --type=service --all",
      description: {
        en: "List loaded services, including inactive ones.",
        id: "Daftar layanan termuat, termasuk yang tidak aktif.",
      },
    },
    {
      command: "systemctl list-unit-files --type=service",
      description: {
        en: "List installed service unit files.",
        id: "Daftar berkas unit layanan terpasang.",
      },
    },
    {
      command: "sudo systemctl daemon-reload",
      description: {
        en: "Reread manager/unit configuration without automatically restarting services.",
        id: "Baca ulang konfigurasi pengelola/unit tanpa otomatis memulai ulang layanan.",
      },
    },
    {
      command: "systemctl is-enabled nginx",
      description: {
        en: "Check enablement, not runtime health.",
        id: "Periksa pengaktifan, bukan kesehatan saat berjalan.",
      },
    },
    troubleshootingExample,
  ],
};
