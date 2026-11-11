import type { CommandDefinition } from "../types";
import { bi, example } from "./packageFields";

export const packageConcepts: NonNullable<CommandDefinition["concepts"]> = [
  ["Debian package", "Paket Debian", "A .deb archive contains package files, metadata and possibly maintainer scripts.", "Arsip .deb memuat berkas paket, metadata, dan mungkin skrip pemelihara."],
  ["APT repository", "Repositori APT", "A configured source of package metadata and archives.", "Sumber metadata dan arsip paket yang dikonfigurasi."],
  ["Package index", "Indeks paket", "The local list of packages available from configured repositories; apt update refreshes it.", "Daftar lokal paket dari repositori terkonfigurasi; apt update memperbaruinya."],
  ["Dependency", "Ketergantungan", "Another package required for installation or operation. APT can resolve available dependencies.", "Paket lain yang dibutuhkan untuk instalasi atau operasi. APT dapat menyelesaikan ketergantungan yang tersedia."],
  ["Recommended package", "Paket yang direkomendasikan", "A suggested companion package; --no-install-recommends omits automatic installation of these recommendations.", "Paket pendamping yang disarankan; --no-install-recommends meniadakan pemasangan rekomendasi otomatis."],
  ["Installed and candidate versions", "Versi terpasang dan kandidat", "The installed version is present locally; the candidate is the version APT would select from its sources and priorities.", "Versi terpasang ada secara lokal; kandidat adalah versi yang akan dipilih APT dari sumber dan prioritasnya."],
  ["Upgrade", "Peningkatan", "An upgrade may replace installed versions; full-upgrade may also remove packages to resolve dependencies.", "Peningkatan dapat mengganti versi terpasang; full-upgrade juga dapat menghapus paket untuk menyelesaikan ketergantungan."],
  ["Removal and purge", "Penghapusan dan purge", "Remove normally leaves package-managed configuration; purge also removes package-managed configuration, but not every user-created file.", "Remove biasanya menyisakan konfigurasi yang dikelola paket; purge juga menghapus konfigurasi tersebut, tetapi tidak semua berkas buatan pengguna."],
  ["Administrator privileges", "Hak administrator", "Changing the system package state usually requires authorization; read-only queries ordinarily do not.", "Mengubah keadaan paket sistem biasanya memerlukan otorisasi; kueri hanya-baca biasanya tidak."],
].map(([en, id, descEn, descId]) => ({ term: bi(en!, id!), description: bi(descEn!, descId!) }));

export const packageComparison: NonNullable<CommandDefinition["comparison"]> = [
  { command: "apt", description: bi("Search repositories and install, upgrade, or remove packages with dependency handling.", "Cari repositori dan pasang, tingkatkan, atau hapus paket dengan penanganan ketergantungan.") },
  { command: "apt-cache", description: bi("Query cached package metadata without changing installed packages.", "Kueri metadata paket tersimpan tanpa mengubah paket terpasang.") },
  { command: "dpkg", description: bi("Inspect installed packages and manage local .deb archives; dependency resolution is limited.", "Periksa paket terpasang dan kelola arsip .deb lokal; penyelesaian ketergantungan terbatas.") },
];

export const packageWorkflow: CommandDefinition["examples"] = [
  example("sudo apt update", "Refresh package indexes; this does not install packages.", "Perbarui indeks paket; ini tidak memasang paket."),
  example("apt search nginx", "Find candidate packages by name or description.", "Cari paket kandidat menurut nama atau deskripsi."),
  example("apt show nginx", "Inspect a candidate package before installation.", "Periksa paket kandidat sebelum pemasangan."),
  example("sudo apt install nginx", "Install the selected package if authorized.", "Pasang paket terpilih jika diizinkan."),
  example("systemctl status nginx", "Check service state separately; installation does not guarantee a running service, and not every package provides one.", "Periksa keadaan layanan secara terpisah; pemasangan tidak menjamin layanan berjalan, dan tidak setiap paket memilikinya."),
];

export function withWorkflow(examples: CommandDefinition["examples"]): CommandDefinition["examples"] {
  const existing = new Set(examples.map((item) => item.command));
  return [...examples, ...packageWorkflow.filter((item) => !existing.has(item.command))];
}
