export const permissionBits = [
  { letter: "r", value: 4 },
  { letter: "w", value: 2 },
  { letter: "x", value: 1 },
] as const;

export function isOctalPermission(value: string): boolean {
  return /^[0-7]{3}$/.test(value);
}

export function permissionLetters(value: number): string {
  return permissionBits
    .map((bit) => (value & bit.value ? bit.letter : "-"))
    .join("");
}

export function numericPermissionRows(mode: string) {
  if (!isOctalPermission(mode)) return [];
  return [...mode].map((digit) => ({
    value: Number(digit),
    letters: permissionLetters(Number(digit)),
  }));
}

export function togglePermission(
  mode: string,
  group: number,
  bit: number,
): string {
  if (
    !isOctalPermission(mode) ||
    ![0, 1, 2].includes(group) ||
    ![4, 2, 1].includes(bit)
  )
    return mode;
  return [...mode]
    .map((digit, index) =>
      index === group ? String(Number(digit) ^ bit) : digit,
    )
    .join("");
}

export interface SymbolicClause {
  who: "u" | "g" | "o" | "a";
  operator: "+" | "-" | "=";
  permissions: string;
}

export function parseSymbolicClause(
  value: string,
  allowIncomplete = false,
): SymbolicClause | null {
  const match = /^([ugoa])([+\-=])(r?w?x?)$/.exec(value);
  if (!match || (!allowIncomplete && match[2] !== "=" && !match[3]))
    return null;
  return {
    who: match[1] as SymbolicClause["who"],
    operator: match[2] as SymbolicClause["operator"],
    permissions: match[3]!,
  };
}

export function serializeSymbolicClause(clause: SymbolicClause): string {
  const permissions = permissionBits
    .filter((bit) => clause.permissions.includes(bit.letter))
    .map((bit) => bit.letter)
    .join("");
  return clause.who + clause.operator + permissions;
}

export function permissionMode(
  inputs: Record<string, string | boolean | string[]>,
): string {
  return inputs.permissionMode === "symbolic"
    ? (inputs.clauses as string[]).join(",")
    : (inputs.numeric as string);
}

// A symbolic change describes an operation, not the unknown resulting file mode.
export function grantsWorldWrite(mode: string, symbolic: boolean): boolean {
  if (!symbolic) return isOctalPermission(mode) && (Number(mode[2]) & 2) !== 0;
  return mode.split(",").some((value) => {
    const clause = parseSymbolicClause(value);
    return (
      clause &&
      ["o", "a"].includes(clause.who) &&
      clause.operator !== "-" &&
      clause.permissions.includes("w")
    );
  });
}
