import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { man, whoami, id, groups } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";
import { HelpUtility, helpContent } from "./HelpUtility";
import { CommandWorkspace } from "./CommandWorkspace";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

describe("help and identity UI", () => {
  it("hides modifiers in full id output and displays them in selective modes", () => {
    for (const output of ["all", "user", "group", "groups"]) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: id,
          inputs: { ...initialInputs(id), output },
          language: "en",
          onChange: () => {},
        }),
      );
      expect(html.includes('type="checkbox"')).toBe(output !== "all");
      expect(html.includes("NUL-separated output")).toBe(output !== "all");
    }
  });
  it("renders whoami without unnecessary inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: whoami,
        inputs: initialInputs(whoami),
        language: "en",
        onChange: () => {},
      }),
    );
    expect(html).toContain("needs no options or arguments");
    expect(html).not.toContain("<input");
  });
  it("renders both languages and manual shortcut tables", () => {
    for (const language of ["en", "id"] as const) {
      const shortcuts = renderToStaticMarkup(
        createElement(KeyboardShortcuts, {
          shortcuts: man.shortcuts,
          language,
        }),
      );
      expect(shortcuts).toContain("<table");
      for (const item of man.shortcuts!.items)
        expect(shortcuts).toContain(item.description[language]);
      const form = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: groups,
          inputs: initialInputs(groups),
          language,
          onChange: () => {},
        }),
      );
      expect(form).toContain(
        language === "en" ? "Add username" : "Tambah nama pengguna",
      );
      const help = renderToStaticMarkup(
        createElement(HelpUtility, { language }),
      );
      expect(help).toContain("ls --help");
      expect(help).toContain(helpContent.title[language]);
      for (const item of helpContent.interfaces)
        expect(item.description[language].trim()).not.toBe("");
    }
  });
  it("disables preview actions for invalid manual and username inputs", () => {
    for (const definition of [man]) {
      expect(
        generateCommand(definition, initialInputs(definition)).command,
      ).toBeNull();
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
      expect(html.match(/disabled=""/g)).toHaveLength(2);
    }
    expect(
      generateCommand(groups, { usernames: ["alice", ""] }).command,
    ).toBeNull();
  });
});
