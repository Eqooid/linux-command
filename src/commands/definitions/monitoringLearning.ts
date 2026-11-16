import type { CommandDefinition } from "../types";
import { bi, example } from "./packageFields";

export const monitoringConcepts: NonNullable<CommandDefinition["concepts"]> = [
  ["RAM and swap", "RAM dan swap", "RAM holds active working data; swap backs some memory pages on storage and is usually slower. Swap usage adds context rather than proving exhaustion.", "RAM menyimpan data kerja aktif; swap menampung sebagian halaman memori pada penyimpanan dan biasanya lebih lambat. Penggunaan swap menambah konteks, bukan membuktikan kehabisan memori."],
  ["Disk and partition", "Disk dan partisi", "A physical or virtual disk can contain partitions. lsblk TYPE may show disk, part, loop, lvm, or other device types.", "Disk fisik atau virtual dapat memuat partisi. TYPE lsblk dapat berupa disk, part, loop, lvm, atau jenis perangkat lain."],
  ["Filesystem and mount point", "Sistem berkas dan titik mount", "A filesystem organizes stored files. Its mount point is the directory where it is attached, such as / or /home.", "Sistem berkas mengatur berkas tersimpan. Titik mount adalah direktori tempat sistem berkas terpasang, seperti / atau /home."],
  ["Used and available space", "Ruang terpakai dan tersedia", "Available space may exclude reserved filesystem blocks. Inodes track file objects; inode exhaustion can prevent new files even with free data blocks.", "Ruang tersedia mungkin tidak mencakup blok cadangan sistem berkas. Inode melacak objek berkas; kehabisan inode dapat mencegah berkas baru meski blok data masih tersedia."],
  ["Filesystem capacity and directory usage", "Kapasitas sistem berkas dan penggunaan direktori", "df reports filesystem accounting; du walks reachable file trees. Deleted-but-open files, permissions, reserved blocks and filesystem metadata can make the totals differ.", "df melaporkan pencatatan sistem berkas; du menelusuri pohon berkas yang dapat diakses. Berkas terhapus yang masih terbuka, izin, blok cadangan, dan metadata dapat menyebabkan total berbeda."],
  ["Kernel and distribution", "Kernel dan distribusi", "uname describes the kernel and machine, not reliably the Ubuntu or Debian release. /etc/os-release documents distribution identity.", "uname menjelaskan kernel dan mesin, bukan versi Ubuntu atau Debian secara andal. /etc/os-release mencatat identitas distribusi."],
  ["Uptime and load average", "Uptime dan rata-rata beban", "Uptime measures time since boot. Linux load averages summarize runnable and uninterruptible tasks over 1, 5 and 15 minutes, including some I/O waits; they are not CPU percentages. Interpret them alongside CPU count.", "Uptime mengukur waktu sejak boot. Rata-rata beban Linux merangkum tugas runnable dan uninterruptible selama 1, 5, dan 15 menit, termasuk sebagian penantian I/O; nilainya bukan persentase CPU. Tafsirkan bersama jumlah CPU."],
  ["UUID and device name", "UUID dan nama perangkat", "Device names such as /dev/sda, /dev/sda1, /dev/nvme0n1 and /dev/nvme0n1p1 depend on hardware and environment and can change between boots. Filesystem UUIDs help persistent references, but cloned filesystems can duplicate them.", "Nama perangkat seperti /dev/sda, /dev/sda1, /dev/nvme0n1, dan /dev/nvme0n1p1 bergantung pada perangkat keras dan lingkungan serta dapat berubah antarboot. UUID sistem berkas membantu referensi persisten, tetapi hasil kloning dapat memiliki UUID sama."],
  ["Scenario: memory pressure", "Skenario: tekanan memori", "On Ubuntu Server, free -h helps compare available RAM and swap usage. High used RAM alone does not prove a problem; Linux reuses RAM for reclaimable buffers and cache.", "Pada Ubuntu Server, free -h membantu membandingkan RAM tersedia dan penggunaan swap. RAM terpakai tinggi saja tidak membuktikan masalah; Linux memakai RAM untuk buffer dan cache yang dapat diambil kembali."],
  ["Scenario: filesystem nearly full", "Skenario: sistem berkas hampir penuh", "Use df -h to find a nearly full filesystem, then du -sh /var/log and du -h --max-depth=1 /var to investigate directories. Permissions may hide some usage. Do not delete unfamiliar system files.", "Gunakan df -h untuk menemukan sistem berkas hampir penuh, lalu du -sh /var/log dan du -h --max-depth=1 /var untuk menyelidiki direktori. Izin dapat menyembunyikan sebagian penggunaan. Jangan hapus berkas sistem yang tidak dikenal."],
  ["Scenario: disks and partitions", "Skenario: disk dan partisi", "Compare lsblk, lsblk -f and df -hT to relate device trees, filesystem types and mount points. A filesystem mounted at a path can be identified using df -hT with that path. These checks do not fully diagnose every performance issue.", "Bandingkan lsblk, lsblk -f, dan df -hT untuk menghubungkan pohon perangkat, jenis sistem berkas, dan titik mount. Sistem berkas yang terpasang pada jalur dapat dikenali memakai df -hT dengan jalur itu. Pemeriksaan ini tidak mendiagnosis setiap masalah kinerja secara lengkap."],
].map(([en, id, descEn, descId]) => ({ term: bi(en!, id!), description: bi(descEn!, descId!) }));

const workflow: CommandDefinition["examples"] = [
  example("free -h", "Inspect RAM and swap; compare available memory before diagnosing pressure.", "Periksa RAM dan swap; bandingkan memori tersedia sebelum mendiagnosis tekanan."),
  example("df -h", "Inspect filesystem capacity and available space.", "Periksa kapasitas sistem berkas dan ruang tersedia."),
  example("du -sh /var/log", "Estimate allocated disk usage for the log directory.", "Perkirakan penggunaan disk teralokasi pada direktori log."),
  example("uptime", "Inspect time since boot and recent load averages.", "Periksa waktu sejak boot dan rata-rata beban terbaru."),
  example("uname -r", "Read the kernel release.", "Baca rilis kernel."),
  example("lsblk -f", "Relate block devices, filesystem identifiers and mount points.", "Hubungkan perangkat blok, pengenal sistem berkas, dan titik mount."),
];

export function monitoringExamples(examples: CommandDefinition["examples"]): CommandDefinition["examples"] {
  const existing = new Set(examples.map((entry) => entry.command));
  return [...examples, ...workflow.filter((entry) => !existing.has(entry.command))];
}

export const monitoringNotes = [bi(
  "Commands are text only; no hardware, disks or system information are read here. These options target GNU coreutils, procps-ng and util-linux on Linux; installed versions and other operating systems can differ.",
  "Perintah hanya berupa teks; perangkat keras, disk, atau informasi sistem tidak dibaca di sini. Opsi ini menargetkan GNU coreutils, procps-ng, dan util-linux di Linux; versi terpasang dan sistem operasi lain dapat berbeda."
)];
