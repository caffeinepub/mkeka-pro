import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { BetSlip } from "../components/BetSlip";
import { LeftSidebar } from "../components/LeftSidebar";
import { type BetSlipItem, MatchCard } from "../components/MatchCard";
import { sampleEvents } from "../data/sampleEvents";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useEvents } from "../hooks/useQueries";
import { EventStatus, type Selection, Sport } from "../hooks/useQueries";

type FilterChip = "all" | "live" | "upcoming" | "tomorrow";

interface SportsbookPageProps {
  searchQuery: string;
  activeNav: string;
}

export function SportsbookPage({
  searchQuery,
  activeNav,
}: SportsbookPageProps) {
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [filterChip, setFilterChip] = useState<FilterChip>("all");
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const { identity } = useInternetIdentity();

  const sportFilter = selectedSport !== null ? { sport: selectedSport } : null;
  const { data: fetchedEvents, isLoading } = useEvents(sportFilter);

  const events = useMemo(() => {
    const base =
      identity && fetchedEvents && fetchedEvents.length > 0
        ? fetchedEvents
        : sampleEvents;

    let filtered = base;

    if (selectedSport) {
      filtered = filtered.filter((e) => e.sport === selectedSport);
    }

    if (activeNav === "esports") {
      filtered = filtered.filter((e) => e.sport === Sport.Esports);
    }

    if (filterChip === "live")
      filtered = filtered.filter((e) => e.status === EventStatus.Live);
    else if (filterChip === "upcoming" || filterChip === "tomorrow")
      filtered = filtered.filter((e) => e.status === EventStatus.Upcoming);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.teamA.toLowerCase().includes(q) ||
          e.teamB.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [
    identity,
    fetchedEvents,
    selectedSport,
    filterChip,
    searchQuery,
    activeNav,
  ]);

  function handleOddsClick(item: BetSlipItem) {
    const key = item.eventId.toString();
    const existing = betSlip.find((b) => b.eventId === item.eventId);

    if (existing && existing.selection === item.selection) {
      setBetSlip((prev) => prev.filter((b) => b.eventId !== item.eventId));
      setSelections((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setBetSlip((prev) => {
        const without = prev.filter((b) => b.eventId !== item.eventId);
        return [...without, item];
      });
      setSelections((prev) => ({ ...prev, [key]: item.selection }));
    }
  }

  function handleRemove(eventId: bigint) {
    const key = eventId.toString();
    setBetSlip((prev) => prev.filter((b) => b.eventId !== eventId));
    setSelections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleClear() {
    setBetSlip([]);
    setSelections({});
  }

  const chips: { id: FilterChip; label: string }[] = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "upcoming", label: "Upcoming" },
    { id: "tomorrow", label: "Tomorrow" },
  ];

  return (
    <main className="flex gap-4 px-4 py-4 max-w-screen-xl mx-auto min-h-[calc(100vh-3.5rem-1px)]">
      <LeftSidebar
        selectedSport={selectedSport}
        onSportSelect={setSelectedSport}
      />

      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">
            UPCOMING EVENTS
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">
            TODAY&apos;S TOP MATCHES
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Bet live on major sports with competitive odds.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-4" data-ocid="events.filter.tab">
          {chips.map((chip) => (
            <button
              type="button"
              key={chip.id}
              onClick={() => setFilterChip(chip.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                filterChip === chip.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
              data-ocid={`events.${chip.id}.tab`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-40 rounded-lg"
                data-ocid="events.loading_state"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12" data-ocid="events.empty_state">
            <p className="text-muted-foreground">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((event, i) => (
              <MatchCard
                key={event.id.toString()}
                event={event}
                selectedSelection={selections[event.id.toString()] ?? null}
                onOddsClick={handleOddsClick}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <BetSlip items={betSlip} onRemove={handleRemove} onClear={handleClear} />
    </main>
  );
}
