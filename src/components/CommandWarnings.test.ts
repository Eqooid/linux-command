import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cp, mv, rm } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { getCommandWarnings } from "../commands/warnings";
import { CommandWarnings } from "./CommandWarnings";
import { CommandForm } from "./CommandForm";

describe("file-management warnings and form metadata", () => {
  it("renders the strongest warning in both languages with monochrome emphasis", () => {
    const warnings = getCommandWarnings(rm, {
      ...initialInputs(rm),
      recursive: true,
      confirmation: "force",
    });
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(CommandWarnings, { warnings, language }),
      );
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('data-warning-level="danger"');
      expect(html).toContain("border-2");
      expect(html).toContain(language === "en" ? "HIGH RISK" : "RISIKO TINGGI");
    }
  });
  it("archive mode hides redundant recursive/preserve controls", () => {
    const html = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: cp,
        language: "en",
        inputs: { ...initialInputs(cp), copyMode: "archive" },
        onChange: () => {},
      }),
    );
    expect(html).not.toContain("Copy directories recursively");
    expect(html).not.toContain("Preserve attributes");
  });
  it("keeps all contextual notes bilingual", () => {
    for (const definition of [cp, mv, rm]) {
      const warnings = getCommandWarnings(definition, {
        ...initialInputs(definition),
        sources: ["a", "b"],
        overwrite: "force",
        recursive: true,
        confirmation: "force",
      });
      for (const warning of warnings) {
        expect(warning.text.en.trim()).not.toBe("");
        expect(warning.text.id.trim()).not.toBe("");
      }
    }
  });
});
