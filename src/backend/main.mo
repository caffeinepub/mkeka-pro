import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Int "mo:core/Int";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat "mo:core/Nat";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type Sport = {
    #Soccer;
    #Basketball;
    #Tennis;
    #NFL;
    #Esports;
  };

  public type EventStatus = {
    #Upcoming;
    #Live;
    #Closed;
    #Resolved;
  };

  public type EventOutcome = {
    #None;
    #TeamA;
    #Draw;
    #TeamB;
  };

  public type Selection = {
    #TeamA;
    #Draw;
    #TeamB;
  };

  public type BetStatus = {
    #Open;
    #Won;
    #Lost;
    #Void;
  };

  public type TipStatus = {
    #Upcoming;
    #Won;
    #Lost;
  };

  public type UserRole = AccessControl.UserRole;

  public type UserProfile = {
    balance : Float;
  };

  public type Event = {
    id : Nat;
    title : Text;
    sport : Sport;
    teamA : Text;
    teamB : Text;
    oddsA : Float;
    oddsX : Float;
    oddsB : Float;
    status : EventStatus;
    outcome : EventOutcome;
    createdAt : Int;
  };

  public type Bet = {
    id : Nat;
    user : Principal;
    eventId : Nat;
    selection : Selection;
    stake : Float;
    odds : Float;
    status : BetStatus;
    payout : Float;
    placedAt : Int;
  };

  public type Tip = {
    id : Nat;
    sport : Sport;
    match : Text;
    prediction : Text;
    reasoning : Text;
    odds : Float;
    status : TipStatus;
    createdAt : Int;
    createdBy : Principal;
  };

  public type LeaderboardEntry = {
    user : Principal;
    totalWinnings : Float;
  };

  public type EventFilter = {
    sport : ?Sport;
    status : ?EventStatus;
  };

  public type TipFilter = {
    sport : ?Sport;
    status : ?TipStatus;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Simple direct admin principal - bypasses AccessControl module complexity
  var adminPrincipal : ?Principal = null;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let events = Map.empty<Nat, Event>();
  let bets = Map.empty<Nat, Bet>();
  let tips = Map.empty<Nat, Tip>();
  let userWinnings = Map.empty<Principal, Float>();

  var nextEventId = 1;
  var nextBetId = 1;
  var nextTipId = 1;

  module LeaderboardEntry {
    public func compare(l1 : LeaderboardEntry, l2 : LeaderboardEntry) : Order.Order {
      let winningsComparison = Float.compare(l2.totalWinnings, l1.totalWinnings);
      if (winningsComparison == #equal) {
        Principal.compare(l1.user, l2.user);
      } else {
        winningsComparison;
      };
    };
  };

  func isAdminCaller(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (?p) { p == caller };
      case (null) { false };
    };
  };

  func getUser(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile = { balance = 1000.0 };
        userProfiles.add(caller, newProfile);
        newProfile;
      };
      case (?profile) { profile };
    };
  };

  func updateUserProfile(caller : Principal, profile : UserProfile) {
    userProfiles.add(caller, profile);
  };

  func getEventInternal(eventId : Nat) : Event {
    switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // claimAdmin: directly assigns caller as admin, no complex logic
  public shared ({ caller }) func claimAdmin() : async Bool {
    adminPrincipal := ?caller;
    true;
  };

  public query ({ caller }) func isCallerAdminSafe() : async Bool {
    isAdminCaller(caller);
  };

  public query ({ caller }) func getMyProfile() : async UserProfile {
    getUser(caller);
  };

  public query ({ caller }) func getEvents(filter : ?EventFilter) : async [Event] {
    var filteredEvents : Iter.Iter<Event> = events.values();
    switch (filter) {
      case (?f) {
        switch (f.sport) {
          case (?s) {
            filteredEvents := filteredEvents.filter(func(e) { e.sport == s });
          };
          case (null) { () };
        };
        switch (f.status) {
          case (?st) {
            filteredEvents := filteredEvents.filter(func(e) { e.status == st });
          };
          case (null) { () };
        };
      };
      case (null) { () };
    };
    filteredEvents.toArray();
  };

  public query ({ caller }) func getEvent(eventId : Nat) : async Event {
    getEventInternal(eventId);
  };

  public shared ({ caller }) func placeBet(eventId : Nat, selection : Selection, stake : Float) : async Nat {
    let user = getUser(caller);
    if (stake <= 0.0 or user.balance < stake) {
      Runtime.trap("Invalid stake or insufficient balance");
    };
    let event = getEventInternal(eventId);
    switch (event.status) {
      case (#Upcoming) {};
      case (#Live) {};
      case (_) { Runtime.trap("Event is not open for betting") };
    };
    let odds = switch (selection) {
      case (#TeamA) { event.oddsA };
      case (#Draw) { event.oddsX };
      case (#TeamB) { event.oddsB };
    };
    let betId = nextBetId;
    nextBetId += 1;
    let newBet : Bet = {
      id = betId;
      user = caller;
      eventId;
      selection;
      stake;
      odds;
      status = #Open;
      payout = 0.0;
      placedAt = Time.now();
    };
    bets.add(betId, newBet);
    updateUserProfile(caller, { balance = user.balance - stake });
    betId;
  };

  public query ({ caller }) func getMyBets() : async [Bet] {
    bets.values().toArray().filter(func(b) { b.user == caller });
  };

  public query ({ caller }) func getAllBets() : async [Bet] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Admin access required");
    };
    bets.values().toArray();
  };

  public shared ({ caller }) func createEvent(title : Text, sport : Sport, teamA : Text, teamB : Text, oddsA : Float, oddsX : Float, oddsB : Float) : async Nat {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Admin access required");
    };
    let eventId = nextEventId;
    nextEventId += 1;
    let newEvent : Event = {
      id = eventId;
      title;
      sport;
      teamA;
      teamB;
      oddsA;
      oddsX;
      oddsB;
      status = #Upcoming;
      outcome = #None;
      createdAt = Time.now();
    };
    events.add(eventId, newEvent);
    eventId;
  };

  public shared ({ caller }) func updateEventStatus(eventId : Nat, status : EventStatus) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Admin access required");
    };
    let event = getEventInternal(eventId);
    switch (status) {
      case (#Live) {
        if (event.status != #Upcoming) { Runtime.trap("Can only set Upcoming events to Live") };
        events.add(eventId, { event with status });
      };
      case (#Closed) {
        if (event.status != #Live) { Runtime.trap("Can only set Live events to Closed") };
        events.add(eventId, { event with status });
      };
      case (_) { Runtime.trap("Invalid status transition") };
    };
  };

  public shared ({ caller }) func resolveEvent(eventId : Nat, outcome : EventOutcome) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Admin access required");
    };
    let event = getEventInternal(eventId);
    if (event.status != #Closed) { Runtime.trap("Event must be closed before resolving") };
    let resolvedEvent = { event with status = #Resolved; outcome };
    events.add(eventId, resolvedEvent);
    let currentBets = bets.values().toArray().filter(func(b) { b.eventId == eventId });
    for (bet in currentBets.values()) {
      let (status, payout) = switch (outcome, bet.selection) {
        case (#TeamA, #TeamA) { (#Won, bet.stake * bet.odds) };
        case (#Draw, #Draw) { (#Won, bet.stake * bet.odds) };
        case (#TeamB, #TeamB) { (#Won, bet.stake * bet.odds) };
        case (_) { (#Lost, 0.0) };
      };
      bets.add(bet.id, { bet with status; payout });
      if (status == #Won) {
        switch (userProfiles.get(bet.user)) {
          case (?profile) {
            userProfiles.add(bet.user, { balance = profile.balance + payout });
          };
          case (null) {};
        };
        let currentWinnings = switch (userWinnings.get(bet.user)) {
          case (?w) { w };
          case (null) { 0.0 };
        };
        userWinnings.add(bet.user, currentWinnings + (payout - bet.stake));
      };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    userWinnings.entries().toArray().map(
      func((user, totalWinnings)) { { user; totalWinnings } }
    ).sort();
  };

  public shared ({ caller }) func adminDeposit(user : Principal, amount : Float) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Admin access required");
    };
    if (amount <= 0.0) { Runtime.trap("Amount must be positive") };
    switch (userProfiles.get(user)) {
      case (?profile) {
        userProfiles.add(user, { balance = profile.balance + amount });
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func createTip(sport : Sport, match : Text, prediction : Text, reasoning : Text, odds : Float) : async Nat {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Admin access required");
    };
    let tipId = nextTipId;
    nextTipId += 1;
    let newTip : Tip = {
      id = tipId;
      sport;
      match;
      prediction;
      reasoning;
      odds;
      status = #Upcoming;
      createdAt = Time.now();
      createdBy = caller;
    };
    tips.add(tipId, newTip);
    tipId;
  };

  public query ({ caller }) func getTips(filter : ?TipFilter) : async [Tip] {
    var filteredTips : Iter.Iter<Tip> = tips.values();
    switch (filter) {
      case (?f) {
        switch (f.sport) {
          case (?s) {
            filteredTips := filteredTips.filter(func(t) { t.sport == s });
          };
          case (null) { () };
        };
        switch (f.status) {
          case (?st) {
            filteredTips := filteredTips.filter(func(t) { t.status == st });
          };
          case (null) { () };
        };
      };
      case (null) { () };
    };
    filteredTips.toArray();
  };

  public shared ({ caller }) func updateTipStatus(tipId : Nat, status : TipStatus) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Tip not found");
    };
    switch (tips.get(tipId)) {
      case (null) { Runtime.trap("Tip not found") };
      case (?tip) {
        tips.add(tipId, { tip with status });
      };
    };
  };
};
