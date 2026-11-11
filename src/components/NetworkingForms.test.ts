import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { curl, hostname, ip, ping, ss } from "../commands/definitions";
import { initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs, Language } from "../commands/types";
import { CommandForm } from "./CommandForm";
import { CommandWorkspace } from "./CommandWorkspace";

function form(definition: CommandDefinition, changes: CommandInputs = {}, language: Language = "en") {
  return renderToStaticMarkup(createElement(CommandForm, {definition,inputs:{...initialInputs(definition),...changes},language,onChange:()=>{}}));
}

describe("T12 forms", () => {
  it("shows conditional ip, ss and curl fields", () => {
    expect(form(ip)).not.toContain('id="argument-interface-0"');
    expect(form(ip,{interfaceEnabled:true})).toContain('id="argument-interface-0"');
    expect(form(ip,{operation:"route",interfaceEnabled:true})).not.toContain('id="argument-interface-0"');
    expect(form(ss,{summary:true})).not.toContain('id="choice-protocol"');
    expect(form(ss,{summary:false})).toContain('id="choice-protocol"');
    expect(form(curl)).not.toContain('id="argument-body-0"');
    expect(form(curl,{method:"POST"})).toContain('id="argument-body-0"');
    expect(form(curl,{method:"HEAD"})).not.toContain('id="argument-body-0"');
  });
  it("renders labeled paired header inputs and bilingual guidance", () => {
    const en = form(curl,{headers:["Accept: application/json","X-Trace: a:b"]});
    expect(en).toContain("Header name 1");
    expect(en).toContain("Header value 2");
    expect(en).toContain('value="X-Trace"');
    expect(en).toContain('value="a:b"');
    expect(en).toContain("Add header");
    const id = form(curl,{},"id");
    expect(id).toContain("Nama header 1");
    expect(id).toContain("Tambah header");
  });
  it("renders all five workspaces in both languages", () => {
    for (const definition of [ip,ping,ss,hostname,curl]) for (const language of ["en","id"] as const) {
      const html = renderToStaticMarkup(createElement(CommandWorkspace,{definition,language,favorite:false,pinnedTexts:[],onFavorite:()=>{},onPin:()=>{}}));
      expect(html).toContain(definition.name);
      expect(html).toContain(language === "id" ? "Dasar Jaringan" : "Networking Fundamentals");
      expect(html).toContain(language === "id" ? "Salin perintah" : "Copy command");
      expect(html).toContain(language === "id" ? "Konsep utama" : "Key concepts");
    }
    expect(form(ping)).toContain('id="argument-target-0"');
    expect(form(hostname)).toContain('id="choice-mode"');
  });
});
