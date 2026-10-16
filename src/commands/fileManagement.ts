import type { BilingualText, CommandInputs } from "./types";

// Lexical checks only: never use this to claim a path or filesystem is safe.
function normalizeForRemovalCheck(path: string): string {
  const absolute = path.startsWith("/");
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (parts.length && parts.at(-1) !== "..") parts.pop();
      else if (!absolute) parts.push(part);
    } else parts.push(part);
  }
  return absolute ? "/" + parts.join("/") : parts.join("/") || ".";
}

const rootDirectories = new Set([
  "/bin",
  "/boot",
  "/dev",
  "/etc",
  "/home",
  "/lib",
  "/lib32",
  "/lib64",
  "/media",
  "/mnt",
  "/opt",
  "/proc",
  "/root",
  "/run",
  "/sbin",
  "/srv",
  "/sys",
  "/tmp",
  "/usr",
  "/var",
  "/lost+found",
  "/Users",
]);
const systemTrees = [
  "/bin",
  "/boot",
  "/dev",
  "/etc",
  "/lib",
  "/lib32",
  "/lib64",
  "/proc",
  "/sbin",
  "/sys",
  "/usr",
];

export function isBlockedRemovalTarget(
  path: string,
  recursive: boolean,
): boolean {
  const normalized = normalizeForRemovalCheck(path);
  if (["/", ".", ".."].includes(normalized)) return true;
  if (!recursive) return false;
  return (
    rootDirectories.has(normalized) ||
    systemTrees.some((root) => normalized.startsWith(root + "/")) ||
    /^\/(home|Users)\/[^/]+$/.test(normalized) ||
    /^(~[^/]*|\$HOME|\$\{HOME\})$/.test(normalized)
  );
}

export function validateFileManagementInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  const errors: BilingualText[] = [];
  if (
    (commandId === "cp" || commandId === "mv") &&
    inputs.overwrite === "noClobber" &&
    inputs.update === true
  ) {
    errors.push({
      en: "Update (-u) and no-clobber (-n) cannot be combined here. Disable update or change overwrite mode.",
      id: "Pembaruan (-u) dan tanpa penimpaan (-n) tidak dapat digabungkan di sini. Nonaktifkan pembaruan atau ubah mode penimpaan.",
    });
  }
  if (
    commandId === "mv" &&
    inputs.overwrite === "noClobber" &&
    inputs.backup === true
  ) {
    errors.push({
      en: "Backup (-b) is incompatible with no-clobber (-n). Disable backup or change overwrite mode.",
      id: "Cadangan (-b) tidak kompatibel dengan tanpa penimpaan (-n). Nonaktifkan cadangan atau ubah mode penimpaan.",
    });
  }
  if (commandId === "rm" && Array.isArray(inputs.paths)) {
    for (const path of inputs.paths) {
      if (isBlockedRemovalTarget(path, inputs.recursive === true))
        errors.push({
          en: `Removal target blocked by this builder's conservative path checks: ${path}. Choose a specific, reviewed target. Other paths are not guaranteed safe.`,
          id: `Tujuan penghapusan diblokir oleh pemeriksaan jalur konservatif pembuat ini: ${path}. Pilih tujuan spesifik yang telah diperiksa. Jalur lain tidak dijamin aman.`,
        });
    }
  }
  return errors;
}
