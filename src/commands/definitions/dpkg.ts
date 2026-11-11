import type { CommandDefinition } from "../types";
import { arg, bi, choice, example, group, item, opt } from "./packageFields";
import { packageComparison, packageConcepts } from "./packageLearning";

export const dpkg: CommandDefinition = {
  id: "dpkg", name: "dpkg", category: "packages",
  description: bi("Inspect Debian package status and manage local .deb archives.", "Periksa status paket Debian dan kelola arsip .deb lokal."),
  explanation: bi(
    "dpkg is the lower-level Debian package tool. -l lists package status, -s shows installed-package status, -L lists files a package installed, and -S searches which package owns a path. -i installs a local .deb, -r removes a named package, and -P purges it. --contents and --info inspect a .deb archive without installing it. Direct dpkg installation does not automatically resolve missing dependencies like APT can; sudo apt install ./package.deb can handle dependencies when they are available from configured sources. Package installation can run maintainer scripts. No package or archive is inspected by this browser.",
    "dpkg adalah alat paket Debian tingkat rendah. -l mencantumkan status paket, -s menampilkan status paket terpasang, -L mencantumkan berkas yang dipasang paket, dan -S mencari paket pemilik jalur. -i memasang .deb lokal, -r menghapus paket bernama, dan -P membersihkannya. --contents dan --info memeriksa arsip .deb tanpa memasangnya. Pemasangan langsung dengan dpkg tidak otomatis menyelesaikan ketergantungan yang hilang seperti APT; sudo apt install ./package.deb dapat menangani ketergantungan jika tersedia dari sumber terkonfigurasi. Pemasangan paket dapat menjalankan skrip pemelihara. Browser ini tidak memeriksa paket atau arsip."
  ),
  syntax: "[sudo] dpkg {-l [package]|-s package|-L package|-S path|-i archive.deb|-r package|-P package|--contents archive.deb|--info archive.deb}",
  form: { kind: "grouped", groups: [
    group("operation", "Package operation", "Operasi paket", ["operation"]),
    group("target", "Package or local file", "Paket atau berkas lokal", ["listFilter", "package", "ownedPath", "archivePath"]),
    group("privileges", "Optional authorization", "Otorisasi opsional", ["sudo"]),
  ] },
  choices: [choice("operation", "Operation", "Operasi", "Choose one dpkg operation.", "Pilih satu operasi dpkg.", "list", [
    item("list", "List package status (-l)", "Daftar status paket (-l)"),
    item("status", "Show package status (-s)", "Tampilkan status paket (-s)"),
    item("files", "List installed files (-L)", "Daftar berkas terpasang (-L)"),
    item("owner", "Find file owner (-S)", "Cari pemilik berkas (-S)"),
    item("install", "Install local .deb (-i)", "Pasang .deb lokal (-i)"),
    item("remove", "Remove package (-r)", "Hapus paket (-r)"),
    item("purge", "Purge package (-P)", "Hapus bersih paket (-P)"),
    item("contents", "Archive contents", "Isi arsip"),
    item("info", "Archive metadata", "Metadata arsip"),
  ])],
  options: [
    opt("listOption", "-l", "List", "Daftar", "List installed package status.", "Daftar status paket terpasang.", { choice: { field: "operation", value: "list" } }),
    opt("statusOption", "-s", "Status", "Status", "Show a named package's status.", "Tampilkan status paket bernama.", { choice: { field: "operation", value: "status" } }),
    opt("filesOption", "-L", "Installed files", "Berkas terpasang", "List files installed by a package.", "Daftar berkas yang dipasang paket.", { choice: { field: "operation", value: "files" } }),
    opt("ownerOption", "-S", "File ownership", "Kepemilikan berkas", "Search package ownership for a file path or pattern.", "Cari kepemilikan paket untuk jalur atau pola berkas.", { choice: { field: "operation", value: "owner" } }),
    opt("installOption", "-i", "Install archive", "Pasang arsip", "Install a local .deb; dependencies may remain unresolved.", "Pasang .deb lokal; ketergantungan mungkin belum terselesaikan.", { choice: { field: "operation", value: "install" } }),
    opt("removeOption", "-r", "Remove", "Hapus", "Remove a named package.", "Hapus paket bernama.", { choice: { field: "operation", value: "remove" } }),
    opt("purgeOption", "-P", "Purge", "Hapus bersih", "Remove package-managed configuration too.", "Hapus juga konfigurasi yang dikelola paket.", { choice: { field: "operation", value: "purge" } }),
    opt("contentsOption", "--contents", "Contents", "Isi", "Inspect the archive file list.", "Periksa daftar berkas arsip.", { choice: { field: "operation", value: "contents" } }),
    opt("infoOption", "--info", "Info", "Info", "Inspect archive metadata.", "Periksa metadata arsip.", { choice: { field: "operation", value: "info" } }),
    opt("sudo", "sudo", "Add sudo", "Tambahkan sudo", "Optional authorization for install, remove and purge; never enabled automatically.", "Otorisasi opsional untuk pasang, hapus, dan bersihkan; tidak pernah aktif otomatis.", { when: { field: "operation", value: ["install", "remove", "purge"] } }),
  ],
  arguments: [
    arg("listFilter", "Optional package name", "Nama paket opsional", "Limit the status list to one literal package name.", "Batasi daftar status pada satu nama paket literal.", "nginx", false, { when: { field: "operation", value: "list" } }),
    arg("package", "Package name", "Nama paket", "A literal package name, not a .deb path.", "Nama paket literal, bukan jalur .deb.", "nginx", true, { when: { field: "operation", value: ["status", "files", "remove", "purge"] } }),
    arg("ownedPath", "Installed file path or pattern", "Jalur atau pola berkas terpasang", "Search installed file ownership; no filesystem query is made here.", "Cari kepemilikan berkas terpasang; tidak ada kueri sistem berkas di sini.", "/usr/bin/curl", true, { when: { field: "operation", value: "owner" } }),
    arg("archivePath", "Local .deb file path", "Jalur berkas .deb lokal", "A local archive path; spaces are quoted and leading hyphens are prefixed with ./.", "Jalur arsip lokal; spasi dikutip dan tanda hubung awal diberi awalan ./.", "./package.deb", true, { when: { field: "operation", value: ["install", "contents", "info"] } }),
  ],
  warnings: [bi("Generated text only. dpkg operations and local archive contents are not inspected. Debian-family package tools are not universal across Linux distributions.", "Hanya teks yang dihasilkan. Operasi dpkg dan isi arsip lokal tidak diperiksa. Alat paket keluarga Debian tidak universal di semua distribusi Linux.")],
  concepts: packageConcepts, comparison: packageComparison,
  examples: [
    example("dpkg -l", "List package states.", "Daftar keadaan paket."),
    example("dpkg -l nginx", "Filter one package name.", "Filter satu nama paket."),
    example("dpkg -s nginx", "Show installed-package status.", "Tampilkan status paket terpasang."),
    example("dpkg -L nginx", "List installed files.", "Daftar berkas terpasang."),
    example("dpkg -S /usr/bin/curl", "Find the package owning an installed path.", "Cari paket pemilik jalur terpasang."),
    example("sudo dpkg -i package.deb", "Install a local archive when authorized; dependencies may need APT.", "Pasang arsip lokal jika diizinkan; ketergantungan mungkin memerlukan APT."),
    example("sudo dpkg -r nginx", "Remove a named package.", "Hapus paket bernama."),
    example("sudo dpkg -P nginx", "Purge a named package.", "Hapus bersih paket bernama."),
    example("dpkg --contents package.deb", "List files inside an archive.", "Daftar berkas di dalam arsip."),
    example("dpkg --info package.deb", "Show archive metadata.", "Tampilkan metadata arsip."),
    example("sudo apt install ./package.deb", "APT can resolve available dependencies for a local archive; this is an educational example.", "APT dapat menyelesaikan ketergantungan tersedia untuk arsip lokal; ini contoh pembelajaran."),
  ],
};
