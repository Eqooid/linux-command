import type { CommandDefinition, Language } from "../commands/types";
import { localize, translate } from "../i18n";
import { Card, CardContent } from "./ui/card";

export function CommandComparison({
  rows,
  language,
}: {
  rows: CommandDefinition["comparison"];
  language: Language;
}) {
  if (!rows?.length) return null;
  return (
    <Card className="shadow-none">
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="mb-3 text-left font-semibold">
            {translate("comparison", language)}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pr-4 pb-2">
                {translate("commandLabel", language)}
              </th>
              <th scope="col" className="pb-2">
                {translate("purpose", language)}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.command} className="border-t">
                <th
                  scope="row"
                  className="py-3 pr-4 align-top font-mono font-normal"
                >
                  {row.command}
                </th>
                <td className="py-3 leading-relaxed text-muted-foreground">
                  {localize(row.description, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
