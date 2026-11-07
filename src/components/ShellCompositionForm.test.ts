import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  pipeline,
  stdoutRedirection,
  stdinRedirection,
  stderrRedirection,
} from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { getStageCommand } from "../commands/shellStageCommands";
import type {
  CommandDefinition,
  Language,
  ShellComposition,
} from "../commands/types";
import { localize } from "../i18n";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";
import { shellText } from "./shellText";

function renderForm(
  definition: CommandDefinition,
  composition?: ShellComposition,
  language: Language = "en",
): string {
  return renderToStaticMarkup(
    createElement(CommandForm, {
      definition,
      inputs: composition ? { composition } : initialInputs(definition),
      language,
      onChange: () => {},
    }),
  );
}
const literal = { kind: "literal" as const, executable: "ls", args: [] };

describe("shell composition forms", () => {
  it.each(["en", "id"] as const)(
    "renders bilingual stage controls and an accessible data-flow visual in %s",
    (language) => {
      const html = renderForm(pipeline, undefined, language);
      expect(html).toContain('id="shell-stage-0-source"');
      expect(html).toContain('id="shell-stage-1-source"');
      expect(html).toContain(localize(shellText.addStage, language));
      expect(html).toContain("<figure");
      expect(html).toContain("<figcaption");
      expect(html).toContain("stdout (1)");
      expect(html).toContain("stdin (0)");
      expect(html).toContain(localize(shellText.flow, language));
      expect(html).not.toContain("<iframe");
    },
  );
  it("caps stage addition at four and removal at two", () => {
    const html = renderForm(pipeline, {
      stages: Array.from({ length: 4 }, () => literal),
      redirections: [],
    });
    expect(html).toMatch(/disabled=""[^>]*><svg[^]*?Add stage/);
    expect(html).toContain('id="shell-stage-3-executable"');
    expect(html).not.toContain('id="shell-stage-4-executable"');
    const initial = renderForm(pipeline);
    expect((initial.match(/disabled=""/g) ?? []).length).toBe(4);
  });
  it("prefixes reused catalog form IDs so labels and hints do not collide", () => {
    const definition = getStageCommand("ps")!;
    const stage = {
      kind: "registry" as const,
      commandId: "ps",
      inputs: initialInputs(definition) as Record<
        string,
        string | boolean | string[]
      >,
    };
    const html = renderForm(pipeline, {
      stages: [stage, stage],
      redirections: [],
    });
    expect(html).toContain('id="shell-stage-0-choice-mode"');
    expect(html).toContain('id="shell-stage-1-choice-mode"');
    expect(html).toContain('for="shell-stage-1-choice-mode"');
    expect(html).toContain('aria-describedby="shell-stage-1-hint-mode"');
    const ids = Array.from(
      html.matchAll(/\sid="([^"]+)"/g),
      (match) => match[1],
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain("original generator");
  });
  it.each([stdoutRedirection, stdinRedirection, stderrRedirection])(
    "shows a path field for $id without pipeline controls",
    (definition) => {
      const html = renderForm(definition);
      expect(html).toContain('id="shell-file-path"');
      expect(html).not.toContain("Add stage");
      expect(html).not.toContain("Move stage up");
    },
  );
  it("hides file input for stderr duplication and displays ordering only for combined mode", () => {
    const merge = renderForm(stderrRedirection, {
      stages: [literal],
      redirections: [{ operator: "2>&1" }],
    });
    expect(merge).not.toContain('id="shell-file-path"');
    expect(merge).not.toContain('id="shell-redirection-order"');
    const combined = renderForm(stderrRedirection, {
      stages: [literal],
      redirections: [{ operator: "2>&1" }, { operator: ">", path: "out.log" }],
    });
    expect(combined).toContain('id="shell-redirection-order"');
    expect(combined).toContain('value="merge-first" selected=""');
    expect(combined).toContain('id="shell-file-path"');
  });
  it("disables initial preview actions and renders overwrite notes before the preview", () => {
    const html = renderToStaticMarkup(
      createElement(CommandWorkspace, {
        definition: stdoutRedirection,
        language: "en",
        favorite: false,
        pinnedTexts: [],
        onFavorite: () => {},
        onPin: () => {},
      }),
    );
    expect((html.match(/disabled=""/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html.indexOf("Overwrite redirection selected")).toBeLessThan(
      html.indexOf('aria-label="Generated command"'),
    );
    expect(html).toContain("Descriptor duplication and ordering");
  });
  it("keeps every composition label translated without changing Linux syntax", () => {
    for (const text of Object.values(shellText)) {
      expect(text.en.trim()).not.toBe("");
      expect(text.id.trim()).not.toBe("");
    }
    const html = renderForm(
      stderrRedirection,
      { stages: [literal], redirections: [{ operator: "2>&1" }] },
      "id",
    );
    expect(html).toContain("Mode standard error");
    expect(html).toContain("2&gt;&amp;1");
  });
});
