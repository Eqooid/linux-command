import { describe, expect, it } from "vitest";
import { curl, hostname, ip, ping, ss } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { containsSensitiveCurlContent, encodeHttpHeader, requiresSensitivePinConsent, splitHttpHeader } from "./networking";
import { validateRegistry } from "./registry";
import type { CommandDefinition, CommandInputs } from "./types";

type TestChanges = Record<string, string | boolean | string[] | undefined>;
function run(definition: CommandDefinition, changes: TestChanges = {}) {
  const present = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)) as CommandInputs;
  return generateCommand(definition, { ...initialInputs(definition), ...present });
}
function command(definition: CommandDefinition, changes: TestChanges = {}) {
  const result = run(definition, changes);
  expect(result.errors).toEqual([]);
  return result.command;
}

describe("T12 networking registry and localization", () => {
  it("registers complete bilingual metadata for all five commands", () => {
    for (const definition of [ip, ping, ss, hostname, curl]) {
      expect(definition.category).toBe("networking");
      expect(validateRegistry([definition])).toEqual([]);
      expect(definition.concepts?.length).toBeGreaterThanOrEqual(10);
      expect(definition.examples.length).toBeGreaterThan(5);
      expect(new Set(definition.examples.map((entry) => entry.command)).size).toBe(definition.examples.length);
    }
  });
});

describe("ip", () => {
  it.each([
    [{}, "ip addr show"],
    [{ operation: "link" }, "ip link show"],
    [{ operation: "route" }, "ip route show"],
    [{ brief: true }, "ip -br addr show"],
    [{ operation: "link", brief: true }, "ip -br link show"],
    [{ family: "4" }, "ip -4 addr show"],
    [{ family: "6" }, "ip -6 addr show"],
    [{ family: "4", operation: "route" }, "ip -4 route show"],
  ] as const)("builds %j", (values, expected) => expect(command(ip, values)).toBe(expected));
  it("filters a literal interface and validates it", () => {
    expect(command(ip, { interfaceEnabled: true, interface: "eth0" })).toBe("ip addr show dev 'eth0'");
    expect(command(ip, { operation: "link", interfaceEnabled: true, interface: "enp3s0" })).toBe("ip link show dev 'enp3s0'");
    expect(run(ip, { interfaceEnabled: true, interface: "" }).command).toBeNull();
    expect(run(ip, { interfaceEnabled: true, interface: "eth0; whoami" }).command).toBeNull();
    expect(command(ip, { operation: "route", brief: true, interfaceEnabled: true, interface: "" })).toBe("ip route show");
  });
});

describe("ping", () => {
  it("builds count, timing, family and quiet options", () => {
    expect(command(ping, { target: "google.com" })).toBe("ping -- 'google.com'");
    expect(command(ping, { target: "8.8.8.8", count: "4" })).toBe("ping -c 4 -- '8.8.8.8'");
    expect(command(ping, { target: "example.com", family: "6", count: "4", interval: "2", replyTimeout: "2.0", deadline: "10", quiet: true })).toBe("ping -6 -c 4 -i 2 -W 2.0 -w 10 -q -- 'example.com'");
    expect(command(ping, { target: "::1", family: "6" })).toBe("ping -6 -- '::1'");
  });
  it.each([
    {target:""}, {target:"example.com; id"}, {target:"999.1.1.1"},
    {target:"example.com",count:"0"}, {target:"example.com",count:"1.2"},
    {target:"example.com",interval:"0.1"}, {target:"example.com",replyTimeout:"-1"},
    {target:"example.com",deadline:"0"}, {target:"example.com",deadline:"1.5"}, {target:"example.com",family:"both"},
  ])("rejects invalid target or numeric input %j", (values) => expect(run(ping, values).command).toBeNull());
});

describe("ss", () => {
  it.each([
    [{}, "ss"],
    [{protocol:"both",state:"listening",numeric:true},"ss -tuln"],
    [{protocol:"both",state:"listening",numeric:true,processes:true},"ss -tulpn"],
    [{protocol:"tcp",state:"all",numeric:true},"ss -tan"],
    [{protocol:"udp",state:"listening",numeric:true},"ss -uln"],
    [{summary:true},"ss -s"],
    [{family:"4",protocol:"tcp",state:"listening",numeric:true},"ss -4 -tln"],
    [{family:"6",protocol:"tcp",state:"listening",numeric:true},"ss -6 -tln"],
  ] as const)("builds %j", (values, expected) => expect(command(ss, values)).toBe(expected));
  it("treats summary as a separate view and rejects invalid choices", () => {
    expect(command(ss, {summary:true,protocol:"both",state:"all",numeric:true})).toBe("ss -s");
    expect(run(ss, {protocol:"invalid"}).command).toBeNull();
    expect(run(ss, {state:"both"}).command).toBeNull();
    expect(run(ss, {family:"46"}).command).toBeNull();
  });
});

