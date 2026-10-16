import { isUsername } from "./helpIdentity";
import type { BilingualText, CommandInputs } from "./types";

export function ownershipSpec(owner: string, group: string): string {
  return group ? `${owner}:${group}` : owner;
}

export function validateOwnershipInputs(
  inputs: CommandInputs,
): BilingualText[] {
  const pairs = [[inputs.owner, inputs.group]];
  if (inputs.conditional) pairs.push([inputs.fromOwner, inputs.fromGroup]);
  for (const [owner, group] of pairs) {
    // GNU's legacy owner.group fallback can reinterpret an unknown dotted owner.
    if (!group && typeof owner === "string" && owner.includes("."))
      return [
        {
          en: "Owner-only names containing a dot are not supported: GNU chown may interpret an unknown dotted name as legacy owner.group syntax. The same restriction applies to --from.",
          id: "Nama pemilik saja yang mengandung titik tidak didukung: GNU chown dapat menafsirkan nama bertitik yang tidak dikenal sebagai sintaks lama owner.group. Pembatasan yang sama berlaku pada --from.",
        },
      ];
    if (
      (!owner && !group) ||
      (owner && !isUsername(owner as string)) ||
      (group && !isUsername(group as string))
    )
      return [
        {
          en: "Provide at least one valid owner or group in each enabled ownership pair. Use common names, not colons, numeric IDs, or shell expressions.",
          id: "Isi setidaknya satu pemilik atau grup valid pada setiap pasangan kepemilikan aktif. Gunakan nama umum, bukan titik dua, ID angka, atau ekspresi shell.",
        },
      ];
  }
  return [];
}
