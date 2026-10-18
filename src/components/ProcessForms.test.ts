import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ps, top, kill, pkill, jobs } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { LearningConcepts } from "./LearningConcepts";
import { Sidebar } from "./Sidebar";

describe("process forms and learning references", () => {
  it("shows ps filter fields only in advanced mode", () => {
    for (const mode of ["terminal", "all", "full", "bsd", "tree", "advanced"]) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: ps,
          inputs: { ...initialInputs(ps), mode },
          language: "en",
          onChange: () => {},
        }),
      );
      expect(html.includes('id="argument-pids-0"')).toBe(mode === "advanced");
      expect(html.includes('id="argument-username-0"')).toBe(
        mode === "advanced",
      );
      expect(html.includes('id="argument-columns-0"')).toBe(
        mode === "advanced",
      );
    }
  });
  it("renders named signal selects instead of independent signal flags", () => {
    for (const definition of [kill, pkill]) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition,
          inputs: initialInputs(definition),
          language: "en",
          onChange: () => {},
        }),
      );
      expect(html).toContain('id="choice-signal"');
      expect(html).toContain('value="TERM" selected=""');
      expect(html).toContain("SIGKILL (9)");
      expect(html).not.toContain('name="signalKILL"');
      if (definition.id === "kill")
        expect(html).not.toContain('type="checkbox"');
    }
  });
  it("renders translated labels and repeated PID row actions", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: kill,
          inputs: initialInputs(kill),
          language,
          onChange: () => {},
        }),
      );
      expect(html).toContain(language === "en" ? "Add PID" : "Tambah PID");
      expect(html).toContain(language === "en" ? "Process IDs" : "ID proses");
      expect(html).toContain(
        language === "en"
          ? "Request graceful termination"
          : "Minta penghentian secara tertib",
      );
    }
  });
  it("shows all top shortcuts in a bilingual semantic reference table", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(KeyboardShortcuts, {
          shortcuts: top.shortcuts,
          language,
        }),
      );
      expect(html).toContain("<table");
      expect(html).toContain('scope="col"');
      expect(html).toContain(top.shortcuts!.items[0]!.description[language]);
      expect(html).toContain(
        language === "en"
          ? "privileges may be needed"
          : "hak istimewa mungkin diperlukan",
      );
      expect(html).not.toContain("onkeydown");
    }
  });
  it("reuses a collapsed bilingual concepts panel without inventing process data", () => {
    for (const language of ["en", "id"] as const) {
      const html = renderToStaticMarkup(
        createElement(LearningConcepts, { concepts: ps.concepts, language }),
      );
      expect(html).toContain("<details");
      expect(html).not.toContain("<details open");
      expect(html).toContain(
        language === "en" ? "Key concepts" : "Konsep utama",
      );
      expect(html).toContain(
        language === "en" ? "Common process states" : "Keadaan proses umum",
      );
      expect(html).toContain("Z: zombie");
      expect(html).toContain("%1");
      expect(html).not.toContain("<input");
    }
    expect(
      renderToStaticMarkup(
        createElement(LearningConcepts, {
          concepts: undefined,
          language: "en",
        }),
      ),
    ).toBe("");
  });
  it("disables signal copy/pin actions until targets are supplied", () => {
    for (const definition of [kill, pkill]) {
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
      expect(html).toContain("Key concepts");
    }
  });
  it("renders job choices and the process category in both languages", () => {
    for (const language of ["en", "id"] as const) {
      const form = renderToStaticMarkup(
        createElement(CommandForm, {
          definition: jobs,
          inputs: initialInputs(jobs),
          language,
          onChange: () => {},
        }),
      );
      expect(form).toContain('id="choice-display"');
      expect(form).toContain('id="choice-state"');
      expect(form).toContain('placeholder="%1"');
      const sidebar = renderToStaticMarkup(
        createElement(Sidebar, {
          language,
          view: "all",
          category: "processes",
          favoriteCount: 0,
          pinCount: 0,
          mobileOpen: true,
          onNavigate: () => {},
        }),
      );
      expect(sidebar).toContain(
        language === "en" ? "Process Management" : "Manajemen Proses",
      );
    }
  });
});
