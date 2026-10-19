import { quoteShellArgument } from "./arguments";
import { isUsername } from "./helpIdentity";
import type {
  BilingualText,
  CommandChoice,
  CommandInputs,
  CommandOption,
} from "./types";

export const signals = [
  {
    name: "TERM",
    number: 15,
    description: {
      en: "Request graceful termination",
      id: "Minta penghentian secara tertib",
    },
  },
  {
    name: "KILL",
    number: 9,
    description: {
      en: "Force termination without cleanup",
      id: "Paksa penghentian tanpa pembersihan",
    },
  },
  {
    name: "INT",
    number: 2,
    description: { en: "Interrupt the process", id: "Interupsi proses" },
  },
  {
    name: "HUP",
    number: 1,
    description: {
      en: "Hangup; some programs reload",
      id: "Hangup; sebagian program memuat ulang",
    },
  },
  {
    name: "STOP",
    number: 19,
    description: {
      en: "Stop execution without terminating",
      id: "Hentikan sementara eksekusi tanpa mengakhiri",
    },
  },
  {
    name: "CONT",
    number: 18,
    description: {
      en: "Continue a stopped process",
      id: "Lanjutkan proses yang dihentikan sementara",
    },
  },
] satisfies { name: string; number: number; description: BilingualText }[];

export const signalChoice: CommandChoice = {
  id: "signal",
  label: { en: "Signal", id: "Sinyal" },
  description: {
    en: "SIGTERM is the default. Names are emitted; numbers shown here assume common Linux architectures and may differ elsewhere. Sending a signal does not guarantee termination.",
    id: "SIGTERM adalah bawaan. Nama digunakan dalam perintah; angka yang ditampilkan mengasumsikan arsitektur Linux umum dan dapat berbeda di tempat lain. Mengirim sinyal tidak menjamin proses berakhir.",
  },
  defaultValue: "TERM",
  items: signals.map((signal) => ({
    value: signal.name,
    label: {
      en: `SIG${signal.name} (${signal.number}) — ${signal.description.en}`,
      id: `SIG${signal.name} (${signal.number}) — ${signal.description.id}`,
    },
  })),
};
export const signalOptions: CommandOption[] = signals.map((signal) => ({
  id: `signal${signal.name}`,
  flag: `-${signal.name}`,
  choice: { field: "signal", value: signal.name },
  label: { en: `SIG${signal.name}`, id: `SIG${signal.name}` },
  description: signal.description,
}));

export const psPresets: Record<string, string | undefined> = {
  terminal: "ps",
  all: "ps -e",
  full: "ps -ef",
  bsd: "ps aux",
  tree: "ps -ejH",
};
export const psColumns = [
  "pid",
  "ppid",
  "user",
  "stat",
  "cmd",
  "comm",
  "pcpu",
  "pmem",
  "etime",
  "tty",
];
const maxProcessInteger = 2147483647;
export function isPositiveProcessInteger(value: string): boolean {
  return (
    /^\d+$/.test(value) &&
    Number(value) > 0 &&
    Number(value) <= maxProcessInteger
  );
}
export function optionalPids(values: string[]): string[] {
  return values.length === 1 && values[0] === "" ? [] : values;
}
function pidList(values: string[]): string {
  return optionalPids(values)
    .map((value) => String(Number(value)))
    .join(",");
}

export function buildPs(inputs: CommandInputs): string {
  if (inputs.mode !== "advanced") return psPresets[inputs.mode as string]!;
  const tokens = ["ps"];
  const pids = pidList(inputs.pids as string[]);
  if (pids) tokens.push("-p", pids);
  if (inputs.username)
    tokens.push("-u", quoteShellArgument(inputs.username as string));
  if (inputs.columns)
    tokens.push("-o", quoteShellArgument(inputs.columns as string));
  return tokens.join(" ");
}
export function buildTop(inputs: CommandInputs, flags: string[]): string {
  const tokens = ["top", ...flags];
  if (inputs.delay) tokens.push("-d", String(Number(inputs.delay)));
  const pids = pidList(inputs.pids as string[]);
  if (pids) tokens.push("-p", pids);
  if (inputs.username)
    tokens.push("-u", quoteShellArgument(inputs.username as string));
  if (inputs.updates) tokens.push("-n", String(Number(inputs.updates)));
  return tokens.join(" ");
}

