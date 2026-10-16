import { useState } from "react";
import { generateHelpCommand, helpTargets } from "../commands/help";
import type { Language } from "../commands/types";
import { localize, translate } from "../i18n";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { CopyButton } from "./CopyButton";

export const helpContent = {
  title: { en: "Command help (--help)", id: "Bantuan perintah (--help)" },
  target: { en: "Help target", id: "Target bantuan" },
  custom: { en: "Custom executable name", id: "Nama program khusus" },
  hint: {
    en: "Choose a known GNU/Linux help target or enter one executable name. A help target can be listed here even when its full builder is not implemented. --help is an option, not an executable.",
    id: "Pilih target bantuan GNU/Linux yang dikenal atau masukkan satu nama program. Target dapat tercantum di sini meskipun builder lengkapnya belum diimplementasikan. --help adalah opsi, bukan program.",
  },
  compatibility: {
    en: "--help support depends on the installed program; custom targets are not verified. Aliases or shell functions may change which program a name invokes. This tool never runs the command or retrieves help output.",
    id: "Dukungan --help bergantung pada program terpasang; target khusus tidak diverifikasi. Alias atau fungsi shell dapat mengubah program yang dipanggil suatu nama. Alat ini tidak menjalankan perintah atau mengambil keluaran bantuan.",
  },
  interfaces: [
    {
      syntax: "man command",
      description: {
        en: "Read an installed manual page, often more detailed than short help.",
        id: "Baca halaman manual terpasang, sering kali lebih rinci daripada bantuan singkat.",
      },
    },
    {
      syntax: "command --help",
      description: {
        en: "Ask that program for help when this option is supported.",
        id: "Minta bantuan program tersebut jika opsi ini didukung.",
      },
    },
    {
      syntax: "help command",
      description: {
        en: "Bash's builtin help, useful for cd and other shell builtins; other shells differ.",
        id: "Bantuan builtin Bash, berguna untuk cd dan builtin lain; shell lain dapat berbeda.",
      },
    },
    {
      syntax: "command -h",
      description: {
        en: "Program-specific: it may mean help, human-readable sizes (ls), or something else. Check documentation.",
        id: "Khusus program: dapat berarti bantuan, ukuran mudah dibaca (ls), atau hal lain. Periksa dokumentasi.",
      },
    },
  ],
};

export function HelpUtility({ language }: { language: Language }) {
  const [target, setTarget] = useState("ls");
  const [custom, setCustom] = useState("");
  const result = generateHelpCommand(target, custom);
  return (
    <Card
      className="mb-8 min-w-0 shadow-none"
      aria-label={localize(helpContent.title, language)}
    >
      <CardHeader>
        <h2 className="font-semibold">
          {localize(helpContent.title, language)}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {localize(helpContent.hint, language)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          className="block space-y-2 text-sm font-medium"
          htmlFor="help-target"
        >
          <span>{localize(helpContent.target, language)}</span>
          <select
            id="help-target"
            className="h-10 w-full rounded-md border bg-card px-3 text-sm"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            {helpTargets.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="custom">
              {localize(helpContent.custom, language)}
            </option>
          </select>
        </label>
        {target === "custom" && (
          <div className="space-y-2">
            <label htmlFor="help-custom" className="text-sm font-medium">
              {localize(helpContent.custom, language)}
            </label>
            <Input
              id="help-custom"
              value={custom}
              placeholder="my-tool"
              onChange={(event) => setCustom(event.target.value)}
            />
          </div>
        )}
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
          <code>{result.command ?? translate("invalid", language)}</code>
        </pre>
        {result.errors.length > 0 && (
          <ul aria-live="polite" className="text-sm">
            {result.errors.map((error, index) => (
              <li key={index}>{localize(error, language)}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {translate("previewHint", language)}
          </p>
          <CopyButton
            key={result.command ?? "invalid"}
            text={result.command}
            language={language}
          />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {localize(helpContent.compatibility, language)}
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {helpContent.interfaces.map((item) => (
            <div key={item.syntax} className="rounded-lg border p-3">
              <dt className="font-mono text-sm">{item.syntax}</dt>
              <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {localize(item.description, language)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
