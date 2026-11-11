import type { BilingualText, CommandArgument, CommandChoice, CommandOption } from "../types";

export const bi = (en: string, id: string): BilingualText => ({ en, id });

export function item(value: string, en: string, id: string) {
  return { value, label: bi(en, id) };
}

export function choice(
  id: string, en: string, indonesian: string, hintEn: string, hintId: string,
  defaultValue: string, items: ReturnType<typeof item>[],
): CommandChoice {
  return { id, label: bi(en, indonesian), description: bi(hintEn, hintId), defaultValue, items };
}

export function arg(
  id: string, en: string, indonesian: string, hintEn: string, hintId: string,
  placeholder: string, required: boolean, extra: Partial<CommandArgument> = {},
): CommandArgument {
  return { id, label: bi(en, indonesian), description: bi(hintEn, hintId), placeholder, required, ...extra };
}

export function opt(
  id: string, flag: string, en: string, indonesian: string, hintEn: string, hintId: string,
  extra: Partial<CommandOption> = {},
): CommandOption {
  return { id, flag, label: bi(en, indonesian), description: bi(hintEn, hintId), ...extra };
}

export function group(id: string, en: string, indonesian: string, fields: string[]) {
  return { id, title: bi(en, indonesian), fields };
}

export function example(command: string, en: string, id: string) {
  return { command, description: bi(en, id) };
}
