import { ArrowDown, ArrowRight, ArrowUp, Plus, Trash2 } from "lucide-react";
import type {
  CommandInputs,
  CommandStage,
  CommandValues,
  Language,
  ShellComposition,
} from "../commands/types";
import { initialInputs } from "../commands/generation";
import {
  getStageCommand,
  shellStageCommands,
} from "../commands/shellStageCommands";
import { moveStage } from "../commands/shellComposition";
import { localize } from "../i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CommandForm } from "./CommandForm";
import { shellText } from "./shellText";
import { ShellRedirectionEditor } from "./ShellRedirectionEditor";

const selectClass =
  "min-h-10 w-full rounded-md border bg-card px-3 py-2 text-sm";
const emptyStage = (): CommandStage => ({
  kind: "literal",
  executable: "",
  args: [],
});
function commandValues(inputs: CommandInputs): CommandValues {
  const values: CommandValues = {};
  for (const [key, value] of Object.entries(inputs))
    if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      Array.isArray(value)
    )
      values[key] = value;
  return values;
}

export function ShellCompositionForm({
  id,
  value,
  language,
  onChange,
}: {
  id: string;
  value: ShellComposition;
  language: Language;
  onChange: (value: ShellComposition) => void;
}) {
  const t = (key: keyof typeof shellText) => localize(shellText[key], language);
  function updateStage(index: number, stage: CommandStage) {
    onChange({
      ...value,
      stages: value.stages.map((previous, position) =>
        position === index ? stage : previous,
      ),
    });
  }
  return (
    <div className="space-y-6">
      {value.stages.map((stage, index) => {
        const prefix = `shell-stage-${index}-`;
        const definition =
          stage.kind === "registry"
            ? getStageCommand(stage.commandId)
            : undefined;
        return (
          <fieldset
            key={index}
            className="min-w-0 space-y-4 rounded-lg border p-4"
          >
            <legend className="px-1 text-sm font-semibold">
              {t("stage")} {index + 1}
            </legend>
            {id === "pipeline" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  aria-label={`${t("up")} ${index + 1}`}
                  onClick={() => onChange(moveStage(value, index, -1))}
                >
                  <ArrowUp />
                  {t("up")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === value.stages.length - 1}
                  aria-label={`${t("down")} ${index + 1}`}
                  onClick={() => onChange(moveStage(value, index, 1))}
                >
                  <ArrowDown />
                  {t("down")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={value.stages.length <= 2}
                  aria-label={`${t("removeStage")} ${index + 1}`}
                  onClick={() =>
                    onChange({
                      ...value,
                      stages: value.stages.filter(
                        (_stage, position) => position !== index,
                      ),
                    })
                  }
                >
                  <Trash2 />
                  {t("removeStage")}
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor={`${prefix}source`}
              >
                {t("source")}
              </label>
              <select
                className={selectClass}
                id={`${prefix}source`}
                value={stage.kind === "literal" ? "literal" : stage.commandId}
                onChange={(event) => {
                  const selected = getStageCommand(event.target.value);
                  updateStage(
                    index,
                    selected
                      ? {
                          kind: "registry",
                          commandId: selected.id,
                          inputs: commandValues(initialInputs(selected)),
                        }
                      : emptyStage(),
                  );
                }}
              >
                <option value="literal">{t("literal")}</option>
                {shellStageCommands.map((command) => (
                  <option key={command.id} value={command.id}>
                    {command.name}
                  </option>
                ))}
              </select>
            </div>
            {stage.kind === "registry" && definition ? (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("catalogHint")}
                </p>
                <CommandForm
                  definition={definition}
                  inputs={stage.inputs}
                  language={language}
                  idPrefix={prefix}
                  onChange={(inputs) =>
                    updateStage(index, {
                      ...stage,
                      inputs: commandValues(inputs),
                    })
                  }
                />
              </div>
            ) : (
              stage.kind === "literal" && (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor={`${prefix}executable`}
                      className="text-sm font-medium"
                    >
                      {t("executable")}
                    </label>
                    <Input
                      id={`${prefix}executable`}
                      value={stage.executable}
                      placeholder={index === 0 ? "ps" : "grep"}
                      aria-describedby={`${prefix}executable-hint`}
                      onChange={(event) =>
                        updateStage(index, {
                          ...stage,
                          executable: event.target.value,
                        })
                      }
                    />
                    <p
                      id={`${prefix}executable-hint`}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      {t("executableHint")}
                    </p>
                  </div>
                  <fieldset className="min-w-0 space-y-2">
                    <legend className="mb-2 text-sm font-medium">
                      {t("arguments")}
                    </legend>
                    {stage.args.map((argument, position) => (
                      <div key={position} className="flex gap-2">
                        <label
                          className="sr-only"
                          htmlFor={`${prefix}argument-${position}`}
                        >
                          {t("arguments")} {position + 1}
                        </label>
                        <Input
                          id={`${prefix}argument-${position}`}
                          value={argument}
                          aria-describedby={`${prefix}arguments-hint`}
                          onChange={(event) =>
                            updateStage(index, {
                              ...stage,
                              args: stage.args.map((previous, at) =>
                                at === position ? event.target.value : previous,
                              ),
                            })
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`${t("removeArgument")} ${position + 1}`}
                          onClick={() =>
                            updateStage(index, {
                              ...stage,
                              args: stage.args.filter(
                                (_arg, at) => at !== position,
                              ),
                            })
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStage(index, {
                          ...stage,
                          args: [...stage.args, ""],
                        })
                      }
                    >
                      <Plus />
                      {t("addArgument")}
                    </Button>
                    <p
                      id={`${prefix}arguments-hint`}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      {t("argumentsHint")}
                    </p>
                  </fieldset>
                </>
              )
            )}
          </fieldset>
        );
      })}
      {id === "pipeline" ? (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={value.stages.length >= 4}
            onClick={() =>
              onChange({ ...value, stages: [...value.stages, emptyStage()] })
            }
          >
            <Plus />
            {t("addStage")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("limit")}</p>
          <figure className="space-y-3 rounded-lg border p-4">
            <figcaption className="text-sm font-medium">{t("flow")}</figcaption>
            <ol className="flex flex-wrap items-center gap-2 text-xs">
              {(
                ["commandA", "stdout", "pipe", "stdin", "commandB"] as const
              ).map((key, index) => (
                <li key={key} className="flex items-center gap-2">
                  {index > 0 && (
                    <ArrowRight aria-hidden="true" className="size-3" />
                  )}
                  <span className="rounded border px-2 py-1">{t(key)}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("flowHint")}
            </p>
          </figure>
        </>
      ) : (
        <ShellRedirectionEditor
          id={id}
          value={value}
          language={language}
          onChange={onChange}
        />
      )}
    </div>
  );
}