describe("hostname", () => {
  it.each([ ["current","hostname"], ["short","hostname -s"], ["fqdn","hostname -f"], ["domain","hostname -d"], ["resolved","hostname -i"], ["local","hostname -I"] ])("builds %s", (mode, expected) => expect(command(hostname, {mode})).toBe(expected));
  it("rejects an unknown operation", () => expect(run(hostname,{mode:"set"}).command).toBeNull());
});

describe("curl", () => {
  it("builds GET, HEAD, method, and response options", () => {
    expect(command(curl, {url:"https://example.com"})).toBe("curl -- 'https://example.com'");
    expect(command(curl, {url:"https://example.com",method:"HEAD"})).toBe("curl -I -- 'https://example.com'");
    expect(command(curl, {url:"https://example.com",method:"DELETE"})).toBe("curl -X DELETE -- 'https://example.com'");
    expect(command(curl, {url:"https://example.com",follow:true,includeHeaders:true,silent:true,showErrors:true,maxTime:"10",output:"My Response.html"})).toBe("curl -L -i -s -S --max-time 10 -o 'My Response.html' -- 'https://example.com'");
  });
  it("serializes headers, JSON bodies, leading @, and URL query metacharacters literally", () => {
    expect(command(curl,{url:"http://localhost:3000/api/items",method:"POST",headers:["Content-Type: application/json"],body:'{"name":"test"}'})).toBe('curl -X POST -H \'Content-Type: application/json\' --data \'{"name":"test"}\' -- \'http://localhost:3000/api/items\'');
    expect(command(curl,{url:"https://example.com/?q=one&x=$HOME",method:"PUT",body:"@secret.txt"})).toBe("curl -X PUT --data-raw '@secret.txt' -- 'https://example.com/?q=one&x=$HOME'");
    expect(command(curl,{url:"https://example.com/?q=a[1]",method:"PATCH",body:"don't",headers:["X-Trace: a;$(id)"]})).toBe("curl -X PATCH -H 'X-Trace: a;$(id)' --data 'don'\"'\"'t' --globoff -- 'https://example.com/?q=a[1]'");
    expect(command(curl,{url:"http://[::1]:3000/"})).toBe("curl --globoff -- 'http://[::1]:3000/'");
    expect(command(curl,{url:"https://example.com",headers:[encodeHttpHeader("X-Trace","a:b")]})).toBe("curl -H 'X-Trace: a:b' -- 'https://example.com'");
    expect(command(curl,{url:"https://example.com",method:"HEAD",body:"old",includeHeaders:true})).toBe("curl -I -- 'https://example.com'");
  });
  it.each([
    {url:""}, {url:"file:///etc/passwd"}, {url:"https://user:pass@example.com"},
    {url:"https://example.com/$(id)"}, {url:"https://example.com/`id`"},
    {url:"example.com"}, {url:"https://example.com",maxTime:"0"},
    {url:"https://example.com",headers:["Bad Name: value"]},
    {url:"https://example.com",headers:["X-Test: okay","bad"]},
    {url:"https://example.com",headers:["X-Test: okay\r\nEvil: yes"]},
  ])("rejects invalid URLs, headers or timeout %j", (values) => expect(run(curl,values).command).toBeNull());
  it("detects content requiring explicit pin consent", () => {
    expect(containsSensitiveCurlContent({...initialInputs(curl),headers:["Authorization: Bearer token"]})).toBe(true);
    expect(containsSensitiveCurlContent({...initialInputs(curl),method:"POST",body:"hello"})).toBe(true);
    expect(containsSensitiveCurlContent({...initialInputs(curl),headers:["Accept: application/json"]})).toBe(true);
    expect(containsSensitiveCurlContent({...initialInputs(curl),url:"https://example.com/?token=123"})).toBe(true);
    const inputs = {...initialInputs(curl), method:"POST",body:"hello"};
    const preview = command(curl,{url:"https://example.com",method:"POST",body:"hello"})!;
    expect(requiresSensitivePinConsent(inputs,preview,[],null)).toBe(true);
    expect(requiresSensitivePinConsent(inputs,preview,[],preview)).toBe(false);
    expect(requiresSensitivePinConsent(inputs,preview,[preview],null)).toBe(false);
    expect(requiresSensitivePinConsent(inputs,preview,[],"different text")).toBe(true);
  });
  it("keeps invalid header-name colons visible for validation", () => {
    const encoded = encodeHttpHeader("Bad:Name","value");
    expect(splitHttpHeader(encoded)).toEqual(["Bad:Name","value"]);
    expect(run(curl,{url:"https://example.com",headers:[encoded]}).command).toBeNull();
    expect(run(curl,{url:"https://example.com",headers:[encodeHttpHeader("X-Test","ok\r\nInjected: yes")]}).command).toBeNull();
  });
});
