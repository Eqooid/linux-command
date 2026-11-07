import { quoteShellArgument } from "./arguments";
import { isUsername } from "./helpIdentity";
import { isPositiveProcessInteger } from "./processes";
import type { BilingualText, CommandInputs } from "./types";

export const htopSortKeys = ["PID", "PERCENT_CPU", "PERCENT_MEM"];

export function htopPids(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function validateHtopInputs(inputs: CommandInputs): BilingualText[] {
  const errors: BilingualText[] = [];
  if (inputs.username !== "" && !isUsername(inputs.username as string))
    errors.push({
      en: "Use a common username starting with a letter or _. Numeric UIDs, domain-qualified names and shell expressions are outside this builder.",
      id: "Gunakan nama pengguna umum yang diawali huruf atau _. UID numerik, nama dengan domain, dan ekspresi shell di luar cakupan builder ini.",
    });
  const pids = htopPids(inputs.pids as string);
  if (
    ((inputs.pids as string).trim() !== "" && !pids.length) ||
    pids.some((pid) => !isPositiveProcessInteger(pid))
  )
    errors.push({
      en: "Enter comma-separated positive PIDs from 1 to 2147483647, or clear the field. Empty entries around valid PIDs are removed; zero, negative values and other characters are rejected.",
      id: "Masukkan PID positif dari 1 hingga 2147483647 yang dipisah koma, atau kosongkan kolom. Entri kosong di sekitar PID valid dihapus; nol, nilai negatif, dan karakter lain ditolak.",
    });
  if (
    inputs.delay !== "" &&
    (!/^\d+$/.test(inputs.delay as string) ||
      Number(inputs.delay) < 1 ||
      Number(inputs.delay) > 100)
  )
    errors.push({
      en: "Delay must be an integer from 1 to 100 in tenths of a second: 10 is about 1 second, 20 about 2 seconds. This builder avoids values that htop would clamp.",
      id: "Jeda harus bilangan bulat dari 1 hingga 100 dalam sepersepuluh detik: 10 sekitar 1 detik, 20 sekitar 2 detik. Builder ini menghindari nilai yang akan dibatasi htop.",
    });
  return errors;
}

export function buildHtop(inputs: CommandInputs, flags: string[]): string {
  const tokens = ["htop"];
  if (inputs.username)
    tokens.push("-u", quoteShellArgument(inputs.username as string));
  const pids = htopPids(inputs.pids as string);
  if (pids.length)
    tokens.push("-p", pids.map((pid) => String(Number(pid))).join(","));
  if (inputs.delay) tokens.push("-d", String(Number(inputs.delay)));
  if (inputs.sort !== "default") tokens.push("-s", inputs.sort as string);
  return [...tokens, ...flags].join(" ");
}
