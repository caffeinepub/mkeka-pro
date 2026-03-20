import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  Loader2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { BetStatus, Selection } from "../hooks/useQueries";
import { useMyBets, usePlaceBet } from "../hooks/useQueries";
import type { BetSlipItem } from "./MatchCard";

interface BetSlipProps {
  items: BetSlipItem[];
  onRemove: (eventId: bigint) => void;
  onClear: () => void;
}

export function BetSlip({ items, onRemove, onClear }: BetSlipProps) {
  const [stakes, setStakes] = useState<Record<string, string>>({});
  const [openBetsOpen, setOpenBetsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: myBets = [] } = useMyBets();
  const placeBet = usePlaceBet();

  const openBets = myBets.filter((b) => b.status === BetStatus.Open);
  const recentBets = myBets
    .filter((b) => b.status !== BetStatus.Open)
    .slice(0, 10);

  async function handlePlaceBets() {
    if (!identity) {
      toast.error("Please log in to place bets");
      return;
    }
    const promises = items
      .map((item) => {
        const stakeStr = stakes[item.eventId.toString()] ?? "10";
        const stake = Number.parseFloat(stakeStr);
        if (!stake || stake <= 0) return null;
        return placeBet.mutateAsync({
          eventId: item.eventId,
          selection: item.selection,
          stake,
        });
      })
      .filter(Boolean);

    if (promises.length === 0) {
      toast.error("Enter stake amounts first");
      return;
    }
    try {
      await Promise.all(promises);
      toast.success("Bets placed successfully!");
      onClear();
      setStakes({});
    } catch {
      toast.error("Failed to place bets. Please try again.");
    }
  }

  const totalStake = items.reduce((sum, item) => {
    return (
      sum + (Number.parseFloat(stakes[item.eventId.toString()] || "0") || 0)
    );
  }, 0);

  const totalPayout = items.reduce((sum, item) => {
    const stake =
      Number.parseFloat(stakes[item.eventId.toString()] || "0") || 0;
    return sum + stake * item.odds;
  }, 0);

  function selectionLabel(sel: Selection) {
    if (sel === Selection.TeamA) return "1";
    if (sel === Selection.Draw) return "X";
    return "2";
  }

  return (
    <aside
      className="w-64 shrink-0 rounded-lg flex flex-col self-start sticky top-16 max-h-[calc(100vh-5rem)] overflow-hidden border border-border"
      style={{ backgroundColor: "oklch(var(--panel))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <span className="text-xs font-bold tracking-wide uppercase text-foreground">
          Bet Slip
          {items.length > 0 && (
            <Badge className="ml-1.5 h-4 text-[10px] px-1.5 bg-primary text-primary-foreground">
              {items.length}
            </Badge>
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <Tabs defaultValue="single">
            <TabsList className="w-full h-7 mb-3 bg-muted/50">
              <TabsTrigger
                value="single"
                className="flex-1 text-xs"
                data-ocid="betslip.single.tab"
              >
                SINGLE
              </TabsTrigger>
              <TabsTrigger
                value="parlay"
                className="flex-1 text-xs"
                data-ocid="betslip.parlay.tab"
              >
                PARLAY
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              {items.length === 0 ? (
                <div
                  className="text-center py-6"
                  data-ocid="betslip.empty_state"
                >
                  <p className="text-xs text-muted-foreground">
                    Click any odds button to add selections
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={item.eventId.toString()}
                      className="rounded p-2 border border-border"
                      style={{ backgroundColor: "oklch(var(--card))" }}
                      data-ocid={`betslip.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 mr-1">
                          <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">
                            {item.teamA} vs {item.teamB}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectionLabel(item.selection)} @{" "}
                            {item.odds.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(item.eventId)}
                          className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                          data-ocid={`betslip.delete_button.${i + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground w-8">
                          Stake
                        </span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="10"
                          value={stakes[item.eventId.toString()] ?? ""}
                          onChange={(e) =>
                            setStakes((prev) => ({
                              ...prev,
                              [item.eventId.toString()]: e.target.value,
                            }))
                          }
                          className="h-6 text-xs flex-1 bg-muted/50"
                          data-ocid="betslip.stake.input"
                        />
                      </div>
                      {stakes[item.eventId.toString()] &&
                        Number.parseFloat(stakes[item.eventId.toString()]) >
                          0 && (
                          <p className="text-[10px] text-primary mt-1">
                            Win: $
                            {(
                              Number.parseFloat(
                                stakes[item.eventId.toString()],
                              ) * item.odds
                            ).toFixed(2)}
                          </p>
                        )}
                    </div>
                  ))}

                  <Separator className="my-2" />
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Stake</span>
                      <span>${totalStake.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary">
                      <span>Est. Payout</span>
                      <span>${totalPayout.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-9 text-xs font-bold mt-2 uppercase tracking-wide"
                    style={{
                      backgroundColor: "oklch(var(--teal-cta))",
                      color: "oklch(var(--foreground))",
                    }}
                    onClick={handlePlaceBets}
                    disabled={placeBet.isPending}
                    data-ocid="betslip.place_bet.button"
                  >
                    {placeBet.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{" "}
                        Placing...
                      </>
                    ) : (
                      "PLACE BET"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={onClear}
                    className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors mt-1"
                    data-ocid="betslip.clear.button"
                  >
                    CLEAR SLIP
                  </button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="parlay">
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">
                  Parlay betting coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Open Bets */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setOpenBetsOpen((p) => !p)}
              className="flex items-center gap-1.5 w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
              data-ocid="betslip.open_bets.toggle"
            >
              <Clock className="h-3 w-3" />
              <span>OPEN BETS</span>
              {openBets.length > 0 && (
                <Badge className="ml-1 h-4 text-[10px] px-1 bg-muted text-muted-foreground">
                  {openBets.length}
                </Badge>
              )}
              {openBetsOpen ? (
                <ChevronDown className="h-3 w-3 ml-auto" />
              ) : (
                <ChevronRight className="h-3 w-3 ml-auto" />
              )}
            </button>
            {openBetsOpen && (
              <div
                className="mt-1 space-y-1"
                data-ocid="betslip.open_bets.panel"
              >
                {openBets.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground pl-4">
                    No open bets
                  </p>
                ) : (
                  openBets.map((bet, i) => (
                    <div
                      key={bet.id.toString()}
                      className="pl-4 text-[10px] text-muted-foreground"
                      data-ocid={`betslip.open_bet.item.${i + 1}`}
                    >
                      <span className="text-foreground">
                        #{bet.id.toString()}
                      </span>{" "}
                      — ${bet.stake} @ {bet.odds.toFixed(2)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((p) => !p)}
              className="flex items-center gap-1.5 w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
              data-ocid="betslip.history.toggle"
            >
              <History className="h-3 w-3" />
              <span>RECENT HISTORY</span>
              {historyOpen ? (
                <ChevronDown className="h-3 w-3 ml-auto" />
              ) : (
                <ChevronRight className="h-3 w-3 ml-auto" />
              )}
            </button>
            {historyOpen && (
              <div className="mt-1 space-y-1" data-ocid="betslip.history.panel">
                {recentBets.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground pl-4">
                    No bet history
                  </p>
                ) : (
                  recentBets.map((bet, i) => (
                    <div
                      key={bet.id.toString()}
                      className="pl-4 text-[10px] flex justify-between"
                      data-ocid={`betslip.history.item.${i + 1}`}
                    >
                      <span className="text-muted-foreground">
                        #{bet.id.toString()} ${bet.stake}
                      </span>
                      <span
                        className={
                          bet.status === BetStatus.Won
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {bet.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
