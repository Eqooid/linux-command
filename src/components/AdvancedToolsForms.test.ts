import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { chgrp, htop } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import type {
  CommandDefinition,
  CommandInputs,
  Language,
} from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";

function form(
  definition: CommandDefinition,
  inputs: CommandInputs = {},
  language: Language = "en",
) {
  return renderToStaticMarkup(
    createElement(CommandForm, {
      definition,
      inputs: { ...initialInputs(definition), ...inputs },
      language,
      onChange: () => {},
    }),
  );
}
describe("T11 forms", () => {
  it("switches group and reference fields without displaying both", () => {
    const direct = form(chgrp);
    expect(direct).toContain('id="argument-group-0"');
    expect(direct).not.toContain('id="argument-reference-0"');
    const reference = form(chgrp, { mode: "reference" });
    expect(reference).toContain('id="argument-reference-0"');
    expect(reference).not.toContain('id="argument-group-0"');
    expect(reference).toContain('id="argument-paths-0"');
    expect(reference).toContain('id="choice-reporting"');
    expect((direct.match(/type="checkbox"/g) ?? []).length).toBe(2);
  });
  it("uses one comma-separated PID input and compatible username controls", () => {
    const html = form(htop);
    expect(html).toContain('id="argument-pids-0"');
    expect(html).not.toContain('id="argument-pids-1"');
    expect(html).toContain('id="argument-username-0"');
    expect(html).toContain('id="choice-sort"');
    expect(html).toContain("tenths of a second");
    expect(html).not.toContain("Do not combine with a PID filter");
    expect(html).toContain("PERCENT_CPU");
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(2);
  });
  it.each(["en", "id"] as const)(
    "renders bilingual inputs and repeated paths in %s",
    (language) => {
      const html = form(
        chgrp,
        { mode: "reference", paths: ["a", "b"] },
        language,
      );
      expect(html).toContain(
        language === "en" ? "Reference file path" : "Jalur berkas referensi",
      );
      expect(html).toContain(language === "en" ? "Add path" : "Tambah jalur");
      expect(html).toContain('id="argument-paths-1"');
      expect(form(htop, {}, language)).toContain(
        language === "en" ? "Read-only mode" : "Mode hanya-baca",
      );
    },
  );
  it("keeps chgrp actions disabled until configured and permits default htop generation", () => {
    for (const definition of [chgrp, htop]) {
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
      expect(html.includes('disabled=""')).toBe(definition === chgrp);
      expect(html).toContain("Command comparison");
      if (definition === htop) {
        expect(html).toContain("<table");
        expect(html).toContain("F9");
        expect(html).toContain("not command-line options");
        expect(html).toContain("sudo apt install htop");
      }
      expect(html).not.toContain('type="password"');
    }
  });
});
