import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Bet,
  BetStatus,
  type Event,
  type EventFilter,
  EventOutcome,
  EventStatus,
  type LeaderboardEntry,
  Selection,
  Sport,
  type UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

export type { Event, Bet, UserProfile, EventFilter, LeaderboardEntry };
export { BetStatus, EventStatus, EventOutcome, Selection, Sport, UserRole };

// Tip types (backend extension)
export type TipSport = "Soccer" | "Basketball" | "Tennis" | "NFL" | "Esports";
export type TipStatus = "Upcoming" | "Won" | "Lost";
export interface Tip {
  id: bigint;
  sport: TipSport;
  match: string;
  prediction: string;
  reasoning: string;
  odds: number;
  status: TipStatus;
  createdAt: bigint;
  createdBy: Principal;
}
export interface TipFilter {
  sport?: TipSport;
  status?: TipStatus;
}

function encodeSport(s: TipSport): object {
  return { [s]: null };
}
function encodeStatus(s: TipStatus): object {
  return { [s]: null };
}
function decodeSport(s: object): TipSport {
  return Object.keys(s)[0] as TipSport;
}
function decodeStatus(s: object): TipStatus {
  return Object.keys(s)[0] as TipStatus;
}
function decodeTip(raw: any): Tip {
  return {
    id: raw.id,
    sport: decodeSport(raw.sport),
    match: raw.match,
    prediction: raw.prediction,
    reasoning: raw.reasoning,
    odds: raw.odds,
    status: decodeStatus(raw.status),
    createdAt: raw.createdAt,
    createdBy: raw.createdBy,
  };
}

export function useTips(filter?: TipFilter) {
  const { actor, isFetching } = useActor();
  return useQuery<Tip[]>({
    queryKey: ["tips", filter],
    queryFn: async () => {
      if (!actor) return [];
      const encoded = filter
        ? [
            {
              sport: filter.sport ? [encodeSport(filter.sport)] : [],
              status: filter.status ? [encodeStatus(filter.status)] : [],
            },
          ]
        : [];
      const raw = await (actor as any).getTips(encoded);
      return (raw as any[]).map(decodeTip);
    },
    enabled: !isFetching,
  });
}

export function useCreateTip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      sport: TipSport;
      match: string;
      prediction: string;
      reasoning: string;
      odds: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createTip(
        encodeSport(data.sport),
        data.match,
        data.prediction,
        data.reasoning,
        data.odds,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tips"] }),
  });
}

export function useUpdateTipStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tipId,
      status,
    }: { tipId: bigint; status: TipStatus }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateTipStatus(tipId, encodeStatus(status));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tips"] }),
  });
}

export function useEvents(filter: EventFilter | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEvents(filter);
    },
    enabled: !isFetching,
  });
}

export function useMyBets() {
  const { actor, isFetching } = useActor();
  return useQuery<Bet[]>({
    queryKey: ["myBets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).claimAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useAllBets() {
  const { actor, isFetching } = useActor();
  return useQuery<Bet[]>({
    queryKey: ["allBets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceBet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      selection,
      stake,
    }: {
      eventId: bigint;
      selection: Selection;
      stake: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeBet(eventId, selection, stake);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBets"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      sport: Sport;
      teamA: string;
      teamB: string;
      oddsA: number;
      oddsX: number;
      oddsB: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEvent(
        data.title,
        data.sport,
        data.teamA,
        data.teamB,
        data.oddsA,
        data.oddsX,
        data.oddsB,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEventStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      status,
    }: {
      eventId: bigint;
      status: EventStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEventStatus(eventId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useResolveEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      outcome,
    }: {
      eventId: bigint;
      outcome: EventOutcome;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.resolveEvent(eventId, outcome);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useAdminDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      amount,
    }: { user: Principal; amount: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminDeposit(user, amount);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myProfile"] }),
  });
}
