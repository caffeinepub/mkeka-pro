import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Trophy, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  BetStatus,
  EventOutcome,
  EventStatus,
  Sport,
  type TipSport,
  useAllBets,
  useCreateEvent,
  useCreateTip,
  useEvents,
  useResolveEvent,
  useTips,
  useUpdateEventStatus,
  useUpdateTipStatus,
} from "../hooks/useQueries";

const TIP_SPORTS: TipSport[] = [
  "Soccer",
  "Basketball",
  "Tennis",
  "NFL",
  "Esports",
];

export function AdminPage() {
  const navigate = useNavigate();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: allBets = [], isLoading: betsLoading } = useAllBets();
  const { data: tips = [], isLoading: tipsLoading } = useTips();
  const createEvent = useCreateEvent();
  const updateStatus = useUpdateEventStatus();
  const resolveEvent = useResolveEvent();
  const createTip = useCreateTip();
  const updateTipStatus = useUpdateTipStatus();

  const [form, setForm] = useState({
    title: "",
    sport: Sport.Soccer as Sport,
    teamA: "",
    teamB: "",
    oddsA: "",
    oddsX: "",
    oddsB: "",
  });

  const [tipForm, setTipForm] = useState({
    sport: "Soccer" as TipSport,
    match: "",
    prediction: "",
    reasoning: "",
    odds: "",
  });

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createEvent.mutateAsync({
        title: form.title,
        sport: form.sport,
        teamA: form.teamA,
        teamB: form.teamB,
        oddsA: Number.parseFloat(form.oddsA),
        oddsX: Number.parseFloat(form.oddsX) || 0,
        oddsB: Number.parseFloat(form.oddsB),
      });
      toast.success("Event created!");
      setForm({
        title: "",
        sport: Sport.Soccer,
        teamA: "",
        teamB: "",
        oddsA: "",
        oddsX: "",
        oddsB: "",
      });
    } catch {
      toast.error("Failed to create event");
    }
  }

  async function handleCreateTip(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTip.mutateAsync({
        sport: tipForm.sport,
        match: tipForm.match,
        prediction: tipForm.prediction,
        reasoning: tipForm.reasoning,
        odds: Number.parseFloat(tipForm.odds),
      });
      toast.success("Tip published!");
      setTipForm({
        sport: "Soccer",
        match: "",
        prediction: "",
        reasoning: "",
        odds: "",
      });
    } catch {
      toast.error("Failed to create tip");
    }
  }

  async function handleSetStatus(eventId: bigint, status: EventStatus) {
    try {
      await updateStatus.mutateAsync({ eventId, status });
      toast.success(`Event set to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleResolve(eventId: bigint, outcome: EventOutcome) {
    try {
      await resolveEvent.mutateAsync({ eventId, outcome });
      toast.success("Event resolved!");
    } catch {
      toast.error("Failed to resolve event");
    }
  }

  async function handleTipStatusUpdate(tipId: bigint, status: "Won" | "Lost") {
    try {
      await updateTipStatus.mutateAsync({ tipId, status });
      toast.success(`Tip marked as ${status}!`);
    } catch {
      toast.error("Failed to update tip status");
    }
  }

  function statusColor(status: EventStatus) {
    if (status === EventStatus.Live)
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (status === EventStatus.Upcoming)
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (status === EventStatus.Closed)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground";
  }

  function betStatusColor(status: BetStatus) {
    if (status === BetStatus.Won) return "text-green-400";
    if (status === BetStatus.Lost) return "text-red-400";
    if (status === BetStatus.Open) return "text-blue-400";
    return "text-muted-foreground";
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(var(--background))" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            data-ocid="admin.back.button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-black tracking-tight">
            <span className="text-primary">MKEKA</span> PRO — Admin Panel
          </h1>
        </motion.div>

        <Tabs defaultValue="events">
          <TabsList className="mb-6 bg-panel">
            <TabsTrigger value="events" data-ocid="admin.events.tab">
              Events
            </TabsTrigger>
            <TabsTrigger value="create" data-ocid="admin.create.tab">
              Create Event
            </TabsTrigger>
            <TabsTrigger value="tips" data-ocid="admin.tips.tab">
              Tips
            </TabsTrigger>
            <TabsTrigger value="create-tip" data-ocid="admin.create_tip.tab">
              Create Tip
            </TabsTrigger>
            <TabsTrigger value="bets" data-ocid="admin.bets.tab">
              All Bets
            </TabsTrigger>
          </TabsList>

          {/* Events tab */}
          <TabsContent value="events">
            <div
              className="rounded-lg border border-border overflow-hidden"
              style={{ backgroundColor: "oklch(var(--panel))" }}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Sport
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Teams
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Actions
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Resolve
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.events.loading_state"
                      >
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.events.empty_state"
                      >
                        No events yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event, i) => (
                      <TableRow
                        key={event.id.toString()}
                        className="border-border"
                        data-ocid={`admin.event.row.${i + 1}`}
                      >
                        <TableCell className="text-xs font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {event.sport}
                        </TableCell>
                        <TableCell className="text-xs">
                          {event.teamA} vs {event.teamB}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] border ${statusColor(event.status)}`}
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {event.status !== EventStatus.Live &&
                              event.status !== EventStatus.Resolved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 border-green-500/40 text-green-400 hover:bg-green-500/10"
                                  onClick={() =>
                                    handleSetStatus(event.id, EventStatus.Live)
                                  }
                                  data-ocid={`admin.set_live.button.${i + 1}`}
                                >
                                  Set Live
                                </Button>
                              )}
                            {event.status !== EventStatus.Closed &&
                              event.status !== EventStatus.Resolved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                                  onClick={() =>
                                    handleSetStatus(
                                      event.id,
                                      EventStatus.Closed,
                                    )
                                  }
                                  data-ocid={`admin.close.button.${i + 1}`}
                                >
                                  Close
                                </Button>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.status === EventStatus.Closed && (
                            <Select
                              onValueChange={(val) =>
                                handleResolve(event.id, val as EventOutcome)
                              }
                              data-ocid={`admin.resolve.select.${i + 1}`}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-28">
                                <SelectValue placeholder="Resolve..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={EventOutcome.TeamA}>
                                  {event.teamA} Win
                                </SelectItem>
                                <SelectItem value={EventOutcome.Draw}>
                                  Draw
                                </SelectItem>
                                <SelectItem value={EventOutcome.TeamB}>
                                  {event.teamB} Win
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Create Event tab */}
          <TabsContent value="create">
            <div
              className="rounded-lg border border-border p-6 max-w-xl"
              style={{ backgroundColor: "oklch(var(--panel))" }}
            >
              <h2 className="text-sm font-bold mb-4 uppercase tracking-wide">
                New Event
              </h2>
              <form
                onSubmit={handleCreateEvent}
                className="space-y-3"
                data-ocid="admin.create_event.panel"
              >
                <div>
                  <Label className="text-xs mb-1 block">Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Premier League: Arsenal vs Chelsea"
                    required
                    className="h-8 text-sm"
                    data-ocid="admin.title.input"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Sport</Label>
                  <Select
                    value={form.sport}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, sport: v as Sport }))
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="admin.sport.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Sport).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Team A</Label>
                    <Input
                      value={form.teamA}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, teamA: e.target.value }))
                      }
                      placeholder="Arsenal"
                      required
                      className="h-8 text-sm"
                      data-ocid="admin.team_a.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Team B</Label>
                    <Input
                      value={form.teamB}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, teamB: e.target.value }))
                      }
                      placeholder="Chelsea"
                      required
                      className="h-8 text-sm"
                      data-ocid="admin.team_b.input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Odds A (1)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      value={form.oddsA}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, oddsA: e.target.value }))
                      }
                      placeholder="2.10"
                      required
                      className="h-8 text-sm"
                      data-ocid="admin.odds_a.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Odds X (Draw)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.oddsX}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, oddsX: e.target.value }))
                      }
                      placeholder="3.30"
                      className="h-8 text-sm"
                      data-ocid="admin.odds_x.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Odds B (2)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      value={form.oddsB}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, oddsB: e.target.value }))
                      }
                      placeholder="3.60"
                      required
                      className="h-8 text-sm"
                      data-ocid="admin.odds_b.input"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-9 text-xs font-bold uppercase"
                  disabled={createEvent.isPending}
                  style={{ backgroundColor: "oklch(var(--teal-cta))" }}
                  data-ocid="admin.create_event.submit_button"
                >
                  {createEvent.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Tips Management tab */}
          <TabsContent value="tips">
            <div
              className="rounded-lg border border-border overflow-hidden"
              style={{ backgroundColor: "oklch(var(--panel))" }}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">
                      Match
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Sport
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Prediction
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Odds
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tipsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.tips.loading_state"
                      >
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : tips.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.tips.empty_state"
                      >
                        No tips yet — create one in the Create Tip tab
                      </TableCell>
                    </TableRow>
                  ) : (
                    tips.map((tip, i) => (
                      <TableRow
                        key={tip.id.toString()}
                        className="border-border"
                        data-ocid={`admin.tip.row.${i + 1}`}
                      >
                        <TableCell className="text-xs font-medium max-w-[160px] truncate">
                          {tip.match}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {tip.sport}
                        </TableCell>
                        <TableCell className="text-xs max-w-[140px] truncate">
                          {tip.prediction}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-primary">
                          {tip.odds.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] border ${
                              tip.status === "Won"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : tip.status === "Lost"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {tip.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tip.status === "Upcoming" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 border-green-500/40 text-green-400 hover:bg-green-500/10"
                                onClick={() =>
                                  handleTipStatusUpdate(tip.id, "Won")
                                }
                                data-ocid={`admin.tip_won.button.${i + 1}`}
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                Won
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                                onClick={() =>
                                  handleTipStatusUpdate(tip.id, "Lost")
                                }
                                data-ocid={`admin.tip_lost.button.${i + 1}`}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Lost
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Create Tip tab */}
          <TabsContent value="create-tip">
            <div
              className="rounded-lg border border-border p-6 max-w-xl"
              style={{ backgroundColor: "oklch(var(--panel))" }}
            >
              <h2 className="text-sm font-bold mb-4 uppercase tracking-wide">
                New Tip
              </h2>
              <form
                onSubmit={handleCreateTip}
                className="space-y-3"
                data-ocid="admin.create_tip.panel"
              >
                <div>
                  <Label className="text-xs mb-1 block">Sport</Label>
                  <Select
                    value={tipForm.sport}
                    onValueChange={(v) =>
                      setTipForm((p) => ({ ...p, sport: v as TipSport }))
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="admin.tip_sport.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIP_SPORTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Match</Label>
                  <Input
                    value={tipForm.match}
                    onChange={(e) =>
                      setTipForm((p) => ({ ...p, match: e.target.value }))
                    }
                    placeholder="e.g. Manchester City vs Arsenal"
                    required
                    className="h-8 text-sm"
                    data-ocid="admin.tip_match.input"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Prediction</Label>
                  <Input
                    value={tipForm.prediction}
                    onChange={(e) =>
                      setTipForm((p) => ({ ...p, prediction: e.target.value }))
                    }
                    placeholder="e.g. Manchester City Win"
                    required
                    className="h-8 text-sm"
                    data-ocid="admin.tip_prediction.input"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Reasoning</Label>
                  <Textarea
                    value={tipForm.reasoning}
                    onChange={(e) =>
                      setTipForm((p) => ({ ...p, reasoning: e.target.value }))
                    }
                    placeholder="Explain why this tip is strong..."
                    required
                    className="text-sm resize-none"
                    rows={3}
                    data-ocid="admin.tip_reasoning.textarea"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Odds</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={tipForm.odds}
                    onChange={(e) =>
                      setTipForm((p) => ({ ...p, odds: e.target.value }))
                    }
                    placeholder="2.10"
                    required
                    className="h-8 text-sm"
                    data-ocid="admin.tip_odds.input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-9 text-xs font-bold uppercase"
                  disabled={createTip.isPending}
                  style={{ backgroundColor: "oklch(var(--teal-cta))" }}
                  data-ocid="admin.create_tip.submit_button"
                >
                  {createTip.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{" "}
                      Publishing...
                    </>
                  ) : (
                    "Publish Tip"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Bets tab */}
          <TabsContent value="bets">
            <div
              className="rounded-lg border border-border overflow-hidden"
              style={{ backgroundColor: "oklch(var(--panel))" }}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">
                      Bet ID
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Event
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Selection
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Stake
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Odds
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Payout
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {betsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.bets.loading_state"
                      >
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : allBets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.bets.empty_state"
                      >
                        No bets placed yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    allBets.map((bet, i) => (
                      <TableRow
                        key={bet.id.toString()}
                        className="border-border"
                        data-ocid={`admin.bet.row.${i + 1}`}
                      >
                        <TableCell className="text-xs font-mono">
                          #{bet.id.toString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          #{bet.eventId.toString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {bet.selection}
                        </TableCell>
                        <TableCell className="text-xs">${bet.stake}</TableCell>
                        <TableCell className="text-xs">
                          {bet.odds.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs">
                          ${bet.payout.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={`text-xs font-medium ${betStatusColor(bet.status)}`}
                        >
                          {bet.status}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
