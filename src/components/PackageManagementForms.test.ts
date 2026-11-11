import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { apt, aptCache, dpkg } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs, Language } from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";

function form(definition: CommandDefinition, changes: CommandInputs = {}, language: Language = "en") {
  return renderToStaticMarkup(createElement(CommandForm, { definition, inputs: { ...initialInputs(definition), ...changes }, language, onChange: () => {} }));
}

describe("T14 package forms", () => {
  it("shows only action-compatible apt controls", () => {
    expect(form(apt)).not.toContain('id="argument-packages-0"');
    expect(form(apt)).not.toContain("Assume yes");
    expect(form(apt, { action: "install" })).toContain('id="argument-packages-0"');
    expect(form(apt, { action: "install" })).toContain("Omit recommended packages");
    expect(form(apt, { action: "search" })).toContain('id="argument-pattern-0"');
    expect(form(apt, { action: "search" })).not.toContain("Add sudo");
    expect(form(apt, { action: "list" })).toContain('id="choice-listFilter"');
  });
  it("switches apt-cache and dpkg target inputs", () => {
    expect(form(aptCache, { action: "pkgnames" })).not.toContain('id="argument-package-0"');
    expect(form(aptCache, { action: "depends" })).toContain('id="argument-package-0"');
    expect(form(dpkg, { operation: "install" })).toContain('id="argument-archivePath-0"');
    expect(form(dpkg, { operation: "install" })).not.toContain('id="argument-package-0"');
    expect(form(dpkg, { operation: "owner" })).toContain('id="argument-ownedPath-0"');
    expect(form(dpkg, { operation: "owner" })).not.toContain("Add sudo");
  });
  it("renders bilingual workspaces with copy, pin, favorite and warnings", () => {
    for (const definition of [apt, aptCache, dpkg])
      for (const language of ["en", "id"] as const) {
        const html = renderToStaticMarkup(createElement(CommandWorkspace, { definition, language, favorite: false, pinnedTexts: [], onFavorite: () => {}, onPin: () => {} }));
        expect(html).toContain(language === "en" ? "Package Management" : "Manajemen Paket");
        expect(html).toContain(language === "en" ? "Copy command" : "Salin perintah");
        expect(html).toContain(language === "en" ? "Pin command" : "Sematkan perintah");
        expect(html).toContain(language === "en" ? "Key concepts" : "Konsep utama");
      }
  });
});
