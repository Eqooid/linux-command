import type {
  BilingualText,
  CommandDefinition,
  CommandInputs,
  InputVisibility,
} from "./types";
import { isPermissionMode, isTouchTimestamp } from "./arguments";
import { validateFileManagementInputs } from "./fileManagement";
import { validateSearchInputs } from "./search";
import { validateHelpIdentityInputs } from "./helpIdentity";
import { validatePrivilegeInputs } from "./privileges";
import { validateChgrpInputs, validateOwnershipInputs } from "./ownership";
import { isOctalPermission, parseSymbolicClause } from "./permissions";
import { validateJobControlInputs } from "./jobControl";
import { validateSystemdInputs } from "./systemd";
import { isShellBuilder, validateShellInputs } from "./shellComposition";
import { getStageCommand } from "./shellStageCommands";
import { validateHtopInputs } from "./htop";
import { validateProcessInputs } from "./processes";
import { validateNetworkingInputs } from "./networking";
import { validateRemoteAccessInputs } from "./remoteAccess";
import { validatePackageInputs } from "./packageManagement";

export function isInputVisible(
  condition: InputVisibility | undefined,
  inputs: CommandInputs,
): boolean {
  if (!condition) return true;
  if (Array.isArray(condition))
    return condition.every((item) => isInputVisible(item, inputs));
  const matches = Array.isArray(condition.value)
    ? condition.value.some((value) => inputs[condition.field] === value)
    : inputs[condition.field] === condition.value;
  return condition.not ? !matches : matches;
}

export function validateInputs(
  definition: CommandDefinition,
  inputs: CommandInputs,
): BilingualText[] {
  if (isShellBuilder(definition.id))
    return validateShellInputs(definition.id, inputs, (id, values) =>
      validateInputs(getStageCommand(id)!, values),
    );
  const errors: BilingualText[] = [];
  const expectedFields = [
    ...definition.options.filter(
      (option) => !option.choice && !option.argument,
    ),
    ...definition.arguments,
    ...(definition.choices ?? []),
  ].map((field) => field.id);
  if (Object.keys(inputs).some((key) => !expectedFields.includes(key)))
    errors.push({
      en: "Unexpected fields or conflicting option flags. Use the available choices.",
      id: "Kolom tak dikenal atau flag opsi bertentangan. Gunakan pilihan yang tersedia.",
    });
  for (const option of definition.options.filter(
    (option) => !option.choice && !option.argument,
  )) {
    if (!isInputVisible(option.when, inputs)) continue;
    if (typeof inputs[option.id] !== "boolean")
      errors.push({
        en: "Invalid option value.",
        id: "Nilai opsi tidak valid.",
      });
  }
  for (const choice of definition.choices ?? []) {
    if (!isInputVisible(choice.when, inputs)) continue;
    if (!choice.items.some((item) => item.value === inputs[choice.id]))
      errors.push({
        en: `Select one valid ${choice.label.en.toLowerCase()}.`,
        id: `Pilih satu ${choice.label.id.toLowerCase()} yang valid.`,
      });
  }
  for (const argument of definition.arguments) {
    if (!isInputVisible(argument.when, inputs)) continue;
    const raw = inputs[argument.id];
    if (
      argument.multiple
        ? !Array.isArray(raw) || raw.some((value) => typeof value !== "string")
        : typeof raw !== "string"
    ) {
      errors.push({
        en: "Invalid argument value.",
        id: "Nilai argumen tidak valid.",
      });
      continue;
    }
    const values = Array.isArray(raw) ? raw : [raw as string];
    if (
      argument.required &&
      (!values.length ||
        values.some((value) =>
          argument.allowWhitespace ? value.length === 0 : !value.trim(),
        ))
    ) {
      errors.push({
        en: `${argument.label.en}: fill every path or required field.`,
        id: `${argument.label.id}: isi setiap jalur atau kolom wajib.`,
      });
      continue;
    }
    if (values.some((value) => /[\x00-\x1f\x7f]/.test(value))) {
      errors.push({
        en: "Paths and values must not contain control characters or newlines.",
        id: "Jalur dan nilai tidak boleh mengandung karakter kontrol atau baris baru.",
      });
      continue;
    }
    if (argument.format === "permissions" && !isPermissionMode(values[0]))
      errors.push({
        en: "Permissions must contain 3 or 4 octal digits (0–7).",
        id: "Izin harus berisi 3 atau 4 digit oktal (0–7).",
      });
    if (argument.format === "timestamp" && !isTouchTimestamp(values[0]))
      errors.push({
        en: "Use a valid CCYYMMDDhhmm[.ss] date and time; seconds must be 00–59.",
        id: "Gunakan tanggal dan waktu CCYYMMDDhhmm[.ss] yang valid; detik harus 00–59.",
      });
  }
  if (
    definition.id === "cd" &&
    inputs.destination === "homePath" &&
    typeof inputs.homePath === "string" &&
    inputs.homePath.startsWith("/")
  )
    errors.push({
      en: "The home-relative suffix must not start with /.",
      id: "Bagian akhir jalur relatif terhadap home tidak boleh dimulai dengan /.",
    });
  if (!errors.length)
    errors.push(...validateFileManagementInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateSearchInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateHelpIdentityInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validatePrivilegeInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateProcessInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateJobControlInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateSystemdInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateNetworkingInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validateRemoteAccessInputs(definition.id, inputs));
  if (!errors.length)
    errors.push(...validatePackageInputs(definition.id, inputs));
  if (!errors.length && definition.id === "chgrp")
    errors.push(...validateChgrpInputs(inputs));
  if (!errors.length && definition.id === "htop")
    errors.push(...validateHtopInputs(inputs));
  if (!errors.length && definition.id === "chown")
    errors.push(...validateOwnershipInputs(inputs));
  if (!errors.length && definition.id === "chmod") {
    if (
      inputs.permissionMode === "numeric" &&
      !isOctalPermission(inputs.numeric as string)
    )
      errors.push({
        en: "Use exactly three octal digits (0–7). Special permission bits are not supported by this builder.",
        id: "Gunakan tepat tiga digit oktal (0–7). Bit izin khusus tidak didukung builder ini.",
      });
    if (
      inputs.permissionMode === "symbolic" &&
      (inputs.clauses as string[]).some(
        (clause) => !parseSymbolicClause(clause),
      )
    )
      errors.push({
        en: "Each clause needs u/g/o/a, one operator (+, -, =), and ordered r/w/x permissions. Only = may have no permissions, for example o=.",
        id: "Setiap klausa memerlukan u/g/o/a, satu operator (+, -, =), dan izin r/w/x berurutan. Hanya = yang boleh tanpa izin, misalnya o=.",
      });
  }
  return errors;
}
