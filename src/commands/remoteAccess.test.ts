import { describe, expect, it } from "vitest";
import { ssh, sshKeygen, sshCopyId, scp, sftp } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { localPath, scpLocalPath } from "./remoteAccess";
import { commands, validateRegistry } from "./registry";
import { getCommandWarnings } from "./warnings";
import type { CommandDefinition, CommandInputs } from "./types";

type TestChanges = Record<string, string | boolean | string[] | undefined>;
function result(definition: CommandDefinition, values: TestChanges = {}) {
  const present = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as CommandInputs;
  return generateCommand(definition, { ...initialInputs(definition), ...present });
}
function built(definition: CommandDefinition, values: TestChanges = {}) {
  const output = result(definition, values);
  expect(output.errors).toEqual([]);
  return output.command;
}

describe("T13 registry and bilingual educational content", () => {
  it("registers five remote-access commands with complete metadata", () => {
    expect(commands.filter((item) => item.category === "remote").map((item) => item.id))
      .toEqual(["ssh", "ssh-keygen", "ssh-copy-id", "scp", "sftp"]);
    for (const definition of [ssh, sshKeygen, sshCopyId, scp, sftp]) {
      expect(validateRegistry([definition])).toEqual([]);
      expect(definition.concepts?.length).toBeGreaterThanOrEqual(10);
      expect(definition.examples.every((item) => item.description.en && item.description.id)).toBe(true);
    }
    expect(sftp.shortcuts?.items.map((item) => item.keys)).toEqual(["pwd", "lpwd", "ls", "lls", "cd", "lcd", "get", "put", "mkdir", "bye"]);
  });
});

describe("SSH destination and local path serialization", () => {
  it("expands only a trusted home prefix and quotes literal suffixes", () => {
    expect(localPath("~/.ssh/my key")).toBe("~/'.ssh/my key'");
    expect(localPath("/tmp/key's")).toBe("'/tmp/key'\"'\"'s'");
    expect(scpLocalPath("report:final.txt")).toBe("'./report:final.txt'");
    expect(scpLocalPath("-draft.txt")).toBe("'./-draft.txt'");
  });
});

describe("ssh", () => {
  it("builds username, host, port, key, timeout and IP-family options", () => {
    expect(built(ssh, { host: "example.com" })).toBe("ssh 'example.com'");
    expect(built(ssh, { host: "192.168.1.20", username: "developer" })).toBe("ssh 'developer@192.168.1.20'");
    expect(built(ssh, { host: "example.com", username: "developer", port: "2222", identity: "~/.ssh/my key", verbose: true, timeout: "10", family: "4" }))
      .toBe("ssh -p 2222 -i ~/'.ssh/my key' -v -o ConnectTimeout=10 -4 'developer@example.com'");
    expect(built(ssh, { host: "::1", family: "6" })).toBe("ssh -6 '[::1]'");
  });
  it("rejects invalid destinations, ports, usernames and timeouts", () => {
    for (const values of [{ host: "" }, { host: "example.com;id" }, { host: "example.com", username: "root;id" }, { host: "example.com", port: "0" }, { host: "example.com", port: "65536" }, { host: "example.com", timeout: "-1" }, { host: "example.com", family: "both" }])
      expect(result(ssh, values).command).toBeNull();
  });
});

describe("ssh-keygen", () => {
  it("generates Ed25519 and RSA key commands without passphrases", () => {
    expect(built(sshKeygen)).toBe("ssh-keygen -t ed25519");
    expect(built(sshKeygen, { comment: "my laptop" })).toBe("ssh-keygen -t ed25519 -C 'my laptop'");
    expect(built(sshKeygen, { output: "~/.ssh/id_ed25519" })).toBe("ssh-keygen -t ed25519 -f ~/'.ssh/id_ed25519'");
    expect(built(sshKeygen, { algorithm: "rsa", rsaBits: "4096", comment: "legacy-server" })).toBe("ssh-keygen -t rsa -b 4096 -C 'legacy-server'");
  });
  it("rejects invalid algorithm, RSA size, and empty comment/path", () => {
    for (const values of [{ algorithm: "dsa" }, { algorithm: "rsa", rsaBits: "1024" }, { output: "   " }, { comment: "   " }])
      expect(result(sshKeygen, values).command).toBeNull();
  });
  it("warns for a common output filename without reading the filesystem", () => {
    const warnings = getCommandWarnings(sshKeygen, { ...initialInputs(sshKeygen), output: "~/.ssh/id_ed25519" });
    expect(warnings.some((warning) => warning.level === "warning" && warning.text.en.includes("already exists"))).toBe(true);
    expect(warnings.every((warning) => warning.text.id.length > 0)).toBe(true);
  });
});

describe("ssh-copy-id", () => {
  it("uses lowercase port and a public-key file", () => {
    expect(built(sshCopyId, { host: "example.com", username: "developer" })).toBe("ssh-copy-id 'developer@example.com'");
    expect(built(sshCopyId, { host: "192.168.1.20", username: "developer", port: "2222", publicKey: "~/.ssh/my key.pub" }))
      .toBe("ssh-copy-id -i ~/'.ssh/my key.pub' -p 2222 'developer@192.168.1.20'");
  });
  it("rejects missing host, private-key path, and invalid port", () => {
    for (const values of [{ host: "" }, { host: "example.com", publicKey: "~/.ssh/id_ed25519" }, { host: "example.com", port: "99999" }])
      expect(result(sshCopyId, values).command).toBeNull();
  });
});

describe("scp", () => {
  const base = { host: "example.com", username: "developer", localPath: "./backup.zip", remotePath: "/home/developer/" };
  it("builds uploads, downloads and recursive directory copies", () => {
    expect(built(scp, base)).toBe("scp './backup.zip' 'developer@example.com:/home/developer/'");
    expect(built(scp, { ...base, mode: "download-file", remotePath: "/var/log/app.log", localPath: "./app.log" }))
      .toBe("scp 'developer@example.com:/var/log/app.log' './app.log'");
    expect(built(scp, { ...base, mode: "upload-directory", localPath: "./project" }))
      .toBe("scp -r './project' 'developer@example.com:/home/developer/'");
    expect(built(scp, { ...base, mode: "download-directory", port: "2222", identity: "~/.ssh/id_ed25519", preserve: true, verbose: true }))
      .toBe("scp -P 2222 -i ~/'.ssh/id_ed25519' -r -p -v 'developer@example.com:/home/developer/' './backup.zip'");
  });
  it("handles spaces, colons and hyphens, and rejects unsupported remote globs", () => {
    expect(built(scp, { ...base, localPath: "-draft:one.txt", remotePath: "/remote/my file.txt" }))
      .toBe("scp './-draft:one.txt' 'developer@example.com:/remote/my file.txt'");
    for (const values of [{ ...base, localPath: "" }, { ...base, remotePath: "" }, { ...base, remotePath: "*.txt" }, { ...base, host: "bad host" }])
      expect(result(scp, values).command).toBeNull();
  });
});

describe("sftp", () => {
  it("builds an interactive connection with uppercase port and identity", () => {
    expect(built(sftp, { host: "example.com", username: "developer" })).toBe("sftp 'developer@example.com'");
    expect(built(sftp, { host: "example.com", username: "developer", port: "2222", identity: "~/.ssh/id_ed25519" }))
      .toBe("sftp -P 2222 -i ~/'.ssh/id_ed25519' 'developer@example.com'");
  });
  it("rejects invalid host and port", () => {
    expect(result(sftp, { host: "" }).command).toBeNull();
    expect(result(sftp, { host: "example.com", port: "0" }).command).toBeNull();
  });
});
