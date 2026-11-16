import { lsblkColumns } from "../commands/monitoring";

export function LsblkColumnsEditor({ value, onChange }: {
  value: string | boolean | string[];
  onChange: (value: string[]) => void;
}) {
  const selected = Array.isArray(value) ? value : [];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {lsblkColumns.map((column) => (
        <label key={column} className="flex items-center gap-2 rounded-md border p-3 font-mono text-xs">
          <input type="checkbox" className="size-4 accent-foreground" checked={selected.includes(column)}
            onChange={(event) => onChange(event.target.checked ? [...selected, column] : selected.filter((entry) => entry !== column))} />
          {column}
        </label>
      ))}
    </div>
  );
}
