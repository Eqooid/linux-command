import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { pgrep } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";
import { CommandComparison } from "./CommandComparison";

describe("pgrep form and comparison", () => {
  it("renders bilingual groups and a collapsed advanced selection", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: pgrep,
          inputs: initialInputs(pgrep),
          language,
          onChange: () => {},
        }),
      );
      if (pgrep.form.kind !== "grouped")
        throw new Error("Expected grouped form");
      for (const group of pgrep.form.groups)
        expect(html).toContain(group.title[language]);
      expect(html).toContain("<details");
      expect(html).not.toContain("<details open");
      expect(html).toContain('id="argument-pattern-0"');
      expect(html).toContain('id="argument-parentPid-0"');
      expect(html).toContain('id="argument-realUsername-0"');
      expect(html).not.toContain('id="choice-signal"');
    }
  });
  it("renders a translated semantic comparison table", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(CommandComparison, { rows: pgrep.comparison, language }),
      );
      expect(html).toContain("<table");
      expect(html).toContain('scope="col"');
      expect(html).toContain(
        language === "en" ? "Command comparison" : "Perbandingan perintah",
      );
      expect(html).toContain(language === "en" ? "Purpose" : "Tujuan");
      for (const row of pgrep.comparison!)
        expect(html).toContain(row.description[language]);
    }
    expect(
      renderToStaticMarkup(
        createElement(CommandComparison, { rows: undefined, language: "en" }),
      ),
    ).toBe("");
  });
  it("disables copying and pinning without selection criteria", () => {
    const html = renderToStaticMarkup(
      createElement(CommandWorkspace, {
        definition: pgrep,
        language: "en",
        favorite: false,
        pinnedTexts: [],
        onFavorite: () => {},
        onPin: () => {},
      }),
    );
    expect(html).toContain("Correct the configuration");
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});
