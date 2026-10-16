import {
  BookOpen,
  Clock3,
  Files,
  Folder,
  FolderOpen,
  Info,
  Pin,
  Search,
  Shield,
  Star,
  Terminal,
  Workflow,
} from "lucide-react";
import { categories } from "../commands/registry";
import type { CategoryId, Language } from "../commands/types";
import { translate } from "../i18n";
import { cn } from "../lib/utils";

export type View = "all" | "favorites" | "pinned" | "recent";
const categoryIcons = {
  navigation: FolderOpen,
  files: Folder,
  reading: Files,
  searching: Search,
  help: BookOpen,
  permissions: Shield,
  system: Info,
  pipes: Workflow,
};
const views = [
  { id: "all", icon: BookOpen },
  { id: "favorites", icon: Star },
  { id: "pinned", icon: Pin },
  { id: "recent", icon: Clock3 },
] as const;
interface SidebarProps {
  language: Language;
  view: View;
  category: CategoryId | null;
  favoriteCount: number;
  pinCount: number;
  mobileOpen: boolean;
  onNavigate: (view: View, category: CategoryId | null) => void;
}
export function Sidebar({
  language,
  view,
  category,
  favoriteCount,
  pinCount,
  onNavigate,
  mobileOpen,
}: SidebarProps) {
  return (
    <aside
      id="navigation"
      className={cn(
        "border-r bg-card lg:flex lg:w-64 lg:shrink-0 lg:flex-col",
        mobileOpen ? "block" : "hidden",
      )}
    >
      <nav
        aria-label={translate("workspace", language)}
        className="space-y-7 p-5 lg:sticky lg:top-20"
      >
        <div>
          <p className="sidebar-label">{translate("workspace", language)}</p>
          <div className="space-y-1">
            {views.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id, null)}
                aria-current={view === id && !category ? "page" : undefined}
                className={cn(
                  "nav-item",
                  view === id && !category && "nav-active",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="flex-1">{translate(id, language)}</span>
                {(id === "favorites" || id === "pinned") && (
                  <span className="text-xs text-muted-foreground">
                    {id === "favorites" ? favoriteCount : pinCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="sidebar-label">{translate("categories", language)}</p>
          <div className="space-y-1">
            {categories.map((id) => {
              const Icon = categoryIcons[id];
              return (
                <button
                  key={id}
                  onClick={() => onNavigate("all", id)}
                  aria-current={category === id ? "page" : undefined}
                  className={cn("nav-item", category === id && "nav-active")}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {translate(id, language)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-10 rounded-lg border p-4">
          <Terminal className="mb-3 size-5" aria-hidden="true" />
          <p className="text-sm font-medium">
            {translate("learning", language)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {translate("previewHint", language)}
          </p>
        </div>
      </nav>
    </aside>
  );
}