export function validateProcessInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  if (commandId === "pgrep") return validatePgrepInputs(inputs);
  if (!["ps", "top", "kill", "pkill", "jobs"].includes(commandId)) return [];
  if (commandId === "ps" && inputs.mode !== "advanced") return [];
  const errors: BilingualText[] = [];
  const pids =
    commandId === "pkill" || commandId === "jobs"
      ? []
      : optionalPids(inputs.pids as string[]);
  if (pids.some((pid) => !isPositiveProcessInteger(pid)))
    errors.push({
      en: "Enter one positive integer PID per row (1–2147483647). Zero, negative/group targets, whitespace, and empty added rows are not supported. Processes are not verified.",
      id: "Masukkan satu PID bilangan bulat positif per baris (1–2147483647). Nol, tujuan negatif/grup, spasi, dan baris tambahan kosong tidak didukung. Proses tidak diverifikasi.",
    });
  if (commandId === "top" && pids.length > 20)
    errors.push({
      en: "procps-ng top supports at most 20 PID entries in this builder.",
      id: "Builder ini mendukung paling banyak 20 entri PID untuk top procps-ng.",
    });
  if (
    (commandId === "ps" || commandId === "top") &&
    pids.length &&
    inputs.username
  )
    errors.push({
      en:
        commandId === "top"
          ? "top PID and user filters are mutually exclusive. Choose one."
          : "Choose PID selection or user selection. ps normally combines these selectors with OR; this beginner builder keeps them separate.",
      id:
        commandId === "top"
          ? "Filter PID dan pengguna top saling eksklusif. Pilih satu."
          : "Pilih seleksi PID atau pengguna. ps biasanya menggabungkan selektor ini dengan OR; builder pemula ini memisahkannya.",
    });
  if (
    ["ps", "top", "pkill"].includes(commandId) &&
    inputs.username !== "" &&
    !isUsername(inputs.username as string)
  )
    errors.push({
      en: "Use a common account name starting with a letter or _. Numeric IDs, user lists, and special filter expressions are outside this builder.",
      id: "Gunakan nama akun umum yang diawali huruf atau _. ID angka, daftar pengguna, dan ekspresi filter khusus berada di luar builder ini.",
    });
  if (commandId === "ps" && inputs.columns !== "") {
    const columns = (inputs.columns as string).split(",");
    if (
      columns.some((column) => !psColumns.includes(column)) ||
      new Set(columns).size !== columns.length
    )
      errors.push({
        en: `Use unique comma-separated columns from: ${psColumns.join(", ")}. No spaces, headers, or expressions.`,
        id: `Gunakan kolom unik yang dipisahkan koma dari: ${psColumns.join(", ")}. Tanpa spasi, judul, atau ekspresi.`,
      });
  }
  if (commandId === "top") {
    const delay = inputs.delay as string;
    if (
      delay !== "" &&
      (!/^\d+(?:\.\d)?$/.test(delay) ||
        Number(delay) <= 0 ||
        Number(delay) > maxProcessInteger)
    )
      errors.push({
        en: "Refresh interval must be positive seconds with at most one decimal digit (for example 2 or 0.5), up to 2147483647.",
        id: "Interval penyegaran harus berupa detik positif dengan paling banyak satu digit desimal (misalnya 2 atau 0.5), hingga 2147483647.",
      });
    if (
      inputs.updates !== "" &&
      !isPositiveProcessInteger(inputs.updates as string)
    )
      errors.push({
        en: "Update count must be a positive integer (1–2147483647). It can limit interactive or batch mode.",
        id: "Jumlah pembaruan harus bilangan bulat positif (1–2147483647). Ini dapat membatasi mode interaktif atau batch.",
      });
  }
  if (
    commandId === "jobs" &&
    inputs.jobspec !== "" &&
    (!/^%\d+$/.test(inputs.jobspec as string) ||
      !isPositiveProcessInteger((inputs.jobspec as string).slice(1)))
  )
    errors.push({
      en: "Use a numeric Bash job specification such as %1. Job zero, PIDs, names, and current/previous job shortcuts are outside this builder.",
      id: "Gunakan spesifikasi job Bash numerik seperti %1. Job nol, PID, nama, dan pintasan job saat ini/sebelumnya berada di luar builder ini.",
    });
  return errors;
}

export function buildPgrep(inputs: CommandInputs, flags: string[]): string {
  const tokens = ["pgrep", ...flags];
  if (inputs.username)
    tokens.push("-u", quoteShellArgument(inputs.username as string));
  if (inputs.realUsername)
    tokens.push("-U", quoteShellArgument(inputs.realUsername as string));
  if (inputs.parentPid) tokens.push("-P", String(Number(inputs.parentPid)));
  if (inputs.pattern !== "")
    tokens.push("--", quoteShellArgument(inputs.pattern as string));
  return tokens.join(" ");
}

function validatePgrepInputs(inputs: CommandInputs): BilingualText[] {
  const errors: BilingualText[] = [];
  for (const name of [inputs.username, inputs.realUsername]) {
    if (name !== "" && !isUsername(name as string))
      errors.push({
        en: "Use one common account name per user filter, starting with a letter or _. Numeric IDs, lists, and shell expressions are not supported.",
        id: "Gunakan satu nama akun umum per filter pengguna, diawali huruf atau _. ID angka, daftar, dan ekspresi shell tidak didukung.",
      });
  }
  if (
    inputs.parentPid !== "" &&
    !isPositiveProcessInteger(inputs.parentPid as string)
  )
    errors.push({
      en: "Parent PID must be a positive decimal integer (1–2147483647). Zero, negatives, lists, and expressions are not supported.",
      id: "PID induk harus bilangan bulat desimal positif (1–2147483647). Nol, negatif, daftar, dan ekspresi tidak didukung.",
    });
  if (inputs.pattern !== "" && !(inputs.pattern as string).trim())
    errors.push({
      en: "The pattern must not contain only whitespace. Leave it completely empty only when selecting by user or parent PID.",
      id: "Pola tidak boleh hanya berisi spasi. Kosongkan sepenuhnya hanya jika memilih menurut pengguna atau PID induk.",
    });
  if (
    inputs.pattern === "" &&
    !inputs.username &&
    !inputs.realUsername &&
    !inputs.parentPid
  )
    errors.push({
      en: "Enter a process pattern or supply an effective user, real user, or parent PID. Output, matching flags, and newest/oldest alone do not supply criteria in this builder.",
      id: "Masukkan pola proses atau isi pengguna efektif, pengguna nyata, atau PID induk. Keluaran, flag pencocokan, dan terbaru/terlama saja tidak menyediakan kriteria dalam builder ini.",
    });
  return errors;
}
