import { isTouchTimestamp, quoteShellArgument } from "./arguments";
import { isPositiveProcessInteger } from "./processes";
import type { BilingualText, CommandInputs } from "./types";

export const unitActions = [
  "status",
  "start",
  "stop",
  "restart",
  "reload",
  "reload-or-restart",
  "enable",
  "disable",
  "is-active",
  "is-enabled",
];
export const changingActions = [
  "start",
  "stop",
  "restart",
  "reload",
  "reload-or-restart",
  "enable",
  "disable",
  "daemon-reload",
];
export const listingActions = ["list-units", "list-unit-files"];
export const unitTypes = ["service", "socket", "timer", "target", "mount"];
export const priorities = [
  "emerg",
  "alert",
  "crit",
  "err",
  "warning",
  "notice",
  "info",
  "debug",
];

export function isUnitName(value: string): boolean {
  // A literal, bounded identifier subset; no paths, globs, escapes or shell syntax.
  return (
    value.length <= 255 &&
    /^[A-Za-z0-9_:.-]+(?:@[A-Za-z0-9_:.-]*)?$/.test(value) &&
    ![".", ".."].includes(value)
  );
}

export function unitWithType(unit: string, type: string): string {
  return type === "auto" ? unit : `${unit}.${type}`;
}

export function buildSystemctl(inputs: CommandInputs): string {
  const action = inputs.action as string;
  const tokens = ["systemctl"];
  if (inputs.scope === "user") tokens.push("--user");
  if (listingActions.includes(action)) {
    if (inputs.unitType !== "auto") tokens.push(`--type=${inputs.unitType}`);
    if (action === "list-units" && inputs.all) tokens.push("--all");
  }
  if (["enable", "disable"].includes(action) && inputs.now)
    tokens.push("--now");
  tokens.push(action);
  if (unitActions.includes(action))
    tokens.push(
      "--",
      quoteShellArgument(
        unitWithType(inputs.unit as string, inputs.unitType as string),
      ),
    );
  if (
    inputs.scope === "system" &&
    changingActions.includes(action) &&
    inputs.sudo
  )
    tokens.unshift("sudo");
  return tokens.join(" ");
}

export function isStructuredJournalTime(value: string): boolean {
  // Reuse the existing calendar checks by adapting to touch's CCYYMMDDhhmm.ss format.
  return (
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) &&
    isTouchTimestamp(
      value.slice(0, 16).replaceAll(/[- :]/g, "") + "." + value.slice(17),
    )
  );
}

export function isRelativeJournalTime(value: string): boolean {
  return (
    ["today", "yesterday", "tomorrow", "now"].includes(value) ||
    /^(?:[1-9]\d{0,5}) (?:second|minute|hour|day|week)s? ago$/.test(value)
  );
}

function journalTime(
  inputs: CommandInputs,
  edge: "since" | "until",
): string | undefined {
  return inputs[`${edge}Mode`] === "none"
    ? undefined
    : (inputs[edge] as string);
}

export function buildJournalctl(inputs: CommandInputs): string {
  const tokens = ["journalctl"];
  if (inputs.scope !== "default") tokens.push(`--${inputs.scope}`);
  if (inputs.unit) tokens.push("-u", quoteShellArgument(inputs.unit as string));
  if (inputs.count) tokens.push("-n", String(Number(inputs.count)));
  if (inputs.follow) tokens.push("-f");
  if (inputs.boot === "all") tokens.push("--boot=all");
  if (inputs.boot === "current") tokens.push("-b");
  if (inputs.boot === "previous") tokens.push("-b", "-1");
  if (inputs.boot === "custom")
    tokens.push("--boot=" + String(Number(inputs.bootOffset)));
  if (inputs.priority !== "all") tokens.push("-p", inputs.priority as string);
  for (const edge of ["since", "until"] as const) {
    const value = journalTime(inputs, edge);
    if (value !== undefined)
      tokens.push(`--${edge}`, quoteShellArgument(value));
  }
  if (inputs.reverse) tokens.push("-r");
  if (inputs.output !== "short") tokens.push("-o", inputs.output as string);
  if (inputs.noPager) tokens.push("--no-pager");
  return tokens.join(" ");
}

