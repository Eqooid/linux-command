import type { CommandDefinition } from "../types";
import { arg, bi, choice, example, group, item } from "./packageFields";
import { packageComparison, packageConcepts } from "./packageLearning";

export const aptCache: CommandDefinition = {
  id: "apt-cache", name: "apt-cache", category: "packages",
  description: bi("Query cached package descriptions, dependencies and version policy.", "Kueri deskripsi paket tersimpan, ketergantungan, dan kebijakan versi."),
  explanation: bi(
    "apt-cache reads local APT metadata without installing or removing packages. search matches package names and descriptions using a regular-expression pattern; show displays records. depends shows a package's dependencies; rdepends shows packages that depend on it. policy displays installed and candidate versions plus repository priorities. pkgnames lists known package names, which are not necessarily installed or even installable. Cached information can be stale until apt update refreshes it.",
    "apt-cache membaca metadata APT lokal tanpa memasang atau menghapus paket. search mencocokkan nama dan deskripsi paket memakai pola ekspresi reguler; show menampilkan catatan. depends menampilkan ketergantungan paket; rdepends menampilkan paket yang bergantung padanya. policy menampilkan versi terpasang dan kandidat serta prioritas repositori. pkgnames mencantumkan nama paket yang dikenal, yang belum tentu terpasang atau dapat dipasang. Informasi tersimpan dapat usang hingga apt update memperbaruinya."
  ),
  syntax: "apt-cache {search pattern|show package|depends package|rdepends package|policy package|pkgnames}",
  form: { kind: "grouped", groups: [
    group("action", "Query action", "Tindakan kueri", ["action"]),
    group("query", "Package or pattern", "Paket atau pola", ["package", "pattern"]),
  ] },
  choices: [choice("action", "Action", "Tindakan", "Choose one read-only package-cache query.", "Pilih satu kueri cache paket yang hanya-baca.", "search", [
    item("search", "Search metadata", "Cari metadata"), item("show", "Show package", "Tampilkan paket"),
    item("depends", "Dependencies", "Ketergantungan"), item("rdepends", "Reverse dependencies", "Ketergantungan balik"),
    item("policy", "Version policy", "Kebijakan versi"), item("pkgnames", "Package names", "Nama paket"),
  ])],
  options: [],
  arguments: [
    arg("package", "Package name", "Nama paket", "A literal Debian package name, with optional architecture suffix.", "Nama paket Debian literal, dengan akhiran arsitektur opsional.", "nginx", true, { when: { field: "action", value: ["show", "depends", "rdepends", "policy"] } }),
    arg("pattern", "Search pattern", "Pola pencarian", "A quoted regular-expression pattern for apt-cache search; not evaluated in this browser.", "Pola ekspresi reguler berkutip untuk apt-cache search; tidak dievaluasi di browser ini.", "nginx", true, { when: { field: "action", value: "search" } }),
  ],
  warnings: [bi("Cached package information may be outdated. This app does not query repositories or the local package cache.", "Informasi paket tersimpan mungkin usang. Aplikasi ini tidak mengueri repositori atau cache paket lokal.")],
  concepts: packageConcepts, comparison: packageComparison,
  examples: [
    example("apt-cache search nginx", "Search names and descriptions.", "Cari nama dan deskripsi."),
    example("apt-cache show nginx", "Inspect metadata for a package.", "Periksa metadata paket."),
    example("apt-cache depends nginx", "Display required and related dependencies.", "Tampilkan ketergantungan wajib dan terkait."),
    example("apt-cache rdepends nginx", "Find reverse dependencies.", "Cari ketergantungan balik."),
    example("apt-cache policy nginx", "Inspect installed/candidate versions and repository priorities.", "Periksa versi terpasang/kandidat dan prioritas repositori."),
    example("apt-cache pkgnames", "List names known to APT.", "Daftar nama yang dikenal APT."),
  ],
};
