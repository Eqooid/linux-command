import type { CommandDefinition, Language } from "../commands/types";
import { localize, translate } from "../i18n";
import { Card, CardContent } from "./ui/card";

export function LearningConcepts({
  concepts,
  language,
}: {
  concepts: CommandDefinition["concepts"];
  language: Language;
}) {
  if (!concepts?.length) return null;
  return (
    <Card className="shadow-none">
      <CardContent>
        <details>
          <summary className="cursor-pointer text-sm font-semibold">
            {translate("concepts", language)}
          </summary>
          <dl className="mt-4 space-y-4">
            {concepts.map((concept) => (
              <div key={concept.term.en}>
                <dt className="text-sm font-medium">
                  {localize(concept.term, language)}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {localize(concept.description, language)}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </CardContent>
    </Card>
  );
}
