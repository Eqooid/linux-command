import type { Language } from "../commands/types";
import { encodeHttpHeader, splitHttpHeader } from "../commands/networking";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  value: string | boolean | string[];
  language: Language;
  onChange: (value: string[]) => void;
}

export function HttpHeadersEditor({ value, language, onChange }: Props) {
  const headers = Array.isArray(value) ? value : [""];
  const update = (index: number, name: string, headerValue: string) =>
    onChange(headers.map((header, position) =>
      position === index ? encodeHttpHeader(name, headerValue) : header,
    ));
  return <div className="space-y-3">
    {headers.map((header, index) => {
      const [name, headerValue] = splitHttpHeader(header);
      return <div key={index} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
        <label className="min-w-32 flex-1 space-y-1 text-xs">
          <span>{language === "id" ? "Nama header" : "Header name"} {index + 1}</span>
          <Input value={name} placeholder="Accept" onChange={(event) => update(index, event.target.value, headerValue)} />
        </label>
        <label className="min-w-40 flex-[2] space-y-1 text-xs">
          <span>{language === "id" ? "Nilai header" : "Header value"} {index + 1}</span>
          <Input value={headerValue} placeholder="application/json" onChange={(event) => update(index, name, event.target.value)} />
        </label>
        <Button variant="outline" size="sm" disabled={headers.length === 1} onClick={() => onChange(headers.filter((_, position) => position !== index))} aria-label={`${language === "id" ? "Hapus header" : "Remove header"} ${index + 1}`}>−</Button>
      </div>;
    })}
    <Button variant="outline" size="sm" disabled={headers.length >= 20} onClick={() => onChange([...headers, ""])}>{language === "id" ? "Tambah header" : "Add header"}</Button>
  </div>;
}
