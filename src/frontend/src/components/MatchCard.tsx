import { ChevronDown, Radio } from "lucide-react";
import { motion } from "motion/react";
import type { Event } from "../hooks/useQueries";
import { EventStatus, Selection, Sport } from "../hooks/useQueries";

const SPORT_ICONS: Record<string, string> = {
  Soccer: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  NFL: "🏈",
  Esports: "🎮",
};

export interface BetSlipItem {
  eventId: bigint;
  eventTitle: string;
  teamA: string;
  teamB: string;
  selection: Selection;
  odds: number;
}

interface MatchCardProps {
  event: Event;
  selectedSelection: Selection | null;
  onOddsClick: (item: BetSlipItem) => void;
  index: number;
}

export function MatchCard({
  event,
  selectedSelection,
  onOddsClick,
  index,
}: MatchCardProps) {
  const isTennis = event.sport === Sport.Tennis;
  const isNFL = event.sport === Sport.NFL;
  const noDrawOdds = isTennis || isNFL || event.oddsX === 0;

  function handleOdds(sel: Selection, odds: number) {
    if (odds <= 0) return;
    onOddsClick({
      eventId: event.id,
      eventTitle: event.title,
      teamA: event.teamA,
      teamB: event.teamB,
      selection: sel,
      odds,
    });
  }

  const isSelected = (sel: Selection) => selectedSelection === sel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-lg overflow-hidden shadow-card border border-border"
      style={{ backgroundColor: "oklch(var(--card))" }}
    >
      {/* Card header strip */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border"
        style={{ backgroundColor: "oklch(0.171 0.017 240)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{SPORT_ICONS[event.sport]}</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {event.sport}
          </span>
          {event.status === EventStatus.Live && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-400 ml-1">
              <Radio className="h-2.5 w-2.5 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Teams */}
      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 text-center">
            <div className="text-xl mb-0.5">{SPORT_ICONS[event.sport]}</div>
            <div className="text-xs font-bold text-foreground truncate max-w-[80px] mx-auto">
              {event.teamA}
            </div>
          </div>
          <div className="flex flex-col items-center px-3">
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {event.status === EventStatus.Upcoming ? "Today 20:45" : "NOW"}
            </span>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xl mb-0.5">{SPORT_ICONS[event.sport]}</div>
            <div className="text-xs font-bold text-foreground truncate max-w-[80px] mx-auto">
              {event.teamB}
            </div>
          </div>
        </div>

        {/* Market */}
        <div className="text-center text-xs text-muted-foreground mb-2 font-medium">
          {noDrawOdds ? "1 / 2" : "1X2"}
        </div>

        {/* Odds buttons */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => handleOdds(Selection.TeamA, event.oddsA)}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
              isSelected(Selection.TeamA)
                ? "bg-primary text-primary-foreground ring-1 ring-primary"
                : "hover:brightness-110 text-foreground"
            }`}
            style={
              !isSelected(Selection.TeamA)
                ? { backgroundColor: "oklch(var(--odds-btn))" }
                : undefined
            }
            data-ocid="event.odds_a.button"
          >
            <span className="block text-muted-foreground text-[9px] mb-0.5">
              1
            </span>
            {event.oddsA.toFixed(2)}
          </button>

          {!noDrawOdds && (
            <button
              type="button"
              onClick={() => handleOdds(Selection.Draw, event.oddsX)}
              className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                isSelected(Selection.Draw)
                  ? "bg-primary text-primary-foreground ring-1 ring-primary"
                  : "hover:brightness-110 text-foreground"
              }`}
              style={
                !isSelected(Selection.Draw)
                  ? { backgroundColor: "oklch(var(--odds-btn))" }
                  : undefined
              }
              data-ocid="event.odds_x.button"
            >
              <span className="block text-muted-foreground text-[9px] mb-0.5">
                X
              </span>
              {event.oddsX.toFixed(2)}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOdds(Selection.TeamB, event.oddsB)}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
              isSelected(Selection.TeamB)
                ? "bg-primary text-primary-foreground ring-1 ring-primary"
                : "hover:brightness-110 text-foreground"
            }`}
            style={
              !isSelected(Selection.TeamB)
                ? { backgroundColor: "oklch(var(--odds-btn))" }
                : undefined
            }
            data-ocid="event.odds_b.button"
          >
            <span className="block text-muted-foreground text-[9px] mb-0.5">
              2
            </span>
            {event.oddsB.toFixed(2)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
