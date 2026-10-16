import type { BilingualText, Language } from "../commands/types";
import {
  isOctalPermission,
  numericPermissionRows,
  parseSymbolicClause,
  permissionBits,
  serializeSymbolicClause,
  togglePermission,
  type SymbolicClause,
} from "../commands/permissions";
import { localize } from "../i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const permissionText = {
  owner: { en: "Owner", id: "Pemilik" },
  group: { en: "Group", id: "Grup" },
  others: { en: "Others", id: "Lainnya" },
  all: { en: "All", id: "Semua" },
  read: { en: "Read", id: "Baca" },
  write: { en: "Write", id: "Tulis" },
  execute: { en: "Execute / search", id: "Eksekusi / penelusuran" },
  numeric: { en: "Three-digit octal mode", id: "Mode oktal tiga digit" },
  arithmetic: {
    en: "Add enabled bits in each class: read 4 + write 2 + execute 1. Directory execute means traversal/search, not administrator privilege.",
    id: "Jumlahkan bit aktif setiap kelas: baca 4 + tulis 2 + eksekusi 1. Eksekusi direktori berarti penelusuran/pencarian, bukan hak administrator.",
  },
  invalid: {
    en: "Enter exactly three digits from 0 to 7 to edit checkboxes. Special bits are not supported.",
    id: "Masukkan tepat tiga digit dari 0 sampai 7 untuk mengedit kotak centang. Bit khusus tidak didukung.",
  },
  visualization: { en: "Permission visualization", id: "Visualisasi izin" },
  letters: { en: "Permissions", id: "Izin" },
  value: { en: "Octal value", id: "Nilai oktal" },
  clause: { en: "Clause", id: "Klausa" },
  who: { en: "Permission class", id: "Kelas izin" },
  operator: { en: "Operation", id: "Operasi" },
  add: { en: "Add (+)", id: "Tambah (+)" },
  remove: { en: "Remove (-)", id: "Hapus (-)" },
  assign: { en: "Assign (=)", id: "Tetapkan (=)" },
  addClause: { en: "Add clause", id: "Tambah klausa" },
  removeClause: { en: "Remove clause", id: "Hapus klausa" },
  symbolicHint: {
    en: "Clauses apply in row order. Add/remove needs a permission; = may be empty to clear a class. This describes a requested change, not actual file permissions.",
    id: "Klausa diterapkan sesuai urutan baris. Tambah/hapus memerlukan izin; = boleh kosong untuk mengosongkan kelas. Ini menjelaskan perubahan yang diminta, bukan izin file sebenarnya.",
  },
} satisfies Record<string, BilingualText>;

const groups = [
  permissionText.owner,
  permissionText.group,
  permissionText.others,
];
const bitLabels = [
  permissionText.read,
  permissionText.write,
  permissionText.execute,
];
export interface PermissionEditorProps {
  value: string | boolean | string[];
  language: Language;
  onChange: (value: string | string[]) => void;
}

