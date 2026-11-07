import type {
  Language,
  ShellComposition,
  ShellRedirection,
} from "../commands/types";
import { localize } from "../i18n";
import { Input } from "./ui/input";
import { shellText } from "./shellText";

const selectClass =
  "min-h-10 w-full rounded-md border bg-card px-3 py-2 text-sm";
export function ShellRedirectionEditor({
  id,
  value,
  language,
  onChange,
}: {
  id: string;
  value: ShellComposition;
  language: Language;
  onChange: (value: ShellComposition) => void;
}) {
  const t = (key: keyof typeof shellText) => localize(shellText[key], language);
  const pathRedirection = value.redirections.find((item) => "path" in item);
  const path =
    pathRedirection && "path" in pathRedirection ? pathRedirection.path : "";
  const combined = value.redirections.length === 2;
  const fileFirst = value.redirections[0]?.operator !== "2>&1";
  const fileOperator = pathRedirection?.operator === ">>" ? ">>" : ">";
  function setCombined(operator: ">" | ">>", first: boolean) {
    const file: ShellRedirection = { operator, path };
    const merge: ShellRedirection = { operator: "2>&1" };
    onChange({ ...value, redirections: first ? [file, merge] : [merge, file] });
  }
  return (
    <div className="space-y-4">
      {id === "stdout-redirection" && (
        <div className="space-y-2">
          <label htmlFor="shell-output-mode" className="text-sm font-medium">
            {t("outputMode")}
          </label>
          <select
            id="shell-output-mode"
            className={selectClass}
            value={pathRedirection?.operator}
            onChange={(event) =>
              onChange({
                ...value,
                redirections: [
                  {
                    operator: event.target.value === ">>" ? ">>" : ">",
                    path,
                  },
                ],
              })
            }
          >
            <option value=">">{t("overwrite")}</option>
            <option value=">>">{t("append")}</option>
          </select>
        </div>
      )}
      {id === "stderr-redirection" && (
        <div className="space-y-2">
          <label htmlFor="shell-error-mode" className="text-sm font-medium">
            {t("errorMode")}
          </label>
          <select
            id="shell-error-mode"
            className={selectClass}
            value={combined ? "combined" : value.redirections[0]?.operator}
            onChange={(event) => {
              const mode = event.target.value;
              if (mode === "combined") setCombined(">", true);
              else
                onChange({
                  ...value,
                  redirections:
                    mode === "2>&1"
                      ? [{ operator: "2>&1" }]
                      : [{ operator: mode === "2>>" ? "2>>" : "2>", path }],
                });
            }}
          >
            <option value="2>">{t("errorOverwrite")}</option>
            <option value="2>>">{t("errorAppend")}</option>
            <option value="2>&1">{t("merge")}</option>
            <option value="combined">{t("combined")}</option>
          </select>
        </div>
      )}
      {combined && (
        <>
          <div className="space-y-2">
            <label htmlFor="shell-output-mode" className="text-sm font-medium">
              {t("outputMode")}
            </label>
            <select
              id="shell-output-mode"
              className={selectClass}
              value={fileOperator}
              onChange={(event) =>
                setCombined(event.target.value === ">>" ? ">>" : ">", fileFirst)
              }
            >
              <option value=">">{t("overwrite")}</option>
              <option value=">>">{t("append")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="shell-redirection-order"
              className="text-sm font-medium"
            >
              {t("order")}
            </label>
            <select
              id="shell-redirection-order"
              className={selectClass}
              value={fileFirst ? "file-first" : "merge-first"}
              onChange={(event) =>
                setCombined(fileOperator, event.target.value === "file-first")
              }
            >
              <option value="file-first">{t("fileFirst")}</option>
              <option value="merge-first">{t("mergeFirst")}</option>
            </select>
          </div>
        </>
      )}
      {pathRedirection && (
        <div className="space-y-2">
          <label htmlFor="shell-file-path" className="text-sm font-medium">
            {t(id === "stdin-redirection" ? "input" : "target")}
          </label>
          <Input
            id="shell-file-path"
            value={path}
            aria-describedby="shell-path-hint"
            onChange={(event) =>
              onChange({
                ...value,
                redirections: value.redirections.map((item) =>
                  "path" in item ? { ...item, path: event.target.value } : item,
                ),
              })
            }
          />
          <p
            id="shell-path-hint"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {t("pathHint")}
          </p>
        </div>
      )}
    </div>
  );
}
