import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cat, less, nano } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

describe("educational shortcut references", () => {
  it("renders bilingual semantic tables without changing key names", () => {
    for (const definition of [less, nano])
      for (const language of ["en", "id"] as const) {
        const html = renderToStaticMarkup(
          createElement(KeyboardShortcuts, {
            shortcuts: definition.shortcuts,
            language,
          }),
        );
        expect(html).toContain("<table");
        expect(html).toContain('scope="col"');
        expect(html).toContain(
          language === "en" ? "Keyboard shortcuts" : "Pintasan keyboard",
        );
        for (const item of definition.shortcuts!.items) {
          expect(html).toContain(item.keys);
          expect(html).toContain(item.description[language]);
        }
      }
  });
  it("renders no empty shortcut panel for commands without a reference", () => {
    expect(
      renderToStaticMarkup(
        createElement(KeyboardShortcuts, {
          shortcuts: cat.shortcuts,
          language: "en",
        }),
      ),
    ).toBe("");
  });
  it("hides redundant invisible-character toggles under cat -A", () => {
    const html = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: cat,
        inputs: { ...initialInputs(cat), showAll: true },
        language: "en",
        onChange: () => {},
      }),
    );
    expect(html).not.toContain("Mark line endings");
    expect(html).not.toContain("Mark tabs");
  });
});