export function PermissionVisualization({
  mode,
  language,
}: {
  mode: string;
  language: Language;
}) {
  const rows = numericPermissionRows(mode);
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg border p-3" aria-live="polite">
      <table className="w-full text-left text-xs">
        <caption className="mb-3 text-left text-sm font-medium">
          {localize(permissionText.visualization, language)}:{" "}
          <code>{mode}</code>{" "}
          <code>{rows.map((row) => row.letters).join("")}</code>
        </caption>
        <thead>
          <tr>
            <th scope="col">{localize(permissionText.who, language)}</th>
            <th scope="col">{localize(permissionText.letters, language)}</th>
            <th scope="col">{localize(permissionText.value, language)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <th scope="row" className="py-2 font-normal">
                {localize(groups[index]!, language)}
              </th>
              <td className="font-mono">{row.letters}</td>
              <td className="font-mono">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NumericPermissionEditor({
  value,
  language,
  onChange,
}: PermissionEditorProps) {
  const mode = typeof value === "string" ? value : "";
  const valid = isOctalPermission(mode);
  return (
    <div className="space-y-4">
      <label
        htmlFor="argument-numeric-0"
        className="block space-y-2 text-sm font-medium"
      >
        <span>{localize(permissionText.numeric, language)}</span>
        <Input
          id="argument-numeric-0"
          value={mode}
          inputMode="numeric"
          aria-invalid={!valid}
          aria-describedby="permission-arithmetic"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <p
        id="permission-arithmetic"
        className="text-xs leading-relaxed text-muted-foreground"
      >
        {localize(
          valid ? permissionText.arithmetic : permissionText.invalid,
          language,
        )}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {groups.map((group, index) => (
          <fieldset className="min-w-0 rounded-lg border p-3" key={index}>
            <legend className="px-1 text-sm font-medium">
              {localize(group, language)}
            </legend>
            <div className="space-y-2">
              {permissionBits.map((bit, position) => (
                <label
                  key={bit.letter}
                  className="flex items-start gap-2 text-xs"
                >
                  <input
                    type="checkbox"
                    id={`permission-${index}-${bit.letter}`}
                    className="mt-0.5 size-4 shrink-0 accent-foreground"
                    checked={valid && (Number(mode[index]) & bit.value) !== 0}
                    disabled={!valid}
                    onChange={() =>
                      onChange(togglePermission(mode, index, bit.value))
                    }
                  />
                  <span>
                    {localize(bitLabels[position]!, language)}{" "}
                    <code>
                      {bit.letter}={bit.value}
                    </code>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <PermissionVisualization mode={mode} language={language} />
    </div>
  );
}

export function SymbolicPermissionEditor({
  value,
  language,
  onChange,
}: PermissionEditorProps) {
  const clauses = Array.isArray(value) ? value : [];
  function update(index: number, clause: SymbolicClause) {
    onChange(
      clauses.map((previous, position) =>
        position === index ? serializeSymbolicClause(clause) : previous,
      ),
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        {localize(permissionText.symbolicHint, language)}
      </p>
      {clauses.map((value, index) => {
        const clause = parseSymbolicClause(value, true) ?? {
          who: "u",
          operator: "+",
          permissions: "",
        };
        return (
          <fieldset
            key={index}
            className="min-w-0 space-y-3 rounded-lg border p-3"
          >
            <legend className="px-1 text-sm">
              {localize(permissionText.clause, language)} {index + 1}:{" "}
              <code>{value}</code>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className="space-y-1 text-xs"
                htmlFor={`clause-who-${index}`}
              >
                <span>{localize(permissionText.who, language)}</span>
                <select
                  id={`clause-who-${index}`}
                  className="h-10 w-full rounded-md border bg-card px-2"
                  value={clause.who}
                  onChange={(event) =>
                    update(index, {
                      ...clause,
                      who: event.target.value as SymbolicClause["who"],
                    })
                  }
                >
                  {(["u", "g", "o", "a"] as const).map((who, position) => (
                    <option key={who} value={who}>
                      {who} —{" "}
                      {localize(
                        [...groups, permissionText.all][position]!,
                        language,
                      )}
                    </option>
                  ))}
                </select>
              </label>
              <label
                className="space-y-1 text-xs"
                htmlFor={`clause-operation-${index}`}
              >
                <span>{localize(permissionText.operator, language)}</span>
                <select
                  id={`clause-operation-${index}`}
                  className="h-10 w-full rounded-md border bg-card px-2"
                  value={clause.operator}
                  onChange={(event) =>
                    update(index, {
                      ...clause,
                      operator: event.target
                        .value as SymbolicClause["operator"],
                    })
                  }
                >
                  {(["+", "-", "="] as const).map((operator, position) => (
                    <option key={operator} value={operator}>
                      {localize(
                        [
                          permissionText.add,
                          permissionText.remove,
                          permissionText.assign,
                        ][position]!,
                        language,
                      )}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-4">
              {permissionBits.map((bit, position) => (
                <label
                  className="flex items-center gap-2 text-xs"
                  key={bit.letter}
                >
                  <input
                    type="checkbox"
                    id={`clause-${index}-${bit.letter}`}
                    className="size-4 accent-foreground"
                    checked={clause.permissions.includes(bit.letter)}
                    onChange={(event) =>
                      update(index, {
                        ...clause,
                        permissions: event.target.checked
                          ? clause.permissions + bit.letter
                          : clause.permissions.replace(bit.letter, ""),
                      })
                    }
                  />
                  {localize(bitLabels[position]!, language)}{" "}
                  <code>{bit.letter}</code>
                </label>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={clauses.length === 1}
              onClick={() =>
                onChange(
                  clauses.filter((_clause, position) => position !== index),
                )
              }
              aria-label={`${localize(permissionText.removeClause, language)} ${index + 1}`}
            >
              {localize(permissionText.removeClause, language)}
            </Button>
          </fieldset>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange([...clauses, "u+x"])}
      >
        {localize(permissionText.addClause, language)}
      </Button>
    </div>
  );
}
