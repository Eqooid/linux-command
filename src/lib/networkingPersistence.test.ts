import { describe, expect, it } from "vitest";
import { curl, hostname, ip, ping, ss } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { toggleFavorite, togglePin } from "./savedCommands";
import { defaultState, loadState, saveState, type StorageAdapter } from "./storage";

describe("T12 persistence compatibility", () => {
  it("preserves old pins and saves all five new command IDs and exact text", () => {
    const old = {id:"old",commandId:"htop",text:"htop -t",createdAt:"2026-11-10T00:00:00Z"};
    let raw = JSON.stringify({...defaultState(),language:"en",theme:"dark",favorites:["htop"],pins:[old]});
    const storage: StorageAdapter = {getItem:()=>raw,setItem:(_key,value)=>{raw=value}};
    let state = loadState(storage);
    const cases = [
      [ip,{operation:"route"}], [ping,{target:"example.com",count:"4"}],
      [ss,{summary:true}], [hostname,{mode:"local"}], [curl,{url:"https://example.com"}],
    ] as const;
    for (const [definition,changes] of cases) {
      const result = generateCommand(definition,{...initialInputs(definition),...changes});
      expect(result.errors).toEqual([]);
      const pin = {id:definition.id,commandId:definition.id,text:result.command!,createdAt:"2026-11-11T00:00:00Z"};
      state = {...state,favorites:toggleFavorite(state.favorites,definition.id),pins:togglePin(state.pins,pin)};
      expect(saveState(state,storage)).toBe(true);
      expect(loadState(storage)).toEqual(state);
    }
    expect(state.pins[0]).toEqual(old);
    expect(state.favorites).toEqual(["htop","ip","ping","ss","hostname","curl"]);
    expect(state.version).toBe(1);
    expect(state.language).toBe("en");
    expect(state.theme).toBe("dark");
  });
});
