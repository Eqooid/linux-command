import type { BilingualText, CommandInputs } from "./types";

// This builder accepts common account names, not every NSS/domain naming scheme.
export function isUsername(value: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_.-]*\$?$/.test(value);
}

export function validateHelpIdentityInputs(
  commandId: string,
  inputs: CommandInputs,
): BilingualText[] {
  if (commandId === "man" && /^\d+$/.test(inputs.topic as string))
    return [
      {
        en: "Enter a named topic; choose its section using the section selector. Numeric-only topics are not supported.",
        id: "Masukkan nama topik; pilih bagiannya melalui pemilih bagian. Topik yang hanya berupa angka tidak didukung.",
      },
    ];
  let usernames: string[] = [];
  if (commandId === "id" && inputs.username !== "")
    usernames = [inputs.username as string];
  if (commandId === "groups") {
    const rows = inputs.usernames as string[];
    usernames = rows.length === 1 && rows[0] === "" ? [] : rows;
  }
  if (usernames.some((value) => !isUsername(value)))
    return [
      {
        en: "Use common account names: start with a letter or _, then letters, digits, _, . or -, with an optional final $. Leave only the single default row empty for the current process.",
        id: "Gunakan nama akun umum: awali dengan huruf atau _, lalu huruf, angka, _, . atau -, dengan $ akhir opsional. Kosongkan hanya satu baris bawaan untuk proses saat ini.",
      },
    ];
  return [];
}
