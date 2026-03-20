import { ChevronDown, ChevronRight, Circle, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { Sport } from "../hooks/useQueries";

const SPORT_ICONS: Record<string, string> = {
  Soccer: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  NFL: "🏈",
  Esports: "🎮",
};

const FAVORITES = [
  { label: "Man City vs PSG" },
  { label: "Lakers vs Celtics" },
];

interface LeftSidebarProps {
  selectedSport: Sport | null;
  onSportSelect: (sport: Sport | null) => void;
}

export function LeftSidebar({
  selectedSport,
  onSportSelect,
}: LeftSidebarProps) {
  const [favOpen, setFavOpen] = useState(true);
  const [allOpen, setAllOpen] = useState(true);

  return (
    <aside
      className="w-52 shrink-0 rounded-lg p-3 flex flex-col gap-3 self-start sticky top-16"
      style={{ backgroundColor: "oklch(var(--panel))" }}
    >
      <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase px-1">
        My Sports
      </p>

      {/* Favorites */}
      <div>
        <button
          type="button"
          onClick={() => setFavOpen((p) => !p)}
          className="flex items-center gap-1 w-full text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
          data-ocid="sidebar.favorites.toggle"
        >
          <Star className="h-3 w-3 text-primary" />
          <span>Favorites</span>
          {favOpen ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronRight className="h-3 w-3 ml-auto" />
          )}
        </button>
        {favOpen && (
          <ul className="space-y-0.5 pl-4">
            {FAVORITES.map((f, i) => (
              <li
                key={f.label}
                className="text-xs text-muted-foreground py-0.5 cursor-pointer hover:text-primary truncate"
                data-ocid={`sidebar.favorite.item.${i + 1}`}
              >
                {f.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border" />

      {/* All Sports */}
      <div>
        <button
          type="button"
          onClick={() => setAllOpen((p) => !p)}
          className="flex items-center gap-1 w-full text-xs font-semibold text-muted-foreground hover:text-foreground mb-1"
          data-ocid="sidebar.allsports.toggle"
        >
          <Trophy className="h-3 w-3 text-primary" />
          <span>All Sports</span>
          {allOpen ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronRight className="h-3 w-3 ml-auto" />
          )}
        </button>
        {allOpen && (
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => onSportSelect(null)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedSport === null
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-ocid="sidebar.all.tab"
              >
                <Circle className="h-3 w-3" />
                All Sports
              </button>
            </li>
            {Object.values(Sport).map((sport, i) => (
              <li key={sport}>
                <button
                  type="button"
                  onClick={() => onSportSelect(sport)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedSport === sport
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-ocid={`sidebar.sport.item.${i + 1}`}
                >
                  <span>{SPORT_ICONS[sport]}</span>
                  {sport}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
