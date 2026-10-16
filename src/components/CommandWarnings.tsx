import { AlertTriangle } from "lucide-react";
import type { Language } from "../commands/types";
import type { CommandWarning } from "../commands/warnings";
import { localize, translate } from "../i18n";
import { cn } from "../lib/utils";

export function CommandWarnings({
  warnings,
  language,
}: {
  warnings: CommandWarning[];
  language: Language;
}) {
  if (!warnings.length) return null;
  return (
    <section
      aria-live="polite"
      className="space-y-3"
      aria-label={translate("warnings", language)}
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="size-4" aria-hidden="true" />
        {translate("warnings", language)}
      </h3>
      {warnings.map((warning, index) => (
        <p
          key={index}
          data-warning-level={warning.level}
          className={cn(
            "rounded-xl border bg-card p-4 text-sm leading-relaxed",
            warning.level === "note" && "text-muted-foreground",
            warning.level === "warning" && "border-foreground/50",
            warning.level === "danger" &&
              "border-2 border-foreground bg-muted font-semibold",
          )}
        >
          {localize(warning.text, language)}
        </p>
      ))}
    </section>
  );
}
