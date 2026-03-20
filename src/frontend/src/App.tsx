import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { createContext, useContext, useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { SportsbookPage } from "./pages/SportsbookPage";
import { TipsPage } from "./pages/TipsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

interface AppState {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppStateContext = createContext<AppState>({
  activeNav: "sports",
  setActiveNav: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
});

export function useAppState() {
  return useContext(AppStateContext);
}

function RootLayout() {
  const [activeNav, setActiveNav] = useState("sports");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppStateContext.Provider
      value={{ activeNav, setActiveNav, searchQuery, setSearchQuery }}
    >
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.115 0.012 240) 0%, oklch(0.105 0.01 240) 100%)",
        }}
      >
        <Header
          activeNav={activeNav}
          onNavChange={setActiveNav}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </AppStateContext.Provider>
  );
}

function SportsbookWrapper() {
  const { searchQuery, activeNav } = useAppState();
  return <SportsbookPage searchQuery={searchQuery} activeNav={activeNav} />;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SportsbookWrapper,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const tipsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tips",
  component: TipsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute, tipsRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
