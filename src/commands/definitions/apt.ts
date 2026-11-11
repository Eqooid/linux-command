import type { CommandDefinition } from "../types";
import { arg, bi, choice, example, group, item, opt } from "./packageFields";
import { packageComparison, packageConcepts, withWorkflow } from "./packageLearning";

const changesPackages = ["install", "remove", "purge"];
const changeActions = ["update", "upgrade", "full-upgrade", "install", "remove", "purge", "autoremove"];

export const apt: CommandDefinition = {
  id: "apt", name: "apt", category: "packages",
  description: bi("Search, inspect and manage packages from configured APT repositories.", "Cari, periksa, dan kelola paket dari repositori APT terkonfigurasi."),
  explanation: bi(
    "APT manages Debian-family packages and their available dependencies. update refreshes repository indexes but does not upgrade packages. upgrade updates installed packages without removing installed packages; full-upgrade can remove packages to resolve dependency changes. install adds packages, remove normally leaves package-managed configuration, and purge also removes that configuration. autoremove proposes automatically installed dependencies no longer needed; inspect its plan. Search, show and list read metadata. -y accepts supported prompts and can hide important decisions. sudo is an explicit choice, not automatically added. Installing a package does not guarantee a running service; not every package provides one.",
    "APT mengelola paket keluarga Debian dan ketergantungan yang tersedia. update memperbarui indeks repositori tetapi tidak meningkatkan paket. upgrade meningkatkan paket terpasang tanpa menghapus paket terpasang; full-upgrade dapat menghapus paket untuk menyesuaikan ketergantungan. install memasang paket, remove biasanya menyisakan konfigurasi yang dikelola paket, dan purge juga menghapus konfigurasi itu. autoremove mengusulkan penghapusan ketergantungan otomatis yang tidak dibutuhkan; tinjau rencananya. Search, show, dan list membaca metadata. -y menerima prompt yang didukung dan dapat menyembunyikan keputusan penting. sudo pilihan eksplisit, tidak ditambahkan otomatis. Pemasangan paket tidak menjamin layanan berjalan; tidak setiap paket menyediakan layanan."
  ),
  syntax: "[sudo] apt action [-y] [--no-install-recommends] [--reinstall] [--installed|--upgradable] [package ... | pattern]",
  form: { kind: "grouped", groups: [
    group("action", "Package action", "Tindakan paket", ["action"]),
    group("target", "Package or search term", "Paket atau istilah pencarian", ["packages", "pattern"]),
    group("options", "Action options", "Opsi tindakan", ["assumeYes", "noRecommends", "reinstall", "listFilter"]),
    group("privileges", "Optional authorization", "Otorisasi opsional", ["sudo"]),
  ] },
  choices: [
    choice("action", "Action", "Tindakan", "Select one APT operation.", "Pilih satu operasi APT.", "update", [
      item("update", "Update indexes", "Perbarui indeks"), item("upgrade", "Upgrade packages", "Tingkatkan paket"),
      item("full-upgrade", "Full upgrade", "Peningkatan penuh"), item("install", "Install", "Pasang"),
      item("remove", "Remove", "Hapus"), item("purge", "Purge", "Hapus bersih"),
      item("autoremove", "Autoremove", "Hapus otomatis"), item("search", "Search", "Cari"),
      item("show", "Show package", "Tampilkan paket"), item("list", "List packages", "Daftar paket"),
    ]),
    { ...choice("listFilter", "List view", "Tampilan daftar", "Limit list output to installed or upgradable packages.", "Batasi daftar ke paket terpasang atau yang dapat ditingkatkan.", "all", [item("all", "All", "Semua"), item("installed", "Installed", "Terpasang"), item("upgradable", "Upgradable", "Dapat ditingkatkan")]), when: { field: "action", value: "list" } },
  ],
  options: [
    opt("assumeYes", "-y", "Assume yes", "Anggap ya", "Accept supported confirmation prompts; review changes first.", "Terima prompt konfirmasi yang didukung; tinjau perubahan dahulu.", { when: { field: "action", value: ["upgrade", "full-upgrade", ...changesPackages, "autoremove"] } }),
    opt("noRecommends", "--no-install-recommends", "Omit recommended packages", "Abaikan paket rekomendasi", "Install required dependencies but skip automatically installing recommendations.", "Pasang ketergantungan wajib tetapi lewati pemasangan rekomendasi otomatis.", { when: { field: "action", value: "install" } }),
    opt("reinstall", "--reinstall", "Reinstall packages", "Pasang ulang paket", "Reinstall selected packages when supported.", "Pasang ulang paket terpilih bila didukung.", { when: { field: "action", value: "install" } }),
    opt("installedOption", "--installed", "Installed only", "Hanya terpasang", "List installed packages.", "Daftar paket terpasang.", { choice: { field: "listFilter", value: "installed" } }),
    opt("upgradableOption", "--upgradable", "Upgradable only", "Hanya dapat ditingkatkan", "List available upgrades.", "Daftar peningkatan tersedia.", { choice: { field: "listFilter", value: "upgradable" } }),
    opt("sudo", "sudo", "Add sudo", "Tambahkan sudo", "Optional authorization for package-changing operations; never enabled automatically.", "Otorisasi opsional untuk operasi pengubah paket; tidak pernah aktif otomatis.", { when: { field: "action", value: changeActions } }),
  ],
  arguments: [
    arg("packages", "Package names", "Nama paket", "One package per row; common Debian names and optional architecture suffix only.", "Satu paket per baris; hanya nama Debian umum dan akhiran arsitektur opsional.", "nginx", true, { multiple: true, addLabel: bi("Add package", "Tambah paket"), removeLabel: bi("Remove package", "Hapus paket"), when: { field: "action", value: ["install", "remove", "purge", "show"] } }),
    arg("pattern", "Search pattern", "Pola pencarian", "APT searches package names and descriptions; the pattern is not a shell expression.", "APT mencari nama dan deskripsi paket; polanya bukan ekspresi shell.", "nginx", true, { when: { field: "action", value: "search" } }),
  ],
  warnings: [bi("Generated text only. APT and dpkg are Debian-family tools; available packages, dependencies and authorization are not checked.", "Hanya teks yang dihasilkan. APT dan dpkg adalah alat keluarga Debian; paket, ketergantungan, dan otorisasi tidak diperiksa.")],
  concepts: packageConcepts, comparison: packageComparison,
  examples: withWorkflow([
    example("sudo apt update", "Refresh repository indexes.", "Perbarui indeks repositori."),
    example("sudo apt upgrade", "Upgrade installed packages without removals in APT's ordinary upgrade mode.", "Tingkatkan paket terpasang tanpa penghapusan pada mode upgrade biasa APT."),
    example("sudo apt full-upgrade", "Allow dependency changes including removals; inspect the plan.", "Izinkan perubahan ketergantungan termasuk penghapusan; tinjau rencananya."),
    example("sudo apt install nginx curl git", "Install several packages.", "Pasang beberapa paket."),
    example("sudo apt remove nginx", "Remove a package while usually leaving package-managed configuration.", "Hapus paket tetapi biasanya tinggalkan konfigurasi yang dikelola paket."),
    example("sudo apt purge nginx", "Remove package-managed configuration too.", "Hapus juga konfigurasi yang dikelola paket."),
    example("sudo apt autoremove", "Review unneeded automatic dependencies.", "Tinjau ketergantungan otomatis yang tidak diperlukan."),
    example("apt list --installed", "List installed packages.", "Daftar paket terpasang."),
    example("apt list --upgradable", "List available upgrades.", "Daftar peningkatan tersedia."),
  ]),
};
