import type { BilingualText, CommandDefinition, CommandInputs } from "./types";
import { grantsWorldWrite, permissionMode } from "./permissions";
import { isShellBuilder, isShellComposition } from "./shellComposition";
import { changingActions } from "./systemd";
import { containsSensitiveCurlContent } from "./networking";

export interface CommandWarning {
  text: BilingualText;
  level: "note" | "warning" | "danger";
}

export function getCommandWarnings(
  definition: CommandDefinition,
  inputs: CommandInputs,
): CommandWarning[] {
  const warnings: CommandWarning[] = definition.warnings.map((text) => ({
    text,
    level: [
      "rm",
      "sudo",
      "su",
      "chmod",
      "chown",
      "chgrp",
      "kill",
      "pkill",
    ].includes(definition.id)
      ? "warning"
      : "note",
  }));
  if (
    definition.id === "systemctl" &&
    changingActions.includes(inputs.action as string)
  ) {
    warnings.push({
      level: "warning",
      text: {
        en: "This action changes unit state, activation links, or manager configuration when manually run. Review the selected unit and scope. Authorization depends on system policy; no permission or unit existence is verified here.",
        id: "Tindakan ini mengubah keadaan unit, tautan aktivasi, atau konfigurasi pengelola saat dijalankan manual. Tinjau unit dan cakupan terpilih. Otorisasi bergantung pada kebijakan sistem; izin dan keberadaan unit tidak diverifikasi di sini.",
      },
    });
    if (
      ["stop", "restart", "reload-or-restart"].includes(
        inputs.action as string,
      ) ||
      (inputs.action === "disable" && inputs.now)
    )
      warnings.push({
        level: "warning",
        text: {
          en: "Stopping or restarting can cause downtime and interrupt users. Inspect status and logs before deciding to restart; restart is not an automatic fix for every error.",
          id: "Menghentikan atau memulai ulang dapat menyebabkan waktu henti dan mengganggu pengguna. Periksa status dan log sebelum memutuskan untuk mulai ulang; restart bukan solusi otomatis untuk setiap kesalahan.",
        },
      });
    if (inputs.scope === "system" && inputs.sudo === true)
      warnings.push({
        level: "warning",
        text: {
          en: "Explicit sudo is selected for the system manager. It may request authentication in your terminal and affects system resources. This application never asks for, stores, or validates credentials.",
          id: "Sudo eksplisit dipilih untuk pengelola sistem. Perintah mungkin meminta autentikasi di terminal dan memengaruhi sumber daya sistem. Aplikasi ini tidak pernah meminta, menyimpan, atau memvalidasi kredensial.",
        },
      });
  }
  if (definition.id === "curl") {
    if (containsSensitiveCurlContent(inputs)) warnings.push({
      level: "warning",
      text: {
        en: "Request headers, body, or URL query may contain secrets. Copying exposes them in shell history and process lists; pinning requires explicit consent because localStorage stores plain text.",
        id: "Header, isi permintaan, atau kueri URL mungkin mengandung rahasia. Penyalinan mengeksposnya di riwayat shell dan daftar proses; penyematan memerlukan persetujuan eksplisit karena localStorage menyimpan teks biasa.",
      },
    });
    if (inputs.output) warnings.push({
      level: "warning",
      text: {
        en: "The selected output file can be overwritten when the copied curl command is run. No file is touched here.",
        id: "Berkas keluaran terpilih dapat ditimpa saat perintah curl salinan dijalankan. Tidak ada berkas yang disentuh di sini.",
      },
    });
  }
  if (definition.id === "ssh-keygen" && typeof inputs.output === "string" &&
    /^~\/\.ssh\/id_(ed25519|rsa)$/.test(inputs.output))
    warnings.push({
      level: "warning",
      text: {
        en: "This is a common SSH private-key filename. Check whether it already exists before running ssh-keygen; an existing key may be overwritten after a prompt.",
        id: "Ini nama berkas kunci privat SSH yang umum. Periksa apakah berkas sudah ada sebelum menjalankan ssh-keygen; kunci yang ada dapat tertimpa setelah prompt.",
      },
    });
  if (definition.id === "apt") {
    if (inputs.action === "full-upgrade") warnings.push({
      level: "warning",
      text: {
        en: "Full-upgrade may install or remove packages to resolve dependencies. Review APT's proposed changes before accepting.",
        id: "Full-upgrade dapat memasang atau menghapus paket untuk menyelesaikan ketergantungan. Tinjau perubahan usulan APT sebelum menerima.",
      },
    });
    if (inputs.action === "purge") warnings.push({
      level: "warning",
      text: {
        en: "Purge also removes package-managed configuration. It does not necessarily remove user data in home directories.",
        id: "Purge juga menghapus konfigurasi yang dikelola paket. Ini belum tentu menghapus data pengguna di direktori home.",
      },
    });
    if (inputs.action === "autoremove") warnings.push({
      level: "warning",
      text: {
        en: "Autoremove can remove automatically installed packages you still use. Check the proposed list carefully.",
        id: "Autoremove dapat menghapus paket otomatis yang masih Anda gunakan. Periksa daftar usulan dengan cermat.",
      },
    });
    if (inputs.assumeYes === true && ["upgrade", "full-upgrade", "install", "remove", "purge", "autoremove"].includes(inputs.action as string)) warnings.push({
      level: "warning",
      text: {
        en: "-y accepts supported confirmation prompts automatically. Review the exact package changes before using it.",
        id: "-y menerima prompt konfirmasi yang didukung secara otomatis. Tinjau perubahan paket yang tepat sebelum memakainya.",
      },
    });
  }
  if (definition.id === "dpkg" && ["install", "remove", "purge"].includes(inputs.operation as string)) warnings.push({
    level: "warning",
    text: inputs.operation === "install" ? {
      en: "Installing a local .deb can run package scripts and leave missing dependencies unresolved. Check the archive source and proposed changes.",
      id: "Memasang .deb lokal dapat menjalankan skrip paket dan membiarkan ketergantungan belum terselesaikan. Periksa sumber arsip dan perubahan yang diusulkan.",
    } : inputs.operation === "purge" ? {
      en: "Purging removes package-managed configuration as well as the package. Review the target before running.",
      id: "Purge menghapus konfigurasi yang dikelola paket bersama paketnya. Tinjau tujuan sebelum menjalankan.",
    } : {
      en: "Removing a package can disrupt applications that depend on it. Review the target before running.",
      id: "Menghapus paket dapat mengganggu aplikasi yang bergantung padanya. Tinjau tujuan sebelum menjalankan.",
    },
  });
  if (
    (definition.id === "cp" || definition.id === "mv") &&
    Array.isArray(inputs.sources) &&
    inputs.sources.length > 1
  )
    warnings.push({
      level: "note",
      text: {
        en: "Multiple sources require an existing destination directory. This app cannot verify the destination type or existence.",
        id: "Beberapa sumber memerlukan direktori tujuan yang sudah ada. Aplikasi ini tidak dapat memverifikasi jenis atau keberadaan tujuan.",
      },
    });
  if (definition.id === "mv" && inputs.overwrite === "force")
    warnings.push({
      level: "warning",
      text: {
        en: "Force overwrite (-f) suppresses prompts and may replace destination data.",
        id: "Paksa penimpaan (-f) meniadakan pertanyaan dan dapat mengganti data tujuan.",
      },
    });
  if (definition.id === "rm" && inputs.recursive === true)
    warnings.push({
      level: inputs.confirmation === "force" ? "danger" : "warning",
      text:
        inputs.confirmation === "force"
          ? {
              en: "HIGH RISK: recursive + force removal deletes entire target trees without prompting. This is destructive, not a safety mode. Static validation cannot guarantee safety.",
              id: "RISIKO TINGGI: penghapusan rekursif + paksa menghapus seluruh pohon tujuan tanpa bertanya. Ini destruktif, bukan mode keamanan. Validasi statis tidak menjamin keamanan.",
            }
          : {
              en: "Recursive removal deletes the target directory and its descendants when run. Review every target; prompts depend on the selected confirmation mode.",
              id: "Penghapusan rekursif menghapus direktori tujuan dan turunannya saat dijalankan. Periksa setiap tujuan; pertanyaan bergantung pada mode konfirmasi yang dipilih.",
            },
    });
  if (
    definition.id === "rm" &&
    inputs.recursive !== true &&
    inputs.confirmation === "force"
  )
    warnings.push({
      level: "warning",
      text: {
        en: "Force removal never prompts. Ignoring nonexistent files does not make removal safe.",
        id: "Paksa penghapusan tidak pernah bertanya. Mengabaikan file yang tidak ada tidak membuat penghapusan aman.",
      },
    });
  if (
    ["chmod", "chown", "chgrp"].includes(definition.id) &&
    inputs.recursive === true
  )
    warnings.push({
      level: "warning",
      text: {
        en: "Recursive changes affect entire directory trees, including unexpected descendants. Changing system directories can break access or services. Static checks do not establish safety.",
        id: "Perubahan rekursif memengaruhi seluruh pohon direktori, termasuk turunan yang tidak terduga. Mengubah direktori sistem dapat merusak akses atau layanan. Pemeriksaan statis tidak membuktikan keamanan.",
      },
    });
  if (definition.id === "chgrp" && inputs.sudo === true)
    warnings.push({
      level: "warning",
      text: {
        en: "Explicit sudo is selected. Changing group ownership may require authorization, but sudo is not always necessary. Review the target group and paths; credentials are never requested or stored by this app.",
        id: "Sudo eksplisit dipilih. Mengubah kepemilikan grup mungkin memerlukan otorisasi, tetapi sudo tidak selalu diperlukan. Tinjau grup dan jalur tujuan; aplikasi ini tidak pernah meminta atau menyimpan kredensial.",
      },
    });
  if (definition.id === "chmod") {
    const mode = permissionMode(inputs);
    if (grantsWorldWrite(mode, inputs.permissionMode === "symbolic"))
      warnings.push({
        level: "warning",
        text: {
          en: "World-writable permissions are being requested: others may change file data or directory entries. Review whether this access is necessary; quoting does not reduce this risk.",
          id: "Izin tulis untuk semua orang sedang diminta: pengguna lain dapat mengubah data file atau entri direktori. Periksa apakah akses ini diperlukan; kutip tidak mengurangi risiko ini.",
        },
      });
    if (
      mode === "777" ||
      (inputs.permissionMode === "symbolic" &&
        (inputs.clauses as string[]).some((value) => /^a[+=]rwx$/.test(value)))
    )
      warnings.push({
        level: "danger",
        text: {
          en: "HIGH RISK: all classes receive read, write, and execute/search access. 777 or a+rwx/a=rwx is unusually permissive and is not a general solution to permission errors.",
          id: "RISIKO TINGGI: semua kelas menerima akses baca, tulis, dan eksekusi/penelusuran. 777 atau a+rwx/a=rwx sangat permisif dan bukan solusi umum untuk kesalahan izin.",
        },
      });
  }
  if (["kill", "pkill"].includes(definition.id) && inputs.signal === "KILL")
    warnings.push({
      level: "danger",
      text: {
        en: "HIGH RISK: SIGKILL prevents application cleanup and can discard unsaved work or corrupt application state. Prefer a graceful request when appropriate. Delivery does not guarantee immediate exit or correct targeting.",
        id: "RISIKO TINGGI: SIGKILL mencegah pembersihan aplikasi dan dapat membuang pekerjaan yang belum disimpan atau merusak keadaan aplikasi. Utamakan permintaan tertib jika sesuai. Pengiriman tidak menjamin proses langsung berakhir atau tujuan yang benar.",
      },
    });
  if (["kill", "pkill"].includes(definition.id) && inputs.signal === "STOP")
    warnings.push({
      level: "warning",
      text: {
        en: "SIGSTOP pauses execution rather than terminating. A stopped service can stop responding while still holding resources; SIGCONT requests continuation.",
        id: "SIGSTOP menjeda eksekusi, bukan mengakhiri proses. Layanan yang dijeda dapat berhenti merespons sambil tetap memegang sumber daya; SIGCONT meminta kelanjutan.",
      },
    });
  if (definition.id === "pkill" && inputs.full === true)
    warnings.push({
      level: "warning",
      text: {
        en: "Full-command-line matching (-f) can match wrappers, arguments, and unrelated processes. Multiple targets may be affected; -x still uses a regex and does not establish safety.",
        id: "Pencocokan seluruh baris perintah (-f) dapat cocok dengan pembungkus, argumen, dan proses lain. Beberapa tujuan dapat terpengaruh; -x tetap memakai regex dan tidak membuktikan keamanan.",
      },
    });
  if (definition.id === "top" && inputs.batch === true && inputs.updates === "")
    warnings.push({
      level: "note",
      text: {
        en: "Batch mode has no interactive keys. Without an update limit (-n), it continues until stopped externally when run in a terminal.",
        id: "Mode batch tidak memiliki tombol interaktif. Tanpa batas pembaruan (-n), perintah berjalan hingga dihentikan dari luar saat dijalankan di terminal.",
      },
    });
  if (isShellBuilder(definition.id) && isShellComposition(inputs.composition)) {
    if (
      inputs.composition.redirections.some(
        (item) => item.operator === ">" || item.operator === "2>",
      )
    )
      warnings.push({
        level: "warning",
        text: {
          en: "Overwrite redirection selected: > or 2> may truncate an existing target file when manually run, even if the command later fails. Review the path; this application never opens or modifies it.",
          id: "Redirection penimpaan dipilih: > atau 2> dapat mengosongkan berkas tujuan yang sudah ada saat dijalankan manual, meskipun perintah kemudian gagal. Tinjau jalurnya; aplikasi ini tidak pernah membuka atau mengubahnya.",
        },
      });
  }
  return warnings;
}
