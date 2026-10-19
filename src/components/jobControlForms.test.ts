import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { background, fg, bg } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";

describe("job-control form integration", () => {
  it.each([fg, bg])(
    "keeps $name minimal and only shows the number when selected",
    (definition) => {
      for (const selection of [
        "current",
        "previous",
        "explicit-current",
        "number",
      ]) {
        const html = renderToStaticMarkup(
          createElement(CommandForm, {
            definition,
            inputs: { ...initialInputs(definition), selection },
            language: "en",
            onChange: () => {},
          }),
        );
        expect(html).toContain('id="choice-selection"');
        expect(html.includes('id="argument-jobNumber-0"')).toBe(
          selection === "number",
        );
        expect(html).not.toContain('type="checkbox"');
      }
    },
  );
  it("renders separate literal argument rows with translated controls", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: background,
          inputs: {
            ...initialInputs(background),
            arguments: ["120", "file with spaces"],
          },
          language,
          onChange: () => {},
        }),
      );
      expect(html).toContain('id="argument-executable-0"');
      expect(html).toContain('id="argument-arguments-1"');
      expect(html).toContain(
        language === "en" ? "Add argument" : "Tambah argumen",
      );
      expect(html).toContain(
        language === "en" ? "Remove argument" : "Hapus argumen",
      );
    }
  });
  it("disables copy/pin for an empty background executable and renders bilingual learning references", () => {
    for (const language of ["en", "id"] as const)
      for (const definition of [background, fg, bg]) {
        const html = renderToStaticMarkup(
          createElement(CommandWorkspace, {
            definition,
            language,
            favorite: false,
            pinnedTexts: [],
            onFavorite: () => {},
            onPin: () => {},
          }),
        );
        if (definition === background)
          expect(
            (html.match(/disabled=""/g) ?? []).length,
          ).toBeGreaterThanOrEqual(2);
        else expect(html).not.toContain('disabled=""');
        expect(html).toContain(
          language === "en" ? "Job specifications" : "Spesifikasi job",
        );
        expect(html).toContain("Ctrl + Z");
        expect(html).toContain("<table");
        expect(html).toContain("fg %1");
        expect(html).not.toContain("<iframe");
      }
  });
});
