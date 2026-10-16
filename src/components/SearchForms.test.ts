import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { find, grep } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import { CommandForm } from "./CommandForm";

describe("grouped search forms", () => {
  it("places each enabled filter toggle before its numeric controls", () => {
    const html = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: find,
        language: "en",
        inputs: { ...initialInputs(find), useSize: true },
        onChange: () => {},
      }),
    );
    expect(html.indexOf("Filter by size")).toBeLessThan(
      html.indexOf("Size comparison"),
    );
    expect(html.indexOf("Size comparison")).toBeLessThan(
      html.indexOf("Size value"),
    );
  });
  it("renders translated sections and collapsed advanced controls", () => {
    for (const definition of [find, grep])
      for (const language of ["en", "id"] as const) {
        const html = renderToStaticMarkup(
          createElement(CommandForm, {
            definition,
            language,
            inputs: initialInputs(definition),
            onChange: () => {},
          }),
        );
        expect(html).toContain("<details");
        expect(html).not.toContain("<details open");
        expect(html).toContain(language === "en" ? "Advanced:" : "Lanjutan:");
        if (definition.form.kind !== "grouped")
          throw new Error("Expected grouped form");
        for (const group of definition.form.groups)
          expect(html).toContain(group.title[language]);
      }
  });
  it("shows numeric comparison fields only for enabled filters", () => {
    const basic = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: find,
        language: "en",
        inputs: initialInputs(find),
        onChange: () => {},
      }),
    );
    expect(basic).toContain('value="."');
    expect(basic).not.toContain('id="choice-sizeUnit"');
    const enabled = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: find,
        language: "en",
        inputs: { ...initialInputs(find), useSize: true },
        onChange: () => {},
      }),
    );
    expect(enabled).toContain('id="choice-sizeUnit"');
    expect(enabled).toContain('id="argument-size-0"');
  });
  it("hides irrelevant line numbers and whole-word controls", () => {
    const html = renderToStaticMarkup(
      createElement(CommandForm, {
        definition: grep,
        language: "en",
        inputs: { ...initialInputs(grep), outputMode: "counts", line: true },
        onChange: () => {},
      }),
    );
    expect(html).not.toContain("Show line numbers");
    expect(html).not.toContain("Whole words");
  });
});
