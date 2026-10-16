import { describe, expect, it } from "vitest";
import { localize, translate } from "./i18n";

describe("localization", () => {
  it("selects the requested language", () => {
    expect(localize({ en: "Directory", id: "Direktori" }, "id")).toBe(
      "Direktori",
    );
    expect(translate("copy", "en")).toBe("Copy command");
    expect(translate("copy", "id")).toBe("Salin perintah");
  });
  it("falls back for missing or blank translations", () => {
    expect(localize({ en: "Directory" }, "id")).toBe("Directory");
    expect(localize({ en: "Directory", id: " " }, "id")).toBe("Directory");
    expect(localize({ id: "Direktori" }, "en")).toBe("Direktori");
    expect(localize({}, "id")).toBe("");
  });
});
