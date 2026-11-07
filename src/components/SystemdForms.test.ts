import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { systemctl, journalctl } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { changingActions, unitActions } from "../commands/systemd";
import type {
  CommandDefinition,
  CommandInputs,
  Language,
} from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";
import { CommandComparison } from "./CommandComparison";
import { Sidebar } from "./Sidebar";

function form(
  definition: CommandDefinition,
  inputs: CommandInputs = {},
  language: Language = "en",
): string {
  return renderToStaticMarkup(
    createElement(CommandForm, {
      definition,
      inputs: { ...initialInputs(definition), ...inputs },
      language,
      onChange: () => {},
    }),
  );
}

describe("systemd forms", () => {
  it.each([...unitActions, "list-units", "list-unit-files", "daemon-reload"])(
    "shows only relevant fields for systemctl %s",
    (action) => {
      const html = form(systemctl, { action });
      expect(html.includes('id="argument-unit-0"')).toBe(
        unitActions.includes(action),
      );
      expect(html.includes("Also start or stop now")).toBe(
        ["enable", "disable"].includes(action),
      );
      expect(html.includes("Include inactive loaded units")).toBe(
        action === "list-units",
      );
      expect(html.includes("Explicitly prepend sudo")).toBe(
        changingActions.includes(action),
      );
      expect(html.includes('id="choice-unitType"')).toBe(
        action !== "daemon-reload",
      );
      expect(html.includes("Unit and action options")).toBe(
        action !== "daemon-reload",
      );
    },
  );
  it("hides sudo and its empty group in user-manager mode", () => {
    const html = form(systemctl, {
      action: "restart",
      scope: "user",
      sudo: true,
    });
    expect(html).not.toContain("Explicitly prepend sudo");
    expect(html).not.toContain("Optional privileges");
    expect(html).toContain('id="argument-unit-0"');
  });
  it("renders argument options as explanatory metadata, never independent controls", () => {
    const html = form(journalctl);
    expect(html).toContain('id="argument-unit-0"');
    expect(html).toContain('id="argument-count-0"');
    expect(html.match(/type="checkbox"/g) ?? []).toHaveLength(3);
    expect(html).not.toContain('id="argument-bootOffset-0"');
    expect(html).not.toContain('id="argument-since-0"');
    expect(html).not.toContain('id="argument-until-0"');
    expect(html).toContain("<details");
    expect(html).not.toContain("<details open");
  });
  it("shows custom boot and time fields only with their selected modes", () => {
    const html = form(journalctl, {
      boot: "custom",
      sinceMode: "absolute",
      untilMode: "relative",
    });
    expect(html).toContain('id="argument-bootOffset-0"');
    expect(html).toContain('id="argument-since-0"');
    expect(html).toContain('id="argument-until-0"');
    expect(html).toContain("YYYY-MM-DD HH:mm:ss");
    expect(html).toContain("target Linux machine");
  });
  it.each(["en", "id"] as const)(
    "renders translated labels and learning references in %s",
    (language) => {
      expect(form(systemctl, { action: "restart" }, language)).toContain(
        language === "en" ? "Manager scope" : "Cakupan pengelola",
      );
      expect(form(journalctl, {}, language)).toContain(
        language === "en" ? "Journal scope" : "Cakupan jurnal",
      );
      const table = renderToStaticMarkup(
        createElement(CommandComparison, {
          rows: systemctl.comparison,
          language,
        }),
      );
      expect(table).toContain("<table");
      expect(table).toContain("systemctl restart");
      expect(table).toContain(
        language === "en" ? "Inspect unit state" : "Periksa keadaan unit",
      );
      const nav = renderToStaticMarkup(
        createElement(Sidebar, {
          language,
          view: "all",
          category: "services",
          favoriteCount: 0,
          pinCount: 0,
          mobileOpen: true,
          onNavigate: () => {},
        }),
      );
      expect(nav).toContain(
        language === "en"
          ? "Linux Services &amp; Logs"
          : "Layanan &amp; Log Linux",
      );
    },
  );
  it("disables empty systemctl preview actions while default journal output is available", () => {
    for (const definition of [systemctl, journalctl]) {
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
      expect(html.includes('disabled=""')).toBe(definition === systemctl);
      expect(html).toContain("Active versus enabled");
      expect(html).toContain("Manual troubleshooting steps");
      expect(html).not.toContain('<input type="password"');
    }
  });
});
