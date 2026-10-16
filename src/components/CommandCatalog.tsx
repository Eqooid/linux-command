import { ArrowUpRight, Search, Star, Terminal } from "lucide-react";
import type { CommandDefinition, Language } from "../commands/types";
import { localize, translate } from "../i18n";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CatalogProps {
  commands: readonly CommandDefinition[];
  language: Language;
  selectedId: string | null;
  favorites: string[];
  search: string;
  emptyMessage: string;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
  onFavorite: (id: string) => void;
}
export function CommandCatalog({
  commands,
  language,
  selectedId,
  favorites,
  search,
  onSearch,
  onSelect,
  onFavorite,
  emptyMessage,
}: CatalogProps) {
  return (
    <section aria-label={translate("catalog", language)} className="min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {translate("catalog", language)}
        </h2>
        <span className="text-xs text-muted-foreground">
          {commands.length} {translate("available", language)}
        </span>
      </div>
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-3 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label={translate("search", language)}
          placeholder={translate("search", language)}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="h-10 bg-card pl-9"
        />
      </div>
      <div className="space-y-2">
        {commands.map((command) => (
          <div
            key={command.id}
            className={cn(
              "flex items-start rounded-xl border bg-card p-2",
              selectedId === command.id &&
                "border-foreground/60 ring-1 ring-foreground/10",
            )}
          >
            <button
              aria-pressed={selectedId === command.id}
              onClick={() => onSelect(command.id)}
              className="min-w-0 flex-1 rounded-md p-3 text-left"
            >
              <span className="mb-2 flex items-center gap-2">
                <Terminal
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="font-mono text-base font-semibold">
                  {command.name}
                </span>
                <ArrowUpRight
                  className="ml-auto size-3 text-muted-foreground"
                  aria-hidden="true"
                />
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                {localize(command.description, language)}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="mt-1"
              aria-pressed={favorites.includes(command.id)}
              aria-label={`${translate(favorites.includes(command.id) ? "unfavorite" : "favorite", language)} ${command.name}`}
              onClick={() => onFavorite(command.id)}
            >
              <Star
                className={cn(
                  "size-4",
                  favorites.includes(command.id) && "fill-current",
                )}
              />
            </Button>
          </div>
        ))}
      </div>
      {!commands.length && (
        <div className="rounded-xl border border-dashed p-7 text-center">
          <Search className="mx-auto mb-3 size-5 text-muted-foreground" />
          <h3 className="text-sm font-medium">
            {translate("empty", language)}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {emptyMessage}
          </p>
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        {translate("countHint", language)}
      </p>
    </section>
  );
}
