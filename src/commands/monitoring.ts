import type { BilingualText, CommandInputs } from "./types";
import { quotePathArgument, quoteShellArgument } from "./arguments";

export const lsblkColumns = ["NAME", "SIZE", "TYPE", "FSTYPE", "MOUNTPOINTS", "UUID", "LABEL", "MODEL"] as const;
const issue = (en: string, id: string): BilingualText => ({ en, id });
const unsignedInteger = (value: string) => /^\d+$/.test(value) && Number(value) <= 2147483647;
const positiveInteger = (value: string) => unsignedInteger(value) && Number(value) > 0;
const positiveDecimal = (value: string) => /^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)) && Number(value) > 0;

export function validateMonitoringInputs(id: string, inputs: CommandInputs): BilingualText[] {
  const errors: BilingualText[] = [];
  if (id === "free") {
    if (inputs.interval && !positiveDecimal(inputs.interval as string))
      errors.push(issue("Refresh interval must be a positive number of seconds.", "Interval pembaruan harus berupa angka detik positif."));
    if (inputs.count && (!positiveInteger(inputs.count as string) || !inputs.interval))
      errors.push(issue("Report count must be a positive integer and requires a refresh interval (-s).", "Jumlah laporan harus bilangan bulat positif dan memerlukan interval pembaruan (-s)."));
  }
  if (id === "df") {
    if (inputs.excludeType && !/^[A-Za-z0-9][A-Za-z0-9_.+-]*$/.test(inputs.excludeType as string))
      errors.push(issue("Enter one filesystem type such as tmpfs or ext4.", "Isi satu jenis sistem berkas seperti tmpfs atau ext4."));
    if (inputs.path && !(inputs.path as string).trim())
      errors.push(issue("The optional path must not contain only whitespace.", "Jalur opsional tidak boleh hanya memuat spasi."));
  }
  if (id === "du") {
    if (inputs.depth && !unsignedInteger(inputs.depth as string))
      errors.push(issue("Maximum depth must be a nonnegative integer.", "Kedalaman maksimum harus bilangan bulat nonnegatif."));
    if (inputs.summary && inputs.depth && Number(inputs.depth) !== 0)
      errors.push(issue("Summary mode is depth zero; remove the other depth value or disable summary.", "Mode ringkasan adalah kedalaman nol; hapus nilai kedalaman lain atau nonaktifkan ringkasan."));
  }
  if (id === "lsblk") {
    if (inputs.mode === "custom") {
      const columns = inputs.columns as string[];
      if (!columns.length || new Set(columns).size !== columns.length || columns.some((column) => !lsblkColumns.includes(column as typeof lsblkColumns[number])))
        errors.push(issue("Select one or more supported columns without duplicates.", "Pilih satu atau beberapa kolom yang didukung tanpa duplikasi."));
    }
    if (inputs.exclude && !/^\d+(?:,\d+)*$/.test(inputs.exclude as string))
      errors.push(issue("Use comma-separated nonnegative device major numbers, such as 7 or 1,7.", "Gunakan nomor mayor perangkat nonnegatif dipisahkan koma, seperti 7 atau 1,7."));
    else if (inputs.exclude && (inputs.exclude as string).split(",").some((number) => !unsignedInteger(number)))
      errors.push(issue("Device major numbers must be nonnegative integers up to 2147483647.", "Nomor mayor perangkat harus bilangan bulat nonnegatif hingga 2147483647."));
    if (inputs.device && (!/^\/dev\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(inputs.device as string) || (inputs.device as string).split("/").some((part) => part === "." || part === "..")))
      errors.push(issue("Enter a literal /dev/ device path, such as /dev/sda or /dev/nvme0n1.", "Isi jalur perangkat /dev/ literal, seperti /dev/sda atau /dev/nvme0n1."));
  }
  return errors;
}

export function buildFree(inputs: CommandInputs, flags: string[]): string {
  return ["free", ...flags,
    ...(inputs.interval ? ["-s", inputs.interval as string] : []),
    ...(inputs.count ? ["-c", inputs.count as string] : []),
  ].join(" ");
}

export function buildDf(inputs: CommandInputs, flags: string[]): string {
  return ["df", ...flags,
    ...(inputs.excludeType ? ["-x", quoteShellArgument(inputs.excludeType as string)] : []),
    ...(inputs.path ? ["--", quotePathArgument(inputs.path as string)] : []),
  ].join(" ");
}

export function buildDu(inputs: CommandInputs, flags: string[]): string {
  return ["du", ...flags,
    ...(inputs.depth && !inputs.summary ? [inputs.depthStyle === "short" ? "-d" : "--max-depth", String(Number(inputs.depth))] : []),
    "--", ...(inputs.paths as string[]).map(quotePathArgument),
  ].join(" ");
}

export function buildLsblk(inputs: CommandInputs, flags: string[]): string {
  return ["lsblk", ...flags,
    ...(inputs.mode === "custom" ? ["-o", lsblkColumns.filter((column) => (inputs.columns as string[]).includes(column)).join(",")] : []),
    ...(inputs.exclude ? ["-e", (inputs.exclude as string).split(",").map((value) => String(Number(value))).join(",")] : []),
    ...(inputs.device ? ["--", quotePathArgument(inputs.device as string)] : []),
  ].join(" ");
}
