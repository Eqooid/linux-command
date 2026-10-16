import type {
  CommandDefinition,
  CommandInputs,
  GenerationResult,
} from "./types";
import {
  quoteInteractiveFileArgument,
  quotePathArgument,
  quoteShellArgument,
} from "./arguments";
import { isInputVisible, validateInputs } from "./validation";
import { buildFindCommand } from "./search";
import { buildSudo, buildSu } from "./privileges";
import { ownershipSpec } from "./ownership";
import { permissionMode } from "./permissions";
export { quoteShellArgument } from "./arguments";
export { validateInputs } from "./validation";

export function initialInputs(definition: CommandDefinition): CommandInputs {
  return Object.fromEntries([
    ...definition.options
      .filter((option) => !option.choice)
      .map((option) => [option.id, false]),
    ...definition.arguments.map((argument) => [
      argument.id,
      argument.multiple
        ? [argument.defaultValue ?? ""]
        : (argument.defaultValue ?? ""),
    ]),
    ...(definition.choices ?? []).map((choice) => [
      choice.id,
      choice.defaultValue,
    ]),
  ]);
}

function selectedFlags(
  definition: CommandDefinition,
  inputs: CommandInputs,
  excluded: string[] = [],
): string[] {
  return definition.options
    .filter(
      (option) =>
        !excluded.includes(option.id) &&
        isInputVisible(option.when, inputs) &&
        (option.choice
          ? inputs[option.choice.field] === option.choice.value
          : inputs[option.id] === true),
    )
    .map((option) => option.flag);
}

type Builder = (definition: CommandDefinition, inputs: CommandInputs) => string;
// cp and mv share the same source... destination operand shape.
const buildTransfer: Builder = (definition, inputs) =>
  [
    definition.name,
    ...selectedFlags(definition, inputs),
    "--",
    ...(inputs.sources as string[]).map(quotePathArgument),
    quotePathArgument(inputs.destination as string),
  ].join(" ");
const navigationPresets: Record<string, string | undefined> = {
  default: "cd",
  home: "cd ~",
  parent: "cd ..",
  previous: "cd -",
  root: "cd /",
};
const builders: Record<string, Builder | undefined> = {
  sudo: (_definition, inputs) => buildSudo(inputs),
  su: (_definition, inputs) => buildSu(inputs),
  chmod: (definition, inputs) =>
    [
      "chmod",
      ...selectedFlags(definition, inputs),
      "--",
      quoteShellArgument(permissionMode(inputs)),
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" "),
  chown: (definition, inputs) =>
    [
      "chown",
      ...selectedFlags(definition, inputs, ["conditional"]),
      ...(inputs.conditional
        ? [
            "--from=" +
              quoteShellArgument(
                ownershipSpec(
                  inputs.fromOwner as string,
                  inputs.fromGroup as string,
                ),
              ),
          ]
        : []),
      "--",
      quoteShellArgument(
        ownershipSpec(inputs.owner as string, inputs.group as string),
      ),
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" "),
  man: (definition, inputs) =>
    [
      "man",
      ...selectedFlags(definition, inputs),
      ...(inputs.section !== "default" ? ["-s", inputs.section as string] : []),
      "--",
      quoteShellArgument(inputs.topic as string),
    ].join(" "),
  whoami: () => "whoami",
  id: (definition, inputs) =>
    [
      "id",
      ...selectedFlags(definition, inputs),
      ...(inputs.username
        ? ["--", quoteShellArgument(inputs.username as string)]
        : []),
    ].join(" "),
  groups: (_definition, inputs) => {
    const names = (inputs.usernames as string[]).filter(Boolean);
    return [
      "groups",
      ...(names.length ? ["--", ...names.map(quoteShellArgument)] : []),
    ].join(" ");
  },
  find: (_definition, inputs) => buildFindCommand(inputs),
  grep: (definition, inputs) =>
    [
      "grep",
      ...selectedFlags(definition, inputs),
      "-e",
      quoteShellArgument(inputs.pattern as string),
      "--",
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" "),
  cat: (definition, inputs) =>
    [
      "cat",
      ...selectedFlags(definition, inputs),
      "--",
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" "),
  less: (definition, inputs) =>
    [
      "less",
      ...selectedFlags(definition, inputs),
      "--",
      quoteInteractiveFileArgument(inputs.path as string),
    ].join(" "),
  nano: (definition, inputs) =>
    [
      "nano",
      ...selectedFlags(definition, inputs),
      ...(inputs.path
        ? ["--", quoteInteractiveFileArgument(inputs.path as string)]
        : []),
    ].join(" "),
  cp: buildTransfer,
  mv: buildTransfer,
  rm: (definition, inputs) =>
    [
      "rm",
      ...selectedFlags(definition, inputs),
      "--",
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" "),
  pwd: (definition, inputs) =>
    ["pwd", ...selectedFlags(definition, inputs)].join(" "),
  ls: (definition, inputs) =>
    [
      "ls",
      ...selectedFlags(definition, inputs),
      ...(inputs.path ? ["--", quotePathArgument(inputs.path as string)] : []),
    ].join(" "),
  cd: (_definition, inputs) => {
    if (inputs.destination === "custom")
      return "cd -- " + quotePathArgument(inputs.path as string);
    if (inputs.destination === "homePath")
      return "cd -- ~/" + quoteShellArgument(inputs.homePath as string);
    return navigationPresets[inputs.destination as string]!;
  },
  mkdir: (definition, inputs) =>
    [
      "mkdir",
      ...selectedFlags(definition, inputs, ["setMode"]),
      ...(inputs.setMode ? ["-m", inputs.permissions as string] : []),
      "--",
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" "),
  touch: (definition, inputs) => {
    const source =
      inputs.source === "reference"
        ? ["-r", quotePathArgument(inputs.reference as string)]
        : inputs.source === "timestamp"
          ? ["-t", inputs.timestamp as string]
          : [];
    return [
      "touch",
      ...selectedFlags(definition, inputs, [
        "referenceSource",
        "explicitSource",
      ]),
      ...source,
      "--",
      ...(inputs.paths as string[]).map(quotePathArgument),
    ].join(" ");
  },
};

export function generateCommand(
  definition: CommandDefinition,
  inputs: CommandInputs,
): GenerationResult {
  const errors = validateInputs(definition, inputs);
  const builder = Object.hasOwn(builders, definition.id)
    ? builders[definition.id]
    : undefined;
  if (!builder)
    errors.push({
      en: "A builder is not implemented for this command.",
      id: "Pembuat perintah ini belum diimplementasikan.",
    });
  if (errors.length || !builder) return { command: null, errors };
  const command = builder(definition, inputs);
  if (command.length > 10000)
    return {
      command: null,
      errors: [
        {
          en: "The command is too long (maximum 10,000 characters).",
          id: "Perintah terlalu panjang (maksimum 10.000 karakter).",
        },
      ],
    };
  return { command, errors: [] };
}
