import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Lightbulb, Search, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useMyProfile } from "../hooks/useQueries";

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({
  activeNav,
  onNavChange,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useMyProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const navLinks = [
    { id: "sports", label: "SPORTS", route: null },
    { id: "live", label: "LIVE BETTING", route: null },
    { id: "tips", label: "TIPS", route: "/tips" },
    { id: "promotions", label: "PROMOTIONS", route: null },
    { id: "esports", label: "ESPORTS", route: null },
    { id: "news", label: "NEWS", route: null },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: "oklch(var(--header-bg))",
        borderColor: "oklch(var(--border))",
      }}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-1 shrink-0 mr-2"
          data-ocid="header.link"
        >
          <span className="text-lg font-black tracking-tighter">
            <span className="text-primary">MKEKA</span>
            <span className="text-foreground"> PRO</span>
          </span>
        </Link>

        {/* Search */}
        <div className="relative w-40 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/50 border-border"
            data-ocid="header.search_input"
          />
        </div>

        {/* Nav links */}
        <nav
          className="hidden lg:flex items-center gap-0.5 flex-1"
          data-ocid="header.nav"
        >
          {navLinks.map((link) =>
            link.route ? (
              <Link
                key={link.id}
                to={link.route as "/tips"}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold tracking-wide rounded transition-colors ${
                  activeNav === link.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onNavChange(link.id)}
                data-ocid={`header.${link.id}.link`}
              >
                {link.id === "tips" && <Lightbulb className="h-3 w-3" />}
                {link.label}
              </Link>
            ) : (
              <button
                type="button"
                key={link.id}
                onClick={() => onNavChange(link.id)}
                className={`px-3 py-1 text-xs font-semibold tracking-wide rounded transition-colors ${
                  activeNav === link.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`header.${link.id}.tab`}
              >
                {link.label}
              </button>
            ),
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {identity && profile != null && (
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
              Balance:{" "}
              <span className="text-primary font-bold">
                $
                {(profile.balance ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </span>
          )}

          {identity ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    data-ocid="header.open_modal_button"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border"
                >
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => navigate({ to: "/admin" })}
                      className="cursor-pointer"
                      data-ocid="header.admin.link"
                    >
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={clear}
                    className="cursor-pointer text-destructive"
                    data-ocid="header.logout.button"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="header.deposit.button"
              >
                Deposit
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="header.login.button"
            >
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
