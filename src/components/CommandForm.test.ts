import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { commands } from "../commands/registry";
import { cd, mkdir, touch } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type {
  CommandDefinition,
  CommandInputs,
  Language,
} from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";

function renderForm(
  definition: CommandDefinition,
  changes: CommandInputs = {},
  language: Language = "en",
) {
  return renderToStaticMarkup(
    createElement(CommandForm, {
      definition,
      inputs: { ...initialInputs(definition), ...changes },
      language,
      onChange: () => {},
    }),
  );
}

describe("registry-driven form rendering", () => {
  it('disables copy and pin while required arguments are invalid', () => {
    const html = renderToStaticMarkup(createElement(CommandWorkspace, { definition: mkdir, language: 'en', favorite: false, pinnedTexts: [], onFavorite: () => {}, onPin: () => {} }));
    const buttons = [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map(match => match[0]);
    expect(buttons.find(button => button.includes('Copy command'))).toContain('disabled=""');
    expect(buttons.find(button => button.includes('Pin command'))).toContain('disabled=""');
  });
  it("renders every workspace in both languages without a runtime error", () => {
    for (const definition of commands)
      for (const language of ["en", "id"] as const) {
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
        expect(html).toContain(definition.name);
        expect(html).toContain(
          language === "en" ? "Reset configuration" : "Atur ulang konfigurasi",
        );
      }
  });
  it("shows only fields for the selected navigation/timestamp source", () => {
    expect(renderForm(cd)).not.toContain('id="argument-path-0"');
    expect(renderForm(cd, { destination: "custom" })).toContain(
      'id="argument-path-0"',
    );
    expect(renderForm(touch)).not.toContain('id="argument-reference-0"');
    const reference = renderForm(touch, { source: "reference" });
    expect(reference).toContain('id="argument-reference-0"');
    expect(reference).not.toContain('id="argument-timestamp-0"');
  });
  it("renders separate path rows and conditional permissions", () => {
    const html = renderForm(mkdir, {
      paths: ["docs", "My Images"],
      setMode: true,
    });
    expect(html).toContain('id="argument-paths-0"');
    expect(html).toContain('id="argument-paths-1"');
    expect(html).toContain('id="argument-permissions-0"');
    expect(renderForm(mkdir)).not.toContain('id="argument-permissions-0"');
  });
  it("supplies bilingual validation errors for invalid configurations", () => {
    for (const definition of [mkdir, touch]) {
      const result = generateCommand(definition, initialInputs(definition));
      expect(result.command).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
      for (const error of result.errors) {
        expect(error.en.trim()).not.toBe("");
        expect(error.id.trim()).not.toBe("");
      }
    }
  });
});
