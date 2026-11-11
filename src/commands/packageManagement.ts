import type { BilingualText, CommandInputs } from "./types";
import { quoteShellArgument } from "./arguments";

const issue = (en: string, id: string): BilingualText => ({ en, id });
const aptChangeActions = ["update", "upgrade", "full-upgrade", "install", "remove", "purge", "autoremove"];
const aptPromptActions = ["upgrade", "full-upgrade", "install", "remove", "purge", "autoremove"];
const aptPackageActions = ["install", "remove", "purge", "show"];
const dpkgPackageActions = ["status", "files", "remove", "purge"];
const dpkgArchiveActions = ["install", "contents", "info"];

// This beginner subset accepts literal Debian names and optional architecture suffixes.
// Version/release selectors and APT pattern syntax need separate controls before support.
export function validPackageName(value: string): boolean {
  return /^[a-z0-9][a-z0-9+.-]*(?::[a-z0-9][a-z0-9-]*)?$/.test(value) && value.length <= 200;
}

function validSearchPattern(value: string): boolean {
  return value.trim().length > 0 && !value.startsWith("-") && !/[\x00-\x1f\x7f]/.test(value);
}

function validDebPath(value: string): boolean {
  return value.trim().length > 0 && value.endsWith(".deb") && !/[\x00-\x1f\x7f]/.test(value);
}

// Prefix relative option-looking paths. Shell quoting alone does not stop a tool
// from interpreting a leading hyphen as its own option.
export function packageFilePath(value: string): string {
  return quoteShellArgument(value.startsWith("-") ? `./${value}` : value);
}

export function validatePackageInputs(id: string, inputs: CommandInputs): BilingualText[] {
  const errors: BilingualText[] = [];
  if (id === "apt") {
    const action = inputs.action as string;
    if (aptPackageActions.includes(action) && (inputs.packages as string[]).some((name) => !validPackageName(name)))
      errors.push(issue("Use common literal Debian package names, with an optional architecture suffix such as :amd64.", "Gunakan nama paket Debian literal umum, dengan akhiran arsitektur opsional seperti :amd64."));
    if (action === "search" && !validSearchPattern(inputs.pattern as string))
      errors.push(issue("Enter a non-empty search pattern that does not begin with -.", "Isi pola pencarian yang tidak kosong dan tidak diawali -."));
  }
  if (id === "apt-cache") {
    if (inputs.action === "search" && !validSearchPattern(inputs.pattern as string))
      errors.push(issue("Enter a non-empty search pattern that does not begin with -.", "Isi pola pencarian yang tidak kosong dan tidak diawali -."));
    if (["show", "depends", "rdepends", "policy"].includes(inputs.action as string) && !validPackageName(inputs.package as string))
      errors.push(issue("Enter a literal Debian package name.", "Isi nama paket Debian literal."));
  }
  if (id === "dpkg") {
    const operation = inputs.operation as string;
    if (dpkgPackageActions.includes(operation) && !validPackageName(inputs.package as string))
      errors.push(issue("Enter a literal package name, not a file path.", "Isi nama paket literal, bukan jalur berkas."));
    if (operation === "list" && inputs.listFilter && !validPackageName(inputs.listFilter as string))
      errors.push(issue("Enter a literal package name for the optional list filter.", "Isi nama paket literal untuk filter daftar opsional."));
    if (dpkgArchiveActions.includes(operation) && !validDebPath(inputs.archivePath as string))
      errors.push(issue("Enter a non-empty local path ending in .deb.", "Isi jalur lokal yang tidak kosong dengan akhiran .deb."));
    if (operation === "owner" && (!(inputs.ownedPath as string).trim() || /[\x00-\x1f\x7f]/.test(inputs.ownedPath as string)))
      errors.push(issue("Enter a file path or search pattern for installed-file ownership.", "Isi jalur berkas atau pola pencarian untuk kepemilikan berkas terpasang."));
  }
  return errors;
}

export function buildApt(inputs: CommandInputs): string {
  const action = inputs.action as string;
  const parts = [...(aptChangeActions.includes(action) && inputs.sudo ? ["sudo"] : []), "apt", action];
  if (aptPromptActions.includes(action) && inputs.assumeYes) parts.push("-y");
  if (action === "install") {
    if (inputs.noRecommends) parts.push("--no-install-recommends");
    if (inputs.reinstall) parts.push("--reinstall");
  }
  if (action === "list" && inputs.listFilter !== "all") parts.push(`--${inputs.listFilter}`);
  if (aptPackageActions.includes(action)) parts.push(...(inputs.packages as string[]).map(quoteShellArgument));
  if (action === "search") parts.push(quoteShellArgument(inputs.pattern as string));
  return parts.join(" ");
}

export function buildAptCache(inputs: CommandInputs): string {
  const action = inputs.action as string;
  const parts = ["apt-cache", action];
  if (action === "search") parts.push(quoteShellArgument(inputs.pattern as string));
  if (["show", "depends", "rdepends", "policy"].includes(action)) parts.push(quoteShellArgument(inputs.package as string));
  return parts.join(" ");
}

const dpkgOperations: Record<string, string> = {
  list: "-l", status: "-s", files: "-L", owner: "-S", install: "-i",
  remove: "-r", purge: "-P", contents: "--contents", info: "--info",
};

export function buildDpkg(inputs: CommandInputs): string {
  const operation = inputs.operation as string;
  const parts = [...(["install", "remove", "purge"].includes(operation) && inputs.sudo ? ["sudo"] : []), "dpkg", dpkgOperations[operation]!];
  if (operation === "list" && inputs.listFilter) parts.push(quoteShellArgument(inputs.listFilter as string));
  if (dpkgPackageActions.includes(operation)) parts.push(quoteShellArgument(inputs.package as string));
  if (dpkgArchiveActions.includes(operation)) parts.push(packageFilePath(inputs.archivePath as string));
  if (operation === "owner") parts.push(packageFilePath(inputs.ownedPath as string));
  return parts.join(" ");
}
