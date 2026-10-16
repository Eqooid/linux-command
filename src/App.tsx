import { useEffect, useState } from "react";
import { Clock3, Menu, Moon, Sun, Terminal } from "lucide-react";
import { commands, getCommand } from "./commands/registry";
import type { CategoryId } from "./commands/types";
import { localize, translate } from "./i18n";
import { loadState, saveState } from "./lib/storage";
import {
  toggleFavorite as toggleSavedFavorite,
  togglePin as toggleSavedPin,
} from "./lib/savedCommands";
import { Sidebar, type View } from "./components/Sidebar";
import { CommandCatalog } from "./components/CommandCatalog";
import {
  CommandWorkspace,
  EmptyWorkspace,
} from "./components/CommandWorkspace";
import { PinnedCommands } from "./components/PinnedCommands";
import { HelpUtility } from "./components/HelpUtility";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { cn } from "./lib/utils";

export default function App() {
  const [preferences, setPreferences] = useState(loadState);
  const [storageFailed, setStorageFailed] = useState(false);
  const [view, setView] = useState<View>("all");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>("ls");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, theme } = preferences;
  const t = (key: Parameters<typeof translate>[0]) => translate(key, language);

  useEffect(() => {
    setStorageFailed(!saveState(preferences));
  }, [preferences]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = language;
    document.documentElement.style.colorScheme = theme;
  }, [theme, language]);

  function navigate(nextView: View, nextCategory: CategoryId | null) {
    setView(nextView);
    setCategory(nextCategory);
    setSearch("");
    setSelectedId(null);
    setMobileOpen(false);
  }
  function toggleFavorite(id: string) {
    setPreferences((current) => ({
      ...current,
      favorites: toggleSavedFavorite(current.favorites, id),
    }));
  }
  function togglePin(commandId: string, text: string) {
    const newPin = {
      id: crypto.randomUUID(),
      commandId,
      text,
      createdAt: new Date().toISOString(),
    };
    setPreferences((current) => ({
      ...current,
      pins: toggleSavedPin(current.pins, newPin),
    }));
  }
  const visibleCommands = commands.filter(
    (command) =>
      (!category || command.category === category) &&
      (view !== "favorites" || preferences.favorites.includes(command.id)) &&
      `${command.name} ${localize(command.description, language)}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const selected = visibleCommands.find((command) => command.id === selectedId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 flex min-h-18 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("menu")}
            aria-expanded={mobileOpen}
            aria-controls="navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu />
          </Button>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="size-5" aria-hidden="true" />
          </span>
          <h1 className="text-sm font-semibold tracking-tight sm:text-base">
            Linux Command Builder
          </h1>
          <Badge
            variant="outline"
            className="hidden font-mono text-[10px] sm:inline-flex"
          >
            T07
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div
            className="flex rounded-md border p-0.5"
            aria-label={language === "id" ? "Bahasa" : "Language"}
          >
            {(["en", "id"] as const).map((value) => (
              <button
                key={value}
                aria-label={value === "en" ? "English" : "Bahasa Indonesia"}
                aria-pressed={language === value}
                onClick={() =>
                  setPreferences((current) => ({ ...current, language: value }))
                }
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium",
                  language === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="h-5 border-l" />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t(theme === "light" ? "themeDark" : "themeLight")}
            onClick={() =>
              setPreferences((current) => ({
                ...current,
                theme: current.theme === "light" ? "dark" : "light",
              }))
            }
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
        </div>
      </header>
      <div className="lg:flex lg:min-h-[calc(100vh-73px)]">
        <Sidebar
          language={language}
          view={view}
          category={category}
          favoriteCount={
            preferences.favorites.filter((id) => getCommand(id)).length
          }
          pinCount={preferences.pins.length}
          onNavigate={navigate}
          mobileOpen={mobileOpen}
        />
        <main className="mx-auto w-full min-w-0 max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-8">
            <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("workspace")}</span>
              <span>/</span>
              <span className="text-foreground">{t(category ?? view)}</span>
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("heading")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("intro")}
            </p>
          </div>
          {storageFailed && (
            <p role="status" className="mb-5 rounded-lg border p-3 text-sm">
              {t("storageFailed")}
            </p>
          )}
          {view === "recent" ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <Clock3 className="mx-auto mb-4 size-7 text-muted-foreground" />
              <h2 className="mb-3 font-semibold">{t("recent")}</h2>
              <Badge variant="secondary">{t("planned")}</Badge>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("recentHint")}
              </p>
            </div>
          ) : view === "pinned" ? (
            <PinnedCommands
              pins={preferences.pins}
              language={language}
              onRemove={(id) =>
                setPreferences((current) => ({
                  ...current,
                  pins: current.pins.filter((pin) => pin.id !== id),
                }))
              }
            />
          ) : (
            <>
              {category === "help" && <HelpUtility language={language} />}
              <div className="grid items-start gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
                <CommandCatalog
                  commands={visibleCommands}
                  language={language}
                  selectedId={selected?.id ?? null}
                  favorites={preferences.favorites}
                  search={search}
                  onSearch={setSearch}
                  onSelect={setSelectedId}
                  onFavorite={toggleFavorite}
                  emptyMessage={
                    view === "favorites" && !preferences.favorites.length
                      ? t("noFavorites")
                      : t("emptyHint")
                  }
                />
                {selected ? (
                  <CommandWorkspace
                    key={selected.id}
                    definition={selected}
                    language={language}
                    favorite={preferences.favorites.includes(selected.id)}
                    pinnedTexts={preferences.pins
                      .filter((pin) => pin.commandId === selected.id)
                      .map((pin) => pin.text)}
                    onFavorite={() => toggleFavorite(selected.id)}
                    onPin={(text) => togglePin(selected.id, text)}
                  />
                ) : (
                  <EmptyWorkspace language={language} />
                )}
              </div>
            </>
          )}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t pt-5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <Terminal className="size-3" />
              {t("learning")}
            </span>
            <span>{t("local")}</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
