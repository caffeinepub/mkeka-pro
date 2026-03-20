import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    user: Principal;
    totalWinnings: number;
}
export interface Bet {
    id: bigint;
    status: BetStatus;
    eventId: bigint;
    odds: number;
    user: Principal;
    stake: number;
    selection: Selection;
    placedAt: bigint;
    payout: number;
}
export interface Event {
    id: bigint;
    status: EventStatus;
    teamA: string;
    teamB: string;
    title: string;
    oddsA: number;
    oddsB: number;
    oddsX: number;
    createdAt: bigint;
    sport: Sport;
    outcome: EventOutcome;
}
export interface EventFilter {
    status?: EventStatus;
    sport?: Sport;
}
export interface UserProfile {
    balance: number;
}
export enum BetStatus {
    Won = "Won",
    Lost = "Lost",
    Open = "Open",
    Void = "Void"
}
export enum EventOutcome {
    Draw = "Draw",
    None = "None",
    TeamA = "TeamA",
    TeamB = "TeamB"
}
export enum EventStatus {
    Live = "Live",
    Closed = "Closed",
    Resolved = "Resolved",
    Upcoming = "Upcoming"
}
export enum Selection {
    Draw = "Draw",
    TeamA = "TeamA",
    TeamB = "TeamB"
}
export enum Sport {
    NFL = "NFL",
    Basketball = "Basketball",
    Tennis = "Tennis",
    Soccer = "Soccer",
    Esports = "Esports"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminDeposit(user: Principal, amount: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEvent(title: string, sport: Sport, teamA: string, teamB: string, oddsA: number, oddsX: number, oddsB: number): Promise<bigint>;
    getAllBets(): Promise<Array<Bet>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(eventId: bigint): Promise<Event>;
    getEvents(filter: EventFilter | null): Promise<Array<Event>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMyBets(): Promise<Array<Bet>>;
    getMyProfile(): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeBet(eventId: bigint, selection: Selection, stake: number): Promise<bigint>;
    resolveEvent(eventId: bigint, outcome: EventOutcome): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEventStatus(eventId: bigint, status: EventStatus): Promise<void>;
}
