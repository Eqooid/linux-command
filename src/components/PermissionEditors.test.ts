import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { chmod, chown, sudo, su } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";
import {
  NumericPermissionEditor,
  PermissionVisualization,
  SymbolicPermissionEditor,
  permissionText,
} from "./PermissionEditors";

describe("permission editors and access forms", () => {
  it("renders bilingual arithmetic, labels, and an accessible live visualization", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(NumericPermissionEditor, {
          value: "754",
          language,
          onChange: () => {},
        }),
      );
      expect(html).toContain("rwxr-xr--");
      expect(html).toContain("<table");
      expect(html).toContain('scope="row"');
      expect(html).toContain(permissionText.owner[language]);
      expect(html).toContain(permissionText.group[language]);
      expect(html).toContain(permissionText.others[language]);
      expect(html.match(/type="checkbox"/g)).toHaveLength(9);
      expect(html.match(/checked=""/g)).toHaveLength(6);
      expect(html).toContain('aria-live="polite"');
      for (const text of Object.values(permissionText)) {
        expect(text.en.trim()).not.toBe("");
        expect(text.id.trim()).not.toBe("");
      }
    }
  });
  it("does not invent a visualization from invalid numeric input", () => {
    const html = renderToStaticMarkup(
      createElement(NumericPermissionEditor, {
        value: "888",
        language: "en",
        onChange: () => {},
      }),
    );
    expect(html).not.toContain("<table");
    expect(html.match(/disabled=""/g)).toHaveLength(9);
    expect(html).toContain('aria-invalid="true"');
    expect(
      renderToStaticMarkup(
        createElement(PermissionVisualization, {
          mode: "4755",
          language: "en",
        }),
      ),
    ).toBe("");
  });
  it("renders separate ordered clause controls including empty assignment", () => {
    const html = renderToStaticMarkup(
      createElement(SymbolicPermissionEditor, {
        value: ["u=rw", "g=r", "o="],
        language: "en",
        onChange: () => {},
      }),
    );
    expect(html).toContain('id="clause-who-2"');
    expect(html).toContain('id="clause-operation-2"');
    expect(html).toContain("o=");
    expect(html.match(/type="checkbox"/g)).toHaveLength(9);
    expect(html).toContain("Add clause");
    expect(html).not.toContain("<table");
  });
  it("renders only the active permission editor", () => {
    for (const permissionMode of ["numeric", "symbolic"]) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: chmod,
          inputs: { ...initialInputs(chmod), permissionMode },
          language: "en",
          onChange: () => {},
        }),
      );
      expect(html.includes('id="argument-numeric-0"')).toBe(
        permissionMode === "numeric",
      );
      expect(html.includes('id="clause-who-0"')).toBe(
        permissionMode === "symbolic",
      );
    }
  });
  it("hides inactive privilege commands, user fields, and preserve mode", () => {
    const invalidate = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: sudo,
        inputs: { ...initialInputs(sudo), mode: "invalidate" },
        language: "en",
        onChange: () => {},
      }),
    );
    expect(invalidate).not.toContain("<input");
    const login = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: su,
        inputs: { ...initialInputs(su), mode: "login", preserve: true },
        language: "en",
        onChange: () => {},
      }),
    );
    expect(login).not.toContain('type="checkbox"');
    expect(login).not.toContain('id="argument-executable-0"');
    const command = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: su,
        inputs: { ...initialInputs(su), mode: "command" },
        language: "id",
        onChange: () => {},
      }),
    );
    expect(command).not.toContain('id="argument-shell-0"');
    expect(command).toContain('id="argument-executable-0"');
    expect(command).toContain("Tambah argumen");
  });
  it("disables copy/pin until mandatory command, paths, or ownership are valid", () => {
    for (const definition of [sudo, chmod, chown]) {
      const html = renderToStaticMarkup(
        createElement(CommandWorkspace, {
          definition,
          language: "en",
          favorite: false,
          pinnedTexts: [],
          onFavorite: () => {},
          onPin: () => {},
        }),
      );
      expect(html).toContain("Correct the configuration");
      expect((html.match(/disabled=""/g) ?? []).length).toBeGreaterThanOrEqual(
        2,
      );
    }
  });
});
