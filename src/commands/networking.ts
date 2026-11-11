import type { BilingualText, CommandInputs } from "./types";
import { quotePathArgument, quoteShellArgument } from "./arguments";

const issue = (en: string, id: string): BilingualText => ({ en, id });
const positiveInteger = (value: string) => /^[1-9]\d*$/.test(value) && Number(value) <= 2147483647;
const positiveDecimal = (value: string) => /^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)) && Number(value) > 0;
const interfaceName = (value: string) => /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,14}$/.test(value);

export function validHost(value: string): boolean {
  if (!value || /[\s`$(){}|&;<>"']/.test(value)) return false;
  if (value.includes(":")) {
    try { new URL(`http://[${value}]/`); return true; } catch { return false; }
  }
  if (/^\d+(?:\.\d+){3}$/.test(value))
    return value.split(".").every((part) => Number(part) <= 255);
  return value.length <= 253 && value.replace(/\.$/, "").split(".").every(
    (label) => label.length > 0 && label.length <= 63 && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label),
  );
}

export function splitHttpHeader(value: string): [string, string] {
  if (value.startsWith("[")) {
    try {
      const pair: unknown = JSON.parse(value);
      if (Array.isArray(pair) && pair.length === 2 && pair.every((part) => typeof part === "string"))
        return [pair[0], pair[1]];
    } catch { /* Invalid encoded rows are rejected by validation below. */ }
  }
  const colon = value.indexOf(":");
  return colon < 0 ? [value, ""] : [value.slice(0, colon), value.slice(colon + 1).replace(/^ /, "")];
}

export function encodeHttpHeader(name: string, value: string): string {
  return name || value ? JSON.stringify([name, value]) : "";
}

export function containsSensitiveCurlContent(inputs: CommandInputs): boolean {
  if (inputs.body && ["POST", "PUT", "PATCH"].includes(inputs.method as string)) return true;
  // Any custom header or URL query could carry a token; never pin these by default.
  return (Array.isArray(inputs.headers) && inputs.headers.some(Boolean)) ||
    (typeof inputs.url === "string" && inputs.url.includes("?"));
}

export function requiresSensitivePinConsent(inputs: CommandInputs, command: string | null, pinnedTexts: string[], approvedText: string | null): boolean {
  return command !== null && containsSensitiveCurlContent(inputs) && !pinnedTexts.includes(command) && command !== approvedText;
}

export function validateNetworkingInputs(id: string, inputs: CommandInputs): BilingualText[] {
  const errors: BilingualText[] = [];
  if (id === "ip") {
    if (inputs.operation !== "route" && inputs.interfaceEnabled && !interfaceName(inputs.interface as string))
      errors.push(issue("Enter one valid interface name (up to 15 characters).", "Isi satu nama antarmuka yang valid (maksimal 15 karakter)."));
  }
  if (id === "ping") {
    if (!validHost(inputs.target as string))
      errors.push(issue("Enter a hostname, IPv4 address, or IPv6 address without shell expressions.", "Isi nama host, alamat IPv4, atau alamat IPv6 tanpa ekspresi shell."));
    if (inputs.count && !positiveInteger(inputs.count as string))
      errors.push(issue("Packet count must be a positive integer.", "Jumlah paket harus bilangan bulat positif."));
    if (inputs.deadline && !positiveInteger(inputs.deadline as string))
      errors.push(issue("Overall deadline must be a positive whole number of seconds.", "Batas keseluruhan harus berupa bilangan bulat detik positif."));
    for (const field of ["interval", "replyTimeout"]) {
      const value = inputs[field] as string;
      if (value && !positiveDecimal(value))
        errors.push(issue(`${field} must be a positive number of seconds.`, `${field} harus berupa angka detik positif.`));
    }
    // Keep the beginner builder unprivileged on common Linux systems.
    if (inputs.interval && Number(inputs.interval) < 0.2)
      errors.push(issue("Use an interval of at least 0.2 seconds; shorter intervals can require privileges.", "Gunakan interval minimal 0,2 detik; interval lebih singkat dapat memerlukan hak istimewa."));
  }
  if (id === "curl") {
    const raw = inputs.url as string;
    try {
      if (!/^https?:\/\//i.test(raw) || /[`]|\$\(/.test(raw) || /\s/.test(raw)) throw new Error("Invalid URL");
      const parsed = new URL(raw);
      if (!(["http:", "https:"].includes(parsed.protocol) && parsed.hostname && !parsed.username && !parsed.password)) throw new Error("Invalid URL");
    } catch {
      errors.push(issue("Enter a complete HTTP or HTTPS URL without embedded credentials or shell expressions.", "Isi URL HTTP atau HTTPS lengkap tanpa kredensial tertanam atau ekspresi shell."));
    }
    if (inputs.maxTime && !positiveDecimal(inputs.maxTime as string))
      errors.push(issue("Timeout must be a positive number of seconds.", "Batas waktu harus berupa angka detik positif."));
    const headers = inputs.headers as string[];
    if (headers.length > 20) errors.push(issue("Use at most 20 headers.", "Gunakan maksimal 20 header."));
    for (const header of headers) {
      if (!header && headers.length === 1) continue;
      const [name, value] = splitHttpHeader(header);
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) || (!header.startsWith("[") && !header.includes(":")) || /[\r\n]/.test(value))
        errors.push(issue("Each header needs a valid HTTP token name and a value without newlines.", "Setiap header memerlukan nama token HTTP yang valid dan nilai tanpa baris baru."));
    }
    if (inputs.output && !(inputs.output as string).trim())
      errors.push(issue("Enter a valid output file path.", "Isi jalur berkas keluaran yang valid."));
  }
  return errors;
}

