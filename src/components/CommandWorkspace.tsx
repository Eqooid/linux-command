import { useState } from "react";
import { BookOpen, Pin, Star, Terminal } from "lucide-react";
import type { CommandDefinition, Language } from "../commands/types";
import { generateCommand, initialInputs } from "../commands/generation";
import { localize, translate } from "../i18n";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { CommandForm } from "./CommandForm";
import { Badge } from "./ui/badge";
import { CopyButton } from "./CopyButton";
import { CommandWarnings } from "./CommandWarnings";
import { getCommandWarnings } from "../commands/warnings";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

interface WorkspaceProps {
  definition: CommandDefinition;
  language: Language;
  favorite: boolean;
  pinnedTexts: string[];
  onFavorite: () => void;
  onPin: (text: string) => void;
}
export function CommandWorkspace({
  definition,
  language,
  favorite,
  pinnedTexts,
  onFavorite,
  onPin,
}: WorkspaceProps) {
  const [inputs, setInputs] = useState(() => initialInputs(definition));
  const result = generateCommand(definition, inputs);
  const isPinned =
    result.command !== null && pinnedTexts.includes(result.command);
  return (
    <article className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="font-mono text-3xl font-semibold tracking-tight">
              {definition.name}
            </h2>
            <Badge variant="secondary">
              {translate(definition.category, language)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {localize(definition.description, language)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Star className={favorite ? "fill-current" : ""} />
          {translate(favorite ? "unfavorite" : "favorite", language)}
        </Button>
      </div>
      <Card className="gap-4 shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">
              {translate("configure", language)}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputs(initialInputs(definition))}
            >
              {translate("reset", language)}
            </Button>
          </div>
          <CardDescription>
            {translate("configureHint", language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommandForm
            definition={definition}
            inputs={inputs}
            language={language}
            onChange={setInputs}
          />
        </CardContent>
      </Card>
      <CommandWarnings
        warnings={getCommandWarnings(definition, inputs)}
        language={language}
      />
      <section
        className="overflow-hidden rounded-xl border"
        aria-label={translate("preview", language)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-5 py-3">
          <h3 className="text-sm font-medium">
            {translate("preview", language)}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            disabled={!result.command}
            aria-pressed={isPinned}
            onClick={() => result.command && onPin(result.command)}
          >
            <Pin className={isPinned ? "fill-current" : ""} />
            {translate(isPinned ? "unpin" : "pin", language)}
          </Button>
        </div>
        <div className="bg-[#09090B] p-5 text-[#FAFAFA]">
          {result.command ? (
            <pre className="overflow-x-auto pb-2 text-sm leading-relaxed">
              <span
                className="mr-3 select-none text-[#A1A1AA]"
                aria-hidden="true"
              >
                $
              </span>
              <code>{result.command}</code>
            </pre>
          ) : (
            <p className="text-sm text-[#A1A1AA]">
              {translate("invalid", language)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {translate("previewHint", language)}
          </p>
          <CopyButton
            key={result.command ?? "invalid"}
            text={result.command}
            language={language}
          />
        </div>
        {!!result.errors.length && (
          <ul
            aria-live="polite"
            className="space-y-1 bg-card px-5 pb-4 text-sm"
          >
            {result.errors.map((error, index) => (
              <li key={index}>{localize(error, language)}</li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {translate("privacy", language)}
      </p>
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4" />
          {translate("explain", language)}
        </h3>
        <p className="text-sm leading-7 text-muted-foreground">
          {localize(definition.explanation, language)}
        </p>
      </section>
      <KeyboardShortcuts shortcuts={definition.shortcuts} language={language} />
      <section className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">
          {translate("syntax", language)}
        </h3>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
          <code>{definition.syntax}</code>
        </pre>
        {[
          ...definition.options.map((option) => ({
            syntax: option.flag,
            description: option.description,
          })),
          ...definition.arguments.map((argument) => ({
            syntax: argument.id,
            description: argument.description,
          })),
        ].map((parameter) => (
          <div
            key={parameter.syntax}
            className="mt-3 flex items-start gap-3 text-xs"
          >
            <code className="w-24 shrink-0 break-words pt-0.5">
              {parameter.syntax}
            </code>
            <p className="leading-relaxed text-muted-foreground">
              {localize(parameter.description, language)}
            </p>
          </div>
        ))}
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold">
          {translate("examples", language)}
        </h3>
        <div className="space-y-3">
          {definition.examples.map((example) => (
            <div
              key={example.command}
              className="rounded-lg border bg-card p-4"
            >
              <pre className="overflow-x-auto text-sm">
                <code>{example.command}</code>
              </pre>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {localize(example.description, language)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

export function EmptyWorkspace({ language }: { language: Language }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <Terminal className="mb-4 size-8 text-muted-foreground" />
      <h2 className="font-medium">{translate("select", language)}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {translate("selectHint", language)}
      </p>
    </div>
  );
}