export function validateSystemdInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  const errors: BilingualText[] = [];
  if (commandId !== "systemctl" && commandId !== "journalctl") return errors;
  const needsUnit =
    commandId === "systemctl" && unitActions.includes(inputs.action as string);
  if (
    (needsUnit || (commandId === "journalctl" && inputs.unit !== "")) &&
    !isUnitName(inputs.unit as string)
  )
    errors.push({
      en: "Use one literal unit identifier, optionally with @instance and a suffix. No spaces, paths, glob patterns, shell operators or substitutions are supported.",
      id: "Gunakan satu ID unit literal, boleh dengan @instance dan akhiran. Spasi, jalur, pola glob, operator shell, dan substitusi tidak didukung.",
    });
  if (commandId === "systemctl") {
    if (
      inputs.action === "status" &&
      inputs.unitType === "auto" &&
      /^\d+$/.test(inputs.unit as string)
    )
      errors.push({
        en: "systemctl status treats a bare number as a PID. Enter an explicit unit suffix, or choose a unit type for a numeric unit name.",
        id: "systemctl status menafsirkan angka tanpa akhiran sebagai PID. Masukkan akhiran unit eksplisit, atau pilih jenis unit untuk nama unit numerik.",
      });
    if (
      needsUnit &&
      unitWithType(inputs.unit as string, inputs.unitType as string).length >
        255
    )
      errors.push({
        en: "The complete unit name including its selected suffix must not exceed 255 characters.",
        id: "Nama unit lengkap termasuk akhiran terpilih tidak boleh melebihi 255 karakter.",
      });
    if (
      needsUnit &&
      inputs.unitType !== "auto" &&
      /\.(?:service|socket|timer|target|mount|automount|swap|path|slice|scope|device)$/.test(
        inputs.unit as string,
      )
    )
      errors.push({
        en: "A unit with an explicit suffix must use As entered / all types. The type selector only appends a suffix to an unsuffixed name, or filters listing actions.",
        id: "Unit dengan akhiran eksplisit harus memakai Sesuai masukan / semua jenis. Pemilih jenis hanya menambahkan akhiran ke nama tanpa akhiran, atau memfilter tindakan daftar.",
      });
    return errors;
  }
  if (inputs.count !== "" && !isPositiveProcessInteger(inputs.count as string))
    errors.push({
      en: "Entry count must be a positive integer from 1 to 2147483647.",
      id: "Jumlah entri harus berupa bilangan bulat positif dari 1 hingga 2147483647.",
    });
  if (inputs.follow && inputs.reverse)
    errors.push({
      en: "Follow and reverse ordering cannot be combined. Disable one of them.",
      id: "Ikuti log dan urutan terbalik tidak dapat digabung. Nonaktifkan salah satunya.",
    });
  if (
    inputs.boot === "custom" &&
    (!/^[+-]?\d+$/.test(inputs.bootOffset as string) ||
      !Number.isSafeInteger(Number(inputs.bootOffset)) ||
      Math.abs(Number(inputs.bootOffset)) > 2147483647)
  )
    errors.push({
      en: "Boot offset must be a signed decimal integer between -2147483647 and 2147483647.",
      id: "Offset boot harus berupa bilangan bulat desimal bertanda antara -2147483647 dan 2147483647.",
    });
  for (const edge of ["since", "until"] as const) {
    const value = journalTime(inputs, edge);
    if (value === undefined) continue;
    const valid =
      inputs[`${edge}Mode`] === "absolute"
        ? isStructuredJournalTime(value)
        : isRelativeJournalTime(value);
    if (!valid)
      errors.push({
        en: `${edge}: use a valid YYYY-MM-DD HH:mm:ss timestamp or the selected supported relative expression (today/yesterday/tomorrow/now or N seconds/minutes/hours/days/weeks ago).`,
        id: `${edge === "since" ? "Sejak" : "Hingga"}: gunakan waktu YYYY-MM-DD HH:mm:ss yang valid atau ekspresi relatif yang didukung (today/yesterday/tomorrow/now atau N seconds/minutes/hours/days/weeks ago).`,
      });
  }
  if (
    inputs.sinceMode === "absolute" &&
    inputs.untilMode === "absolute" &&
    isStructuredJournalTime(inputs.since as string) &&
    isStructuredJournalTime(inputs.until as string) &&
    (inputs.since as string) > (inputs.until as string)
  )
    errors.push({
      en: "Since must be earlier than or equal to Until. Both values use the target machine's local time zone.",
      id: "Sejak harus lebih awal dari atau sama dengan Hingga. Keduanya memakai zona waktu lokal mesin tujuan.",
    });
  return errors;
}
