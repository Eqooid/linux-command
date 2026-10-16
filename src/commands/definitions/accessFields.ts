import type { CommandArgument, CommandChoice, CommandOption } from "../types";

export const reportingChoice: CommandChoice = {
  id: "reporting",
  label: { en: "Reporting mode", id: "Mode pelaporan" },
  description: {
    en: "Choose default output, every processed file, or only actual changes. -v and -c are alternatives.",
    id: "Pilih keluaran bawaan, setiap file yang diproses, atau hanya perubahan nyata. -v dan -c adalah alternatif.",
  },
  defaultValue: "default",
  items: [
    {
      value: "default",
      label: { en: "Default output", id: "Keluaran bawaan" },
    },
    {
      value: "verbose",
      label: {
        en: "Every processed file (-v)",
        id: "Setiap file yang diproses (-v)",
      },
    },
    {
      value: "changes",
      label: { en: "Changes only (-c)", id: "Hanya perubahan (-c)" },
    },
  ],
};
export const accessOptions: CommandOption[] = [
  {
    id: "recursive",
    flag: "-R",
    label: { en: "Apply recursively", id: "Terapkan secara rekursif" },
    description: {
      en: "Apply to target directories and their descendants. Review the full scope before running manually.",
      id: "Terapkan ke direktori tujuan dan turunannya. Periksa seluruh cakupan sebelum menjalankan secara manual.",
    },
  },
  {
    id: "verboseReport",
    flag: "-v",
    choice: { field: "reporting", value: "verbose" },
    label: { en: "Verbose report", id: "Laporan rinci" },
    description: {
      en: "Report every processed file.",
      id: "Laporkan setiap file yang diproses.",
    },
  },
  {
    id: "changesReport",
    flag: "-c",
    choice: { field: "reporting", value: "changes" },
    label: { en: "Changes report", id: "Laporan perubahan" },
    description: {
      en: "Report only actual changes.",
      id: "Laporkan hanya perubahan nyata.",
    },
  },
  {
    id: "silent",
    flag: "-f",
    label: {
      en: "Suppress most errors",
      id: "Sembunyikan sebagian besar kesalahan",
    },
    description: {
      en: "Reduce diagnostics; this does not make changes safer or guarantee success.",
      id: "Kurangi pesan diagnostik; ini tidak membuat perubahan lebih aman atau menjamin keberhasilan.",
    },
  },
];
export const accessPaths: CommandArgument = {
  id: "paths",
  required: true,
  multiple: true,
  placeholder: "project/",
  label: { en: "Target paths", id: "Jalur tujuan" },
  description: {
    en: "One literal file or directory path per row. Paths, permissions, ownership, and symlink targets are not inspected.",
    id: "Satu jalur file atau direktori literal per baris. Jalur, izin, kepemilikan, dan tujuan tautan simbolis tidak diperiksa.",
  },
};

export function privilegeCommandArguments(mode: string): CommandArgument[] {
  return [
    {
      id: "executable",
      required: true,
      placeholder: "whoami",
      when: { field: "mode", value: mode },
      label: { en: "Executable name or path", id: "Nama atau jalur program" },
      description: {
        en: "One simple executable token, e.g. apt or /usr/bin/id. Do not enter a whole command line; executable paths with spaces are outside this builder.",
        id: "Satu token program sederhana, misalnya apt atau /usr/bin/id. Jangan masukkan seluruh baris perintah; jalur program dengan spasi berada di luar builder ini.",
      },
    },
    {
      id: "arguments",
      required: false,
      multiple: true,
      placeholder: "update",
      when: { field: "mode", value: mode },
      label: {
        en: "Literal command arguments",
        id: "Argumen perintah literal",
      },
      addLabel: { en: "Add argument", id: "Tambah argumen" },
      removeLabel: { en: "Remove argument", id: "Hapus argumen" },
      description: {
        en: "One literal argument per row, without shell quotes. One empty default row means no arguments; in multiple rows, an empty row is an intentional empty argument. Arguments can affect the chosen program even though shell expansion is prevented.",
        id: "Satu argumen literal per baris, tanpa kutip shell. Satu baris bawaan kosong berarti tanpa argumen; pada beberapa baris, baris kosong berarti argumen kosong yang disengaja. Argumen dapat memengaruhi program terpilih meskipun ekspansi shell dicegah.",
      },
    },
  ];
}
