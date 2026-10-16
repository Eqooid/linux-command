import type { BilingualText, CommandDefinition, CommandInputs } from "./types";
import { grantsWorldWrite, permissionMode } from "./permissions";

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
    level: ["rm", "sudo", "su", "chmod", "chown"].includes(definition.id)
      ? "warning"
      : "note",
  }));
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
  if (["chmod", "chown"].includes(definition.id) && inputs.recursive === true)
    warnings.push({
      level: "warning",
      text: {
        en: "Recursive changes affect entire directory trees, including unexpected descendants. Changing system directories can break access or services. Static checks do not establish safety.",
        id: "Perubahan rekursif memengaruhi seluruh pohon direktori, termasuk turunan yang tidak terduga. Mengubah direktori sistem dapat merusak akses atau layanan. Pemeriksaan statis tidak membuktikan keamanan.",
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
  return warnings;
}
