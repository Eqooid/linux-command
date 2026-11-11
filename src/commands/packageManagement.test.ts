import { describe, expect, it } from "vitest";
import { apt, aptCache, dpkg } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { packageFilePath, validPackageName } from "./packageManagement";
import { commands, validateRegistry } from "./registry";
import type { CommandDefinition, CommandInputs } from "./types";
import { getCommandWarnings } from "./warnings";

type Changes = Record<string, string | boolean | readonly string[] | undefined>;
function result(definition: CommandDefinition, changes: Changes = {}) {
  const present = Object.fromEntries(Object.entries(changes)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])) as CommandInputs;
  return generateCommand(definition, { ...initialInputs(definition), ...present });
}
function command(definition: CommandDefinition, changes: Changes = {}) {
  const output = result(definition, changes);
  expect(output.errors).toEqual([]);
  return output.command;
}

describe("T14 registry and localization", () => {
  it("registers three translated package builders", () => {
    expect(commands.filter((definition) => definition.category === "packages").map((definition) => definition.id))
      .toEqual(["apt", "apt-cache", "dpkg"]);
    for (const definition of [apt, aptCache, dpkg]) {
      expect(validateRegistry([definition])).toEqual([]);
      expect(definition.concepts?.length).toBeGreaterThanOrEqual(8);
      expect(definition.comparison?.length).toBe(3);
      expect(definition.examples.every((item) => item.description.en && item.description.id)).toBe(true);
    }
  });
});

describe("apt", () => {
  it.each([
    [{}, "apt update"],
    [{ action: "update", sudo: true }, "sudo apt update"],
    [{ action: "upgrade" }, "apt upgrade"],
    [{ action: "full-upgrade", sudo: true }, "sudo apt full-upgrade"],
    [{ action: "autoremove" }, "apt autoremove"],
    [{ action: "install", packages: ["nginx"] }, "apt install 'nginx'"],
    [{ action: "install", packages: ["nginx", "curl", "git"], sudo: true }, "sudo apt install 'nginx' 'curl' 'git'"],
    [{ action: "remove", packages: ["nginx"] }, "apt remove 'nginx'"],
    [{ action: "purge", packages: ["nginx"] }, "apt purge 'nginx'"],
    [{ action: "search", pattern: "nginx" }, "apt search 'nginx'"],
    [{ action: "show", packages: ["nginx"] }, "apt show 'nginx'"],
    [{ action: "list" }, "apt list"],
    [{ action: "list", listFilter: "installed" }, "apt list --installed"],
    [{ action: "list", listFilter: "upgradable" }, "apt list --upgradable"],
  ] as const)("builds %j", (changes, expected) => expect(command(apt, changes)).toBe(expected));

  it("uses only action-compatible options, with no automatic sudo or -y", () => {
    expect(command(apt, { action: "install", packages: ["nginx"], assumeYes: true, noRecommends: true, reinstall: true }))
      .toBe("apt install -y --no-install-recommends --reinstall 'nginx'");
    expect(command(apt, { action: "remove", packages: ["nginx"], assumeYes: true, noRecommends: true, reinstall: true }))
      .toBe("apt remove -y 'nginx'");
    expect(command(apt, { action: "search", pattern: "nginx", sudo: true, assumeYes: true }))
      .toBe("apt search 'nginx'");
    expect(command(apt, { action: "install", packages: ["libc6:amd64", "g++"] }))
      .toBe("apt install 'libc6:amd64' 'g++'");
  });

  it("rejects missing and invalid package names or patterns", () => {
    for (const action of ["install", "remove", "purge", "show"])
      expect(result(apt, { action, packages: [""] }).command).toBeNull();
    for (const name of ["--help", "nginx;id", "nginx curl", "../../foo", "BAD"])
      expect(result(apt, { action: "install", packages: [name] }).command).toBeNull();
    expect(result(apt, { action: "install", packages: ["nginx", ""] }).command).toBeNull();
    expect(result(apt, { action: "search", pattern: "" }).command).toBeNull();
    expect(result(apt, { action: "search", pattern: "-o" }).command).toBeNull();
    expect(result(apt, { action: "list", listFilter: "invalid" }).command).toBeNull();
  });

  it("quotes search patterns as one literal shell argument", () => {
    expect(command(apt, { action: "search", pattern: "web server|nginx" })).toBe("apt search 'web server|nginx'");
    expect(command(apt, { action: "search", pattern: "user's package" })).toBe("apt search 'user'\"'\"'s package'");
  });

  it("shows contextual bilingual warnings for risky actions", () => {
    for (const action of ["full-upgrade", "purge", "autoremove"])
      expect(getCommandWarnings(apt, { ...initialInputs(apt), action }).some((item) => item.level === "warning" && item.text.en && item.text.id)).toBe(true);
    expect(getCommandWarnings(apt, { ...initialInputs(apt), action: "install", assumeYes: true }).some((item) => item.text.en.includes("-y"))).toBe(true);
  });
});

