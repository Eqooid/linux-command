import type {
  CommandDefinition,
  CommandInputs,
  Language,
} from "../commands/types";
import { isInputVisible } from "../commands/validation";
import { localize, translate } from "../i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  NumericPermissionEditor,
  SymbolicPermissionEditor,
} from "./PermissionEditors";

const argumentEditors = {
  "numeric-permissions": NumericPermissionEditor,
  "symbolic-permissions": SymbolicPermissionEditor,
};

interface FormProps {
  definition: CommandDefinition;
  inputs: CommandInputs;
  language: Language;
  onChange: (inputs: CommandInputs) => void;
}

export function CommandForm({ definition, ...props }: FormProps) {
  if (
    !definition.options.length &&
    !definition.arguments.length &&
    !definition.choices?.length
  )
    return (
      <p className="text-sm text-muted-foreground">
        {translate("noOptions", props.language)}
      </p>
    );
  if (definition.form.kind !== "grouped")
    return <CommandFields definition={definition} {...props} />;
  return (
    <div className="space-y-6">
      {definition.form.groups.map((group) => {
        const content = (
          <div className="space-y-5">
            {group.fields.map((id) => {
              const choice = definition.choices?.find(
                (field) => field.id === id,
              );
              const option = definition.options.find(
                (field) => !field.choice && field.id === id,
              );
              const argument = definition.arguments.find(
                (field) => field.id === id,
              );
              const field = choice ?? option ?? argument;
              if (!field || !isInputVisible(field.when, props.inputs))
                return null;
              const fields = {
                ...definition,
                choices: choice ? [choice] : [],
                options: option ? [option] : [],
                arguments: argument ? [argument] : [],
              };
              return <CommandFields key={id} definition={fields} {...props} />;
            })}
          </div>
        );
        return group.advanced ? (
          <details key={group.id} className="rounded-lg border p-4">
            <summary className="cursor-pointer text-sm font-medium">
              {localize(group.title, props.language)}
            </summary>
            <div className="mt-4">{content}</div>
          </details>
        ) : (
          <fieldset key={group.id} className="min-w-0 space-y-4">
            <legend className="mb-3 text-sm font-semibold">
              {localize(group.title, props.language)}
            </legend>
            {content}
          </fieldset>
        );
      })}
    </div>
  );
}

function CommandFields({ definition, inputs, language, onChange }: FormProps) {
  return (
    <div className="space-y-5">
      {(definition.choices ?? [])
        .filter((choice) => isInputVisible(choice.when, inputs))
        .map((choice) => (
          <div key={choice.id} className="space-y-2">
            <label
              htmlFor={`choice-${choice.id}`}
              className="text-sm font-medium"
            >
              {localize(choice.label, language)}
            </label>
            <select
              id={`choice-${choice.id}`}
              value={String(inputs[choice.id])}
              aria-describedby={`hint-${choice.id}`}
              onChange={(event) =>
                onChange({ ...inputs, [choice.id]: event.target.value })
              }
              className="h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              {choice.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {localize(item.label, language)}
                </option>
              ))}
            </select>
            <p
              id={`hint-${choice.id}`}
              className="text-xs leading-relaxed text-muted-foreground"
            >
              {localize(choice.description, language)}
            </p>
          </div>
        ))}
      {definition.options
        .filter(
          (option) => !option.choice && isInputVisible(option.when, inputs),
        )
        .map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
          >
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-foreground"
              checked={inputs[option.id] === true}
              onChange={(event) =>
                onChange({ ...inputs, [option.id]: event.target.checked })
              }
            />
            <span>
              <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {localize(option.label, language)}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {option.flag}
                </code>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {localize(option.description, language)}
              </span>
            </span>
          </label>
        ))}
      {definition.arguments
        .filter((argument) => isInputVisible(argument.when, inputs))
        .map((argument) => {
          if (argument.editor) {
            const Editor = argumentEditors[argument.editor];
            return (
              <fieldset key={argument.id} className="min-w-0 space-y-3">
                <legend className="mb-2 text-sm font-medium">
                  {localize(argument.label, language)}
                </legend>
                <Editor
                  value={inputs[argument.id]!}
                  language={language}
                  onChange={(value) =>
                    onChange({ ...inputs, [argument.id]: value })
                  }
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {localize(argument.description, language)}
                </p>
              </fieldset>
            );
          }
          const raw = inputs[argument.id];
          const values = Array.isArray(raw)
            ? raw
            : [typeof raw === "string" ? raw : ""];
          return (
            <fieldset key={argument.id} className="min-w-0 space-y-2">
              <legend className="mb-2 text-sm font-medium">
                {localize(argument.label, language)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {translate(
                    argument.required ? "required" : "optional",
                    language,
                  )}
                </span>
              </legend>
              {values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <label
                    htmlFor={`argument-${argument.id}-${index}`}
                    className="sr-only"
                  >
                    {localize(argument.label, language)}
                    {argument.multiple ? ` ${index + 1}` : ""}
                  </label>
                  <Input
                    id={`argument-${argument.id}-${index}`}
                    value={value}
                    placeholder={argument.placeholder}
                    required={argument.required}
                    aria-describedby={`hint-${argument.id}`}
                    onChange={(event) => {
                      const nextValues = values.map((previous, position) =>
                        position === index ? event.target.value : previous,
                      );
                      onChange({
                        ...inputs,
                        [argument.id]: argument.multiple
                          ? nextValues
                          : event.target.value,
                      });
                    }}
                  />
                  {argument.multiple && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={values.length === 1}
                      aria-label={`${argument.removeLabel ? localize(argument.removeLabel, language) : translate("removePath", language)} ${index + 1}`}
                      onClick={() =>
                        onChange({
                          ...inputs,
                          [argument.id]: values.filter(
                            (_value, position) => position !== index,
                          ),
                        })
                      }
                    >
                      −
                    </Button>
                  )}
                </div>
              ))}
              {argument.multiple && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onChange({ ...inputs, [argument.id]: [...values, ""] })
                  }
                >
                  {argument.addLabel
                    ? localize(argument.addLabel, language)
                    : translate("addPath", language)}
                </Button>
              )}
              <p
                id={`hint-${argument.id}`}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {localize(argument.description, language)}
              </p>
            </fieldset>
          );
        })}
    </div>
  );
}
