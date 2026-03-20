import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Filter, Lightbulb, TrendingUp, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  type TipFilter,
  type TipSport,
  type TipStatus,
  useTips,
} from "../hooks/useQueries";

const SPORTS: Array<{ label: string; value: TipSport | "All" }> = [
  { label: "All", value: "All" },
  { label: "Soccer", value: "Soccer" },
  { label: "Basketball", value: "Basketball" },
  { label: "Tennis", value: "Tennis" },
  { label: "NFL", value: "NFL" },
  { label: "Esports", value: "Esports" },
];

const STATUSES: Array<{
  label: string;
  value: TipStatus | "All";
  icon: React.ReactNode;
}> = [
  { label: "All", value: "All", icon: <Filter className="h-3.5 w-3.5" /> },
  {
    label: "Upcoming",
    value: "Upcoming",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  { label: "Won", value: "Won", icon: <Trophy className="h-3.5 w-3.5" /> },
  {
    label: "Lost",
    value: "Lost",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
  },
];

const SPORT_EMOJI: Record<string, string> = {
  Soccer: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  NFL: "🏈",
  Esports: "🎮",
};

function statusBadgeClass(status: TipStatus): string {
  if (status === "Won")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "Lost") return "bg-red-500/15 text-red-400 border-red-500/30";
  return "bg-blue-500/15 text-blue-400 border-blue-500/30";
}

// Sample tips for non-empty first load
const SAMPLE_TIPS = [
  {
    id: BigInt(-1),
    sport: "Soccer" as TipSport,
    match: "Manchester City vs Arsenal",
    prediction: "Manchester City Win",
    reasoning:
      "City are unbeaten at home this season and have a superior defensive record. Arsenal's away form has been inconsistent — backing the hosts at solid value.",
    odds: 1.85,
    status: "Upcoming" as TipStatus,
    createdAt: BigInt(Date.now()),
    createdBy: null as any,
  },
  {
    id: BigInt(-2),
    sport: "Basketball" as TipSport,
    match: "LA Lakers vs Golden State Warriors",
    prediction: "Over 224.5 Total Points",
    reasoning:
      "Both teams rank in the top-5 for offensive pace. LeBron and Curry are both healthy and on recent scoring streaks — expect a high-octane affair.",
    odds: 1.92,
    status: "Won" as TipStatus,
    createdAt: BigInt(Date.now() - 86400000),
    createdBy: null as any,
  },
  {
    id: BigInt(-3),
    sport: "Tennis" as TipSport,
    match: "Djokovic vs Alcaraz — French Open Final",
    prediction: "Alcaraz to Win",
    reasoning:
      "Alcaraz is the current clay court form player, having dropped only one set in six matches. Djokovic is managing a knee injury that could affect his movement.",
    odds: 2.1,
    status: "Won" as TipStatus,
    createdAt: BigInt(Date.now() - 172800000),
    createdBy: null as any,
  },
  {
    id: BigInt(-4),
    sport: "NFL" as TipSport,
    match: "Kansas City Chiefs vs Baltimore Ravens",
    prediction: "Chiefs -3.5 Spread",
    reasoning:
      "Mahomes has a 12-2 record as favourite in playoff scenarios. Ravens D gave up 38 points last week — Chiefs offence should exploit the coverage gaps.",
    odds: 1.95,
    status: "Upcoming" as TipStatus,
    createdAt: BigInt(Date.now() - 3600000),
    createdBy: null as any,
  },
  {
    id: BigInt(-5),
    sport: "Esports" as TipSport,
    match: "Team Vitality vs NAVI — ESL Pro League",
    prediction: "Team Vitality Map Handicap -1.5",
    reasoning:
      "Vitality have dominated the EU scene this split with a 9-1 map record. NAVI are without their star AWPer and have looked shaky on CT sides.",
    odds: 2.25,
    status: "Lost" as TipStatus,
    createdAt: BigInt(Date.now() - 259200000),
    createdBy: null as any,
  },
];

export function TipsPage() {
  const [sportFilter, setSportFilter] = useState<TipSport | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TipStatus | "All">("All");

  const filter: TipFilter | undefined =
    sportFilter === "All" && statusFilter === "All"
      ? undefined
      : {
          sport: sportFilter !== "All" ? sportFilter : undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
        };

  const { data: backendTips = [], isLoading } = useTips(filter);

  // Merge sample tips with backend data, filtering samples if filters are active
  const allTips = backendTips.length > 0 ? backendTips : SAMPLE_TIPS;

  const tips = allTips.filter((t) => {
    if (sportFilter !== "All" && t.sport !== sportFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "oklch(var(--teal-cta) / 0.15)" }}
          >
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-primary">EXPERT</span>{" "}
            <span className="text-foreground">TIPS</span>
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-14">
          Professional betting predictions curated by our analyst team
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mb-6 space-y-3"
        data-ocid="tips.filter.tab"
      >
        {/* Sport filter */}
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSportFilter(s.value as TipSport | "All")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                sportFilter === s.value
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
              data-ocid={`tips.sport_${s.value.toLowerCase()}.toggle`}
            >
              {s.value !== "All" && (
                <span className="mr-1">{SPORT_EMOJI[s.value]}</span>
              )}
              {s.label}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value as TipStatus | "All")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === s.value
                  ? s.value === "Won"
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                    : s.value === "Lost"
                      ? "border-red-500/50 text-red-400 bg-red-500/10"
                      : s.value === "Upcoming"
                        ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                        : "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
              data-ocid={`tips.status_${s.value.toLowerCase()}.toggle`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tips Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="tips.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : tips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 text-muted-foreground"
          data-ocid="tips.empty_state"
        >
          <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No tips found for this filter</p>
          <p className="text-xs mt-1 opacity-60">
            Try adjusting the sport or status filter
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <motion.div
                key={tip.id.toString()}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
                style={{ backgroundColor: "oklch(var(--panel))" }}
                data-ocid={`tips.item.${i + 1}`}
              >
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b border-border"
                  style={{ backgroundColor: "oklch(var(--card))" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{SPORT_EMOJI[tip.sport]}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {tip.sport}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] font-bold border px-2 py-0.5 ${statusBadgeClass(tip.status)}`}
                    >
                      {tip.status === "Won" && "✓ "}
                      {tip.status === "Lost" && "✗ "}
                      {tip.status}
                    </Badge>
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "oklch(var(--odds-btn) / 0.3)",
                        color: "oklch(var(--primary))",
                      }}
                    >
                      {tip.odds.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 flex-1 flex flex-col gap-2">
                  <p className="text-sm font-bold text-foreground leading-snug">
                    {tip.match}
                  </p>
                  <div
                    className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{
                      backgroundColor: "oklch(var(--primary) / 0.12)",
                      color: "oklch(var(--primary))",
                    }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {tip.prediction}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-1">
                    {tip.reasoning}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </main>
  );
}