describe("apt-cache", () => {
  it.each([
    [{ action: "search", pattern: "nginx" }, "apt-cache search 'nginx'"],
    [{ action: "show", package: "nginx" }, "apt-cache show 'nginx'"],
    [{ action: "depends", package: "nginx" }, "apt-cache depends 'nginx'"],
    [{ action: "rdepends", package: "nginx" }, "apt-cache rdepends 'nginx'"],
    [{ action: "policy", package: "nginx" }, "apt-cache policy 'nginx'"],
    [{ action: "pkgnames" }, "apt-cache pkgnames"],
  ] as const)("builds %j", (changes, expected) => expect(command(aptCache, changes)).toBe(expected));
  it("requires a query for all modes except pkgnames", () => {
    for (const action of ["show", "depends", "rdepends", "policy"])
      expect(result(aptCache, { action, package: "" }).command).toBeNull();
    expect(result(aptCache, { action: "search", pattern: "" }).command).toBeNull();
    expect(result(aptCache, { action: "show", package: "foo;id" }).command).toBeNull();
    expect(command(aptCache, { action: "search", pattern: "(nginx|apache)" })).toBe("apt-cache search '(nginx|apache)'");
  });
});

describe("dpkg", () => {
  it.each([
    [{}, "dpkg -l"],
    [{ listFilter: "nginx" }, "dpkg -l 'nginx'"],
    [{ operation: "status", package: "nginx" }, "dpkg -s 'nginx'"],
    [{ operation: "files", package: "nginx" }, "dpkg -L 'nginx'"],
    [{ operation: "owner", ownedPath: "/usr/bin/curl" }, "dpkg -S '/usr/bin/curl'"],
    [{ operation: "install", archivePath: "package.deb", sudo: true }, "sudo dpkg -i 'package.deb'"],
    [{ operation: "remove", package: "nginx", sudo: true }, "sudo dpkg -r 'nginx'"],
    [{ operation: "purge", package: "nginx", sudo: true }, "sudo dpkg -P 'nginx'"],
    [{ operation: "contents", archivePath: "package.deb" }, "dpkg --contents 'package.deb'"],
    [{ operation: "info", archivePath: "package.deb" }, "dpkg --info 'package.deb'"],
  ] as const)("builds %j", (changes, expected) => expect(command(dpkg, changes)).toBe(expected));

  it("quotes literal paths and disambiguates leading hyphens", () => {
    expect(command(dpkg, { operation: "install", archivePath: "my package.deb" })).toBe("dpkg -i 'my package.deb'");
    expect(command(dpkg, { operation: "install", archivePath: "-package.deb" })).toBe("dpkg -i './-package.deb'");
    expect(command(dpkg, { operation: "owner", ownedPath: "-special file" })).toBe("dpkg -S './-special file'");
    expect(packageFilePath("/tmp/it's here.deb")).toBe("'/tmp/it'\"'\"'s here.deb'");
  });

  it("rejects incorrect package and archive inputs", () => {
    for (const operation of ["status", "files", "remove", "purge"])
      expect(result(dpkg, { operation, package: "" }).command).toBeNull();
    for (const operation of ["install", "contents", "info"])
      expect(result(dpkg, { operation, archivePath: "package.txt" }).command).toBeNull();
    expect(result(dpkg, { operation: "owner", ownedPath: "" }).command).toBeNull();
    expect(result(dpkg, { operation: "status", package: "nginx;id" }).command).toBeNull();
    expect(result(dpkg, { operation: "list", listFilter: "-x" }).command).toBeNull();
  });

  it("shows warnings for install, remove and purge", () => {
    for (const operation of ["install", "remove", "purge"])
      expect(getCommandWarnings(dpkg, { ...initialInputs(dpkg), operation }).some((item) => item.level === "warning" && item.text.en && item.text.id)).toBe(true);
  });
});

describe("package identifier subset", () => {
  it("accepts Debian-style names and rejects shell/control syntax", () => {
    for (const name of ["nginx", "g++", "python3.12", "libc6:amd64", "node-js"])
      expect(validPackageName(name)).toBe(true);
    for (const name of ["", "-nginx", "foo/bar", "foo bar", "foo$(id)", "Foo", "foo\nbar"])
      expect(validPackageName(name)).toBe(false);
  });
});
