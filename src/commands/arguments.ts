// Quoting prevents shell expansion; it does not check whether a path exists.
export function quoteShellArgument(value: string): string {
  return "'" + value.replaceAll("'", "'\"'\"'") + "'";
}

export function quotePathArgument(value: string): string {
  // cd and GNU touch give a lone '-' special meaning even after '--'.
  return quoteShellArgument(value === "-" ? "./-" : value);
}

export function quoteInteractiveFileArgument(value: string): string {
  // nano recognizes +line/search operands independently of shell quoting.
  // The ./ prefix also protects a literal '--' from less's delimiter handling.
  return quotePathArgument(
    value.startsWith("+") || value === "--" ? "./" + value : value,
  );
}

export function isPermissionMode(value: string): boolean {
  return /^[0-7]{3,4}$/.test(value);
}

export function isTouchTimestamp(value: string): boolean {
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.(\d{2}))?$/.exec(
    value,
  );
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText),
    month = Number(monthText),
    day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= days[month - 1]! &&
    Number(hourText) <= 23 &&
    Number(minuteText) <= 59 &&
    Number(secondText ?? "0") <= 59
  );
}
