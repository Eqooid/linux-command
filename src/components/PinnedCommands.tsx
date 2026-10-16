import { Pin, Trash2 } from "lucide-react";
import type { Language } from "../commands/types";
import type { SavedCommand } from "../lib/storage";
import { translate } from "../i18n";
import { Button } from "./ui/button";
import { CopyButton } from "./CopyButton";

export function PinnedCommands({
  pins,
  language,
  onRemove,
}: {
  pins: SavedCommand[];
  language: Language;
  onRemove: (id: string) => void;
}) {
  return (
    <section aria-label={translate("pinned", language)}>
      <h2 className="mb-4 text-lg font-semibold">
        {translate("pinned", language)}
      </h2>
      <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
        {translate("privacy", language)}
      </p>
      {!pins.length && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Pin className="mx-auto mb-3 size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {translate("noPins", language)}
          </p>
        </div>
      )}
      <div className="space-y-4">
        {pins.map((pin) => (
          <div key={pin.id} className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">
                {pin.commandId}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={translate("remove", language)}
                onClick={() => onRemove(pin.id)}
              >
                <Trash2 />
              </Button>
            </div>
            <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
              <code>{pin.text}</code>
            </pre>
            <CopyButton text={pin.text} language={language} />
          </div>
        ))}
      </div>
    </section>
  );
}
