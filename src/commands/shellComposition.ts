import { quoteShellArgument } from "./arguments";
import { isBackgroundExecutable } from "./jobControl";
import { getStageCommand } from "./shellStageCommands";
import type {
  BilingualText,
  CommandInputs,
  CommandStage,
  CommandValues,
  ShellComposition,
} from "./types";

export const shellBuilderNames: Record<string, string | undefined> = {
  pipeline: "command | command",
  "stdout-redirection": "command > file",
  "stdin-redirection": "command < file",
  "stderr-redirection": "command 2> file",
};
export const isShellBuilder = (id: string) =>
  Object.hasOwn(shellBuilderNames, id);

export function initialComposition(id: string): ShellComposition {
  const stage: CommandStage = { kind: "literal", executable: "", args: [] };
  if (id === "pipeline")
    return {
      stages: [stage, { kind: "literal", executable: "", args: [] }],
      redirections: [],
    };
  const operator =
    id === "stdout-redirection" ? ">" : id === "stdin-redirection" ? "<" : "2>";
  return { stages: [stage], redirections: [{ operator, path: "" }] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const exactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));
const stringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
function isStage(value: unknown): value is CommandStage {
  if (!isRecord(value)) return false;
  if (value.kind === "literal")
    return (
      exactKeys(value, ["kind", "executable", "args"]) &&
      typeof value.executable === "string" &&
      stringArray(value.args)
    );
  return (
    value.kind === "registry" &&
    exactKeys(value, ["kind", "commandId", "inputs"]) &&
    typeof value.commandId === "string" &&
    isRecord(value.inputs) &&
    Object.values(value.inputs).every(
      (item) =>
        typeof item === "string" ||
        typeof item === "boolean" ||
        stringArray(item),
    )
  );
}
export function isShellComposition(value: unknown): value is ShellComposition {
  if (
    !isRecord(value) ||
    !exactKeys(value, ["stages", "redirections"]) ||
    !Array.isArray(value.stages) ||
    !value.stages.every(isStage) ||
    !Array.isArray(value.redirections)
  )
    return false;
  return value.redirections.every(
    (item) =>
      isRecord(item) &&
      (item.operator === "2>&1"
        ? exactKeys(item, ["operator"])
        : exactKeys(item, ["operator", "path"]) &&
          [">", ">>", "<", "2>", "2>>"].includes(String(item.operator)) &&
          typeof item.path === "string"),
  );
}

export function validateShellInputs(
  id: string,
  inputs: CommandInputs,
  validateRegistered: (
    commandId: string,
    values: CommandValues,
  ) => BilingualText[],
): BilingualText[] {
  const value = inputs.composition;
  if (Object.keys(inputs).length !== 1 || !isShellComposition(value))
    return [
      {
        en: "Use the structured command controls; raw shell expressions and malformed stages are not accepted.",
        id: "Gunakan kontrol perintah terstruktur; ekspresi shell mentah dan tahap tidak valid tidak diterima.",
      },
    ];
  const errors: BilingualText[] = [];
  if (
    id === "pipeline"
      ? value.stages.length < 2 || value.stages.length > 4
      : value.stages.length !== 1
  )
    errors.push({
      en: "Pipes require 2–4 stages; a redirection builder requires exactly one command.",
      id: "Pipe memerlukan 2–4 tahap; builder redirection memerlukan tepat satu perintah.",
    });
  const operators = value.redirections.map((item) => item.operator).join(" ");
  const validOperators =
    id === "pipeline"
      ? [""]
      : id === "stdout-redirection"
        ? [">", ">>"]
        : id === "stdin-redirection"
          ? ["<"]
          : ["2>", "2>>", "2>&1", "> 2>&1", "2>&1 >", ">> 2>&1", "2>&1 >>"];
  if (!validOperators.includes(operators))
    errors.push({
      en: "This redirection combination is not supported by the selected builder.",
      id: "Kombinasi redirection ini tidak didukung oleh builder terpilih.",
    });
  for (const [index, stage] of value.stages.entries()) {
    const stageErrors: BilingualText[] = [];
    if (stage.kind === "registry") {
      if (!getStageCommand(stage.commandId))
        stageErrors.push({
          en: "Choose a supported catalog stage or use literal executable and arguments.",
          id: "Pilih tahap katalog yang didukung atau gunakan program dan argumen literal.",
        });
      else
        stageErrors.push(...validateRegistered(stage.commandId, stage.inputs));
    } else {
      if (!isBackgroundExecutable(stage.executable))
        stageErrors.push({
          en: "Enter one executable name or explicit absolute/./../ path. Spaces are allowed in paths; no shell operators, variables or substitutions in the executable field.",
          id: "Masukkan satu nama program atau jalur absolut/./../ eksplisit. Spasi boleh di jalur; tanpa operator shell, variabel, atau substitusi pada kolom program.",
        });
      if (
        [stage.executable, ...stage.args].some((token) =>
          /[\x00-\x1f\x7f]/.test(token),
        )
      )
        stageErrors.push({
          en: "Executable and arguments must not contain control characters or newlines.",
          id: "Program dan argumen tidak boleh mengandung karakter kontrol atau baris baru.",
        });
    }
    errors.push(
      ...stageErrors.map((error) => ({
        en: `Stage ${index + 1}: ${error.en}`,
        id: `Tahap ${index + 1}: ${error.id}`,
      })),
    );
  }
  for (const redirection of value.redirections)
    if (
      "path" in redirection &&
      (!redirection.path.trim() || /[\x00-\x1f\x7f]/.test(redirection.path))
    )
      errors.push({
        en: "Every file redirection needs a non-empty literal path without control characters or newlines. File existence and permissions are not checked.",
        id: "Setiap redirection berkas memerlukan jalur literal tidak kosong tanpa karakter kontrol atau baris baru. Keberadaan berkas dan izin tidak diperiksa.",
      });
  return errors;
}

export function serializeComposition(
  value: ShellComposition,
  serializeRegistered: (commandId: string, inputs: CommandValues) => string,
): string {
  const pipeline = value.stages
    .map((stage) =>
      stage.kind === "registry"
        ? serializeRegistered(stage.commandId, stage.inputs)
        : [stage.executable, ...stage.args].map(quoteShellArgument).join(" "),
    )
    .join(" | ");
  // Order is intentional: descriptor duplication captures stdout's destination at this point.
  const suffix = value.redirections
    .map((item) =>
      item.operator === "2>&1"
        ? item.operator
        : `${item.operator} ${quoteShellArgument(item.path)}`,
    )
    .join(" ");
  return pipeline + (suffix ? " " + suffix : "");
}

export function moveStage(
  value: ShellComposition,
  index: number,
  direction: -1 | 1,
): ShellComposition {
  const next = index + direction;
  if (
    index < 0 ||
    index >= value.stages.length ||
    next < 0 ||
    next >= value.stages.length
  )
    return value;
  const stages = [...value.stages];
  [stages[index], stages[next]] = [stages[next]!, stages[index]!];
  return { ...value, stages };
}