export function buildIp(inputs: CommandInputs): string {
  const parts = ["ip"];
  if (inputs.family !== "default") parts.push(`-${inputs.family}`);
  if (inputs.brief === true && inputs.operation !== "route") parts.push("-br");
  parts.push(inputs.operation === "address" ? "addr" : inputs.operation as string, "show");
  if (inputs.interfaceEnabled === true && inputs.operation !== "route") parts.push("dev", quoteShellArgument(inputs.interface as string));
  return parts.join(" ");
}

export function buildPing(inputs: CommandInputs): string {
  const parts = ["ping"];
  if (inputs.family !== "default") parts.push(`-${inputs.family}`);
  for (const [field, flag] of [["count", "-c"], ["interval", "-i"], ["replyTimeout", "-W"], ["deadline", "-w"]]) {
    if (inputs[field]) parts.push(flag, inputs[field] as string);
  }
  if (inputs.quiet === true) parts.push("-q");
  parts.push("--", quoteShellArgument(inputs.target as string));
  return parts.join(" ");
}

export function buildSs(inputs: CommandInputs): string {
  if (inputs.summary === true) return "ss -s";
  const flags = [inputs.protocol === "both" ? "tu" : inputs.protocol === "tcp" ? "t" : inputs.protocol === "udp" ? "u" : "", inputs.state === "listening" ? "l" : inputs.state === "all" ? "a" : "", inputs.processes ? "p" : "", inputs.numeric ? "n" : ""].join("");
  return ["ss", ...(inputs.family !== "default" ? [`-${inputs.family}`] : []), ...(flags ? [`-${flags}`] : [])].join(" ");
}

export function buildHostname(inputs: CommandInputs): string {
  const flags: Record<string, string> = { current: "", short: "-s", fqdn: "-f", domain: "-d", resolved: "-i", local: "-I" };
  return ["hostname", flags[inputs.mode as string]].filter(Boolean).join(" ");
}

export function buildCurl(inputs: CommandInputs): string {
  const parts = ["curl"];
  if (inputs.method === "HEAD") parts.push("-I");
  else if (inputs.method !== "GET") parts.push("-X", inputs.method as string);
  if (inputs.follow === true) parts.push("-L");
  if (inputs.includeHeaders === true && inputs.method !== "HEAD") parts.push("-i");
  if (inputs.silent === true) parts.push("-s");
  if (inputs.showErrors === true && inputs.silent === true) parts.push("-S");
  if (inputs.maxTime) parts.push("--max-time", inputs.maxTime as string);
  for (const header of (inputs.headers as string[]).filter(Boolean)) {
    const [name, value] = splitHttpHeader(header);
    parts.push("-H", quoteShellArgument(`${name}: ${value}`));
  }
  if (inputs.body && ["POST", "PUT", "PATCH"].includes(inputs.method as string))
    parts.push((inputs.body as string).startsWith("@") ? "--data-raw" : "--data", quoteShellArgument(inputs.body as string));
  if (inputs.output) parts.push("-o", quotePathArgument(inputs.output as string));
  if (/[\[\]{}]/.test(inputs.url as string)) parts.push("--globoff");
  parts.push("--", quoteShellArgument(inputs.url as string));
  return parts.join(" ");
}
