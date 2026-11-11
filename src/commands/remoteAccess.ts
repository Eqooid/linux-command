import type { BilingualText, CommandInputs } from "./types";
import { quoteShellArgument } from "./arguments";
import { isUsername } from "./helpIdentity";
import { validHost } from "./networking";

const issue = (en: string, id: string): BilingualText => ({ en, id });
const present = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const pathIsValid = (value: string) => value.trim().length > 0 && !/[\x00-\x1f\x7f]/.test(value);

// Only the explicit ~/ prefix is shell syntax. The rest remains a literal path.
export function localPath(value: string): string {
  if (value.startsWith("~/")) return "~/" + quoteShellArgument(value.slice(2));
  return quoteShellArgument(value);
}

export function scpLocalPath(value: string): string {
  // A relative path with : otherwise looks like an SCP remote specification.
  const safe = !value.startsWith("~/") && !value.startsWith("/") &&
    (value.startsWith("-") || value.includes(":")) && !value.startsWith("./")
    ? `./${value}` : value;
  return localPath(safe);
}

export function remoteDestination(inputs: CommandInputs, path?: string): string {
  const host = inputs.host as string;
  const bracketed = host.includes(":") ? `[${host}]` : host;
  const account = inputs.username ? `${inputs.username}@` : "";
  return quoteShellArgument(`${account}${bracketed}${path === undefined ? "" : `:${path}`}`);
}

export function validateRemoteAccessInputs(id: string, inputs: CommandInputs): BilingualText[] {
  if (!["ssh", "ssh-keygen", "ssh-copy-id", "scp", "sftp"].includes(id)) return [];
  const errors: BilingualText[] = [];
  if (id !== "ssh-keygen") {
    if (!validHost(inputs.host as string))
      errors.push(issue("Enter a valid hostname, IPv4 address or IPv6 literal without shell syntax.", "Isi nama host, alamat IPv4, atau IPv6 yang valid tanpa sintaks shell."));
    if (present(inputs.username) && !isUsername(inputs.username))
      errors.push(issue("Enter a common account name without shell syntax.", "Isi nama akun umum tanpa sintaks shell."));
    if (present(inputs.port) && (!/^[1-9]\d*$/.test(inputs.port) || Number(inputs.port) > 65535))
      errors.push(issue("SSH port must be from 1 to 65535.", "Port SSH harus dari 1 sampai 65535."));
  }
  if (id === "ssh" && present(inputs.timeout) && (!/^[1-9]\d*$/.test(inputs.timeout) || Number(inputs.timeout) > 2147483647))
    errors.push(issue("Connection timeout must be a positive whole number of seconds.", "Batas waktu koneksi harus berupa bilangan bulat detik positif."));
  if (id === "ssh-keygen") {
    if (inputs.algorithm === "rsa" && !["3072", "4096"].includes(inputs.rsaBits as string))
      errors.push(issue("Choose RSA 3072 or 4096 bits.", "Pilih RSA 3072 atau 4096 bit."));
    if (present(inputs.output) && !pathIsValid(inputs.output))
      errors.push(issue("Enter a non-empty output file path.", "Isi jalur berkas keluaran yang tidak kosong."));
    if (present(inputs.comment) && (!inputs.comment.trim() || inputs.comment.length > 256))
      errors.push(issue("Key comment must be non-empty and at most 256 characters.", "Komentar kunci harus tidak kosong dan maksimal 256 karakter."));
  }
  for (const field of ["identity", "publicKey", "localPath", "remotePath"]) {
    if (field in inputs && present(inputs[field]) && !pathIsValid(inputs[field]))
      errors.push(issue(`${field} must contain a non-empty literal path.`, `${field} harus memuat jalur literal yang tidak kosong.`));
  }
  if (id === "ssh-copy-id" && present(inputs.publicKey) && !inputs.publicKey.endsWith(".pub"))
    errors.push(issue("Select a public-key file ending in .pub; never select a private key.", "Pilih berkas kunci publik dengan akhiran .pub; jangan pilih kunci privat."));
  if (id === "scp") {
    const remote = inputs.remotePath as string;
    if (/[\x00-\x1f\x7f*?\[\]{}\\]/.test(remote) || remote.startsWith("-"))
      errors.push(issue("Use a literal remote path without globs, backslashes or a leading hyphen.", "Gunakan jalur jarak jauh literal tanpa glob, garis miring terbalik, atau tanda hubung awal."));
  }
  return errors;
}

export function buildRemoteAccess(id: string, inputs: CommandInputs): string {
  if (id === "ssh-keygen") {
    const parts = ["ssh-keygen", "-t", inputs.algorithm as string];
    if (inputs.algorithm === "rsa") parts.push("-b", inputs.rsaBits as string);
    if (inputs.output) parts.push("-f", localPath(inputs.output as string));
    if (inputs.comment) parts.push("-C", quoteShellArgument(inputs.comment as string));
    return parts.join(" ");
  }
  if (id === "ssh") {
    const parts = ["ssh"];
    if (inputs.port) parts.push("-p", inputs.port as string);
    if (inputs.identity) parts.push("-i", localPath(inputs.identity as string));
    if (inputs.verbose) parts.push("-v");
    if (inputs.timeout) parts.push("-o", `ConnectTimeout=${inputs.timeout}`);
    if (inputs.family !== "default") parts.push(`-${inputs.family}`);
    parts.push(remoteDestination(inputs));
    return parts.join(" ");
  }
  if (id === "ssh-copy-id") {
    const parts = ["ssh-copy-id"];
    if (inputs.publicKey) parts.push("-i", localPath(inputs.publicKey as string));
    if (inputs.port) parts.push("-p", inputs.port as string);
    parts.push(remoteDestination(inputs));
    return parts.join(" ");
  }
  if (id === "sftp") {
    const parts = ["sftp"];
    if (inputs.port) parts.push("-P", inputs.port as string);
    if (inputs.identity) parts.push("-i", localPath(inputs.identity as string));
    parts.push(remoteDestination(inputs));
    return parts.join(" ");
  }
  const mode = inputs.mode as string;
  const parts = ["scp"];
  if (inputs.port) parts.push("-P", inputs.port as string);
  if (inputs.identity) parts.push("-i", localPath(inputs.identity as string));
  if (mode.endsWith("directory")) parts.push("-r");
  if (inputs.preserve) parts.push("-p");
  if (inputs.verbose) parts.push("-v");
  const local = scpLocalPath(inputs.localPath as string);
  const remote = remoteDestination(inputs, inputs.remotePath as string);
  parts.push(...(mode.startsWith("upload") ? [local, remote] : [remote, local]));
  return parts.join(" ");
}
