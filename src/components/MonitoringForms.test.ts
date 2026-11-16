import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { free, df, du, uptime, uname, lsblk } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs } from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";

function form(definition: CommandDefinition, changes: CommandInputs = {}) {
  return renderToStaticMarkup(createElement(CommandForm, { definition, inputs: { ...initialInputs(definition), ...changes }, language: "en", onChange: () => {} }));
}

describe("T15 monitoring forms", () => {
  it("shows a controlled checkbox selection for lsblk custom columns", () => {
    const html = form(lsblk, { mode: "custom", columns: ["NAME", "SIZE"] });
    expect(html).toContain("MOUNTPOINTS");
    expect(html.match(/checked=""/g)).toHaveLength(2);
    expect(html).not.toContain('id="argument-columns-0"');
    expect(form(lsblk)).not.toContain("Select at least one column");
  });
  it("hides redundant uname flags and du file listing under summary", () => {
    expect(form(uname, { all: true })).not.toContain("Processor type");
    expect(form(uname)).toContain("Processor type");
    expect(form(du, { summary: true })).not.toContain("Include files");
    expect(form(du)).toContain('value="."');
  });
  it("renders each bilingual workspace with shared learning and copy/pin actions", () => {
    for (const definition of [free, df, du, uptime, uname, lsblk])
      for (const language of ["en", "id"] as const) {
        const html = renderToStaticMarkup(createElement(CommandWorkspace, { definition, language, favorite: false, pinnedTexts: [], onFavorite: () => {}, onPin: () => {} }));
        expect(html).toContain(language === "en" ? "System Monitoring &amp; Disk Usage" : "Pemantauan Sistem &amp; Penggunaan Disk");
        expect(html).toContain(language === "en" ? "Copy command" : "Salin perintah");
        expect(html).toContain(language === "en" ? "Pin command" : "Sematkan perintah");
        expect(html).toContain(language === "en" ? "Scenario: memory pressure" : "Skenario: tekanan memori");
      }
  });
});
