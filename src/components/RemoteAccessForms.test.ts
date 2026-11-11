import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ssh, sshKeygen, sshCopyId, scp, sftp } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs, Language } from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

function form(definition: CommandDefinition, changes: CommandInputs = {}, language: Language = "en") {
  return renderToStaticMarkup(createElement(CommandForm, { definition, inputs: { ...initialInputs(definition), ...changes }, language, onChange: () => {} }));
}

describe("T13 remote-access forms", () => {
  it("shows key-size choice only for RSA and transfer modes clearly", () => {
    expect(form(sshKeygen)).not.toContain('id="choice-rsaBits"');
    expect(form(sshKeygen, { algorithm: "rsa" })).toContain('id="choice-rsaBits"');
    expect(form(scp)).toContain('id="choice-mode"');
    expect(form(scp, {}, "id")).toContain("Arah transfer");
  });
  it("renders all five builders with bilingual navigation, copy, favorite and pin", () => {
    for (const definition of [ssh, sshKeygen, sshCopyId, scp, sftp])
      for (const language of ["en", "id"] as const) {
        const html = renderToStaticMarkup(createElement(CommandWorkspace, { definition, language, favorite: false, pinnedTexts: [], onFavorite: () => {}, onPin: () => {} }));
        expect(html).toContain(definition.name);
        expect(html).toContain(language === "en" ? "SSH &amp; Remote Access" : "SSH &amp; Akses Jarak Jauh");
        expect(html).toContain(language === "en" ? "Copy command" : "Salin perintah");
        expect(html).toContain(language === "en" ? "Pin command" : "Sematkan perintah");
      }
  });
  it("labels SFTP commands as in-session commands", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(createElement(KeyboardShortcuts, { shortcuts: sftp.shortcuts, language }));
      expect(html).toContain(language === "en" ? "SFTP session commands" : "Perintah sesi SFTP");
      expect(html).toContain("<table");
      expect(html).toContain("lpwd");
      expect(html).toContain("bye");
    }
  });
});
