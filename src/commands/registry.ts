import {
  cat,
  cd,
  cp,
  find,
  grep,
  man,
  whoami,
  id,
  groups,
  sudo,
  su,
  chmod,
  chown,
  ps,
  top,
  kill,
  pkill,
  jobs,
  less,
  ls,
  mkdir,
  mv,
  nano,
  pwd,
  rm,
  touch,
} from "./definitions";
import type { CategoryId, CommandDefinition } from "./types";

export const categories: CategoryId[] = [
  "navigation",
  "files",
  "reading",
  "searching",
  "help",
  "permissions",
  "processes",
  "system",
  "pipes",
];

export function validateRegistry(
  definitions: readonly CommandDefinition[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const command of definitions) {
    if (ids.has(command.id)) errors.push(`Duplicate command: ${command.id}`);
    ids.add(command.id);
    if (
      !/^[a-z][a-z0-9-]*$/.test(command.id) ||
      !/^[a-z][a-z0-9-]*$/.test(command.name) ||
      !command.syntax.trim()
    )
      errors.push(`Missing or invalid identity/syntax: ${command.id}`);
    if (!categories.includes(command.category))
      errors.push(`Unknown category: ${command.id}`);
    const texts = [
      command.description,
      command.explanation,
      ...command.warnings,
      ...(command.concepts ?? []).flatMap((concept) => [
        concept.term,
        concept.description,
      ]),
      ...(command.form.kind === "grouped"
        ? command.form.groups.map((group) => group.title)
        : []),
      ...(command.shortcuts
        ? [
            command.shortcuts.description,
            ...command.shortcuts.items.map((item) => item.description),
          ]
        : []),
      ...command.options.flatMap((option) => [
        option.label,
        option.description,
      ]),
      ...command.arguments.flatMap((argument) => [
        argument.label,
        argument.description,
        ...(argument.addLabel ? [argument.addLabel] : []),
        ...(argument.removeLabel ? [argument.removeLabel] : []),
      ]),
      ...command.examples.map((example) => example.description),
      ...(command.choices ?? []).flatMap((choice) => [
        choice.label,
        choice.description,
        ...choice.items.map((item) => item.label),
      ]),
    ];
    if (texts.some((text) => !text.en.trim() || !text.id.trim()))
      errors.push(`Missing translation: ${command.id}`);
    if (
      command.concepts &&
      (!command.concepts.length ||
        new Set(command.concepts.map((concept) => concept.term.en)).size !==
          command.concepts.length)
    )
      errors.push(`Invalid concepts: ${command.id}`);
    const fieldIds = [
      ...command.options,
      ...command.arguments,
      ...(command.choices ?? []),
    ].map((field) => field.id);
    if (
      new Set(fieldIds).size !== fieldIds.length ||
      fieldIds.some((id) => !id.trim())
    )
      errors.push(`Invalid field identifiers: ${command.id}`);
    for (const argument of command.arguments) {
      if (
        argument.editor &&
        (!["numeric-permissions", "symbolic-permissions"].includes(
          argument.editor,
        ) ||
          (argument.editor === "numeric-permissions" && argument.multiple) ||
          (argument.editor === "symbolic-permissions" && !argument.multiple))
      )
        errors.push(`Invalid argument editor: ${command.id}/${argument.id}`);
    }
    if (
      command.options.some(
        (option) => !/^(?:--?[a-zA-Z0-9][a-zA-Z0-9-]*|\+G)$/.test(option.flag),
      )
    )
      errors.push(`Invalid flag: ${command.id}`);
    if (
      !command.examples.length ||
      command.examples.some((example) => !example.command.trim())
    )
      errors.push(`Missing examples: ${command.id}`);
    for (const choice of command.choices ?? []) {
      if (
        !choice.items.length ||
        !choice.items.some((item) => item.value === choice.defaultValue) ||
        new Set(choice.items.map((item) => item.value)).size !==
          choice.items.length
      )
        errors.push(`Invalid choice: ${command.id}/${choice.id}`);
    }
    if (
      command.shortcuts &&
      (!command.shortcuts.items.length ||
        command.shortcuts.items.some((item) => !item.keys.trim()) ||
        new Set(command.shortcuts.items.map((item) => item.keys)).size !==
          command.shortcuts.items.length)
    )
      errors.push(`Invalid shortcuts: ${command.id}`);
    for (const option of command.options) {
      const selectedChoice = option.choice;
      if (
        selectedChoice &&
        !command.choices?.some(
          (choice) =>
            choice.id === selectedChoice.field &&
            choice.items.some((item) => item.value === selectedChoice.value),
        )
      )
        errors.push(`Invalid option choice: ${command.id}/${option.id}`);
    }
    for (const argument of [
      ...command.arguments,
      ...command.options,
      ...(command.choices ?? []),
    ]) {
      const condition = argument.when;
      if (!condition) continue;
      const validOption = command.options.some(
        (option) =>
          !option.choice &&
          option.id === condition.field &&
          typeof condition.value === "boolean",
      );
      const validChoice = command.choices?.some(
        (choice) =>
          choice.id === condition.field &&
          choice.items.some((item) => item.value === condition.value),
      );
      if (!validOption && !validChoice)
        errors.push(`Invalid input condition: ${command.id}/${argument.id}`);
    }
    if (command.form.kind === "grouped") {
      const visibleFields = [
        ...command.options.filter((option) => !option.choice),
        ...command.arguments,
        ...(command.choices ?? []),
      ].map((field) => field.id);
      const groupedFields = command.form.groups.flatMap(
        (group) => group.fields,
      );
      if (
        !command.form.groups.length ||
        command.form.groups.some(
          (group) => !group.id.trim() || !group.fields.length,
        ) ||
        new Set(command.form.groups.map((group) => group.id)).size !==
          command.form.groups.length ||
        new Set(groupedFields).size !== groupedFields.length ||
        groupedFields.length !== visibleFields.length ||
        groupedFields.some((id) => !visibleFields.includes(id))
      )
        errors.push(`Invalid form groups: ${command.id}`);
    }
  }
  return errors;
}

export const commands: readonly CommandDefinition[] = [
  pwd,
  ls,
  cd,
  mkdir,
  touch,
  cp,
  mv,
  rm,
  cat,
  less,
  nano,
  find,
  grep,
  man,
  whoami,
  id,
  groups,
  sudo,
  su,
  chmod,
  chown,
  ps,
  top,
  kill,
  pkill,
  jobs,
];
const registryErrors = validateRegistry(commands);
if (registryErrors.length) throw new Error(registryErrors.join("\n"));

export function getCommand(id: string): CommandDefinition | undefined {
  return commands.find((command) => command.id === id);
}
