import { quoteShellArgument } from "./arguments";
import type { BilingualText, CommandInputs } from "./types";

const comparisonPrefixes: Record<string, string> = {
  exact: "",
  greater: "+",
  less: "-",
};
const fileTypes: Record<string, string> = { file: "f", directory: "d" };

export function quoteFindStartingPath(path: string): string {
  // find's expression parser does not reliably disambiguate paths with '--'.
  const literalPath = /^[-!()]/.test(path) ? "./" + path : path;
  return quoteShellArgument(literalPath);
}

function isInteger(value: string, minimum: number): boolean {
  return (
    /^\d+$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) >= minimum
  );
}

export function validateSearchInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  if (commandId !== "find") return [];
  const errors: BilingualText[] = [];
  if (inputs.useSize && !isInteger(inputs.size as string, 1))
    errors.push({
      en: "Size must be a positive whole number within the safe integer range.",
      id: "Ukuran harus berupa bilangan bulat positif dalam rentang bilangan bulat aman.",
    });
  if (inputs.useMtime && !isInteger(inputs.mtime as string, 0))
    errors.push({
      en: "Modification age must be a nonnegative whole number of completed 24-hour periods.",
      id: "Usia modifikasi harus berupa bilangan bulat nonnegatif untuk periode 24 jam yang telah selesai.",
    });
  for (const [enabled, field] of [
    ["useMinDepth", "minDepth"],
    ["useMaxDepth", "maxDepth"],
  ]) {
    if (inputs[enabled] && !isInteger(inputs[field] as string, 0))
      errors.push({
        en: "Search depth must be a nonnegative whole number within the safe integer range.",
        id: "Kedalaman pencarian harus berupa bilangan bulat nonnegatif dalam rentang bilangan bulat aman.",
      });
  }
  if (
    !errors.length &&
    inputs.useMinDepth &&
    inputs.useMaxDepth &&
    Number(inputs.minDepth) > Number(inputs.maxDepth)
  )
    errors.push({
      en: "Minimum depth must not exceed maximum depth.",
      id: "Kedalaman minimum tidak boleh melebihi kedalaman maksimum.",
    });
  return errors;
}

// Called only after metadata, types, numeric ranges, and choice values validate.
export function buildFindCommand(inputs: CommandInputs): string {
  const parts = ["find", quoteFindStartingPath(inputs.start as string)];
  if (inputs.useMinDepth) parts.push("-mindepth", inputs.minDepth as string);
  if (inputs.useMaxDepth) parts.push("-maxdepth", inputs.maxDepth as string);
  if (inputs.fileType !== "any")
    parts.push("-type", fileTypes[inputs.fileType as string]);
  if (inputs.namePattern !== "")
    parts.push(
      inputs.nameCase === "insensitive" ? "-iname" : "-name",
      quoteShellArgument(inputs.namePattern as string),
    );
  if (inputs.useSize)
    parts.push(
      "-size",
      comparisonPrefixes[inputs.sizeComparison as string] +
        inputs.size +
        inputs.sizeUnit,
    );
  if (inputs.useMtime)
    parts.push(
      "-mtime",
      comparisonPrefixes[inputs.mtimeComparison as string] + inputs.mtime,
    );
  if (inputs.empty) parts.push("-empty");
  return parts.join(" ");
}
