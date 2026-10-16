import type { CommandDefinition, Language } from "../commands/types";
import { localize, translate } from "../i18n";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

export function KeyboardShortcuts({
  shortcuts,
  language,
}: {
  shortcuts: CommandDefinition["shortcuts"];
  language: Language;
}) {
  if (!shortcuts) return null;
  return (
    <Card className="gap-4 shadow-none">
      <CardHeader>
        <h3 className="text-sm font-semibold">
          {translate("shortcuts", language)}
        </h3>
        <CardDescription className="leading-relaxed">
          {localize(shortcuts.description, language)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">
            {translate("shortcuts", language)}
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="w-1/3 py-3 pr-3 font-medium sm:w-40">
                {translate("shortcutKey", language)}
              </th>
              <th scope="col" className="py-3 font-medium">
                {translate("shortcutAction", language)}
              </th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.items.map((shortcut) => (
              <tr key={shortcut.keys} className="border-b last:border-0">
                <td className="py-3 pr-3 align-top">
                  <kbd className="inline-block max-w-full break-words rounded border bg-muted px-1.5 py-1 font-mono text-xs">
                    {shortcut.keys}
                  </kbd>
                </td>
                <td className="break-words py-3 align-top leading-relaxed text-muted-foreground">
                  {localize(shortcut.description, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
