import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { translate } from "../i18n";
import type { Language } from "../commands/types";

export function CopyButton({
  text,
  language,
}: {
  text: string | null;
  language: Language;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={copy} size="sm" disabled={!text}>
        {status === "copied" ? <Check /> : <Copy />}
        {translate(status === "copied" ? "copied" : "copy", language)}
      </Button>
      <span role="status" className="text-xs text-muted-foreground">
        {status === "failed"
          ? translate("copyFailed", language)
          : status === "copied"
            ? translate("copied", language)
            : ""}
      </span>
    </div>
  );
}
