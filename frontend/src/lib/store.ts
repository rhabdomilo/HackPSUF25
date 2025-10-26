import { create } from "zustand";
import type { Category, Market } from "./types";

export type PanelType =
  | "overview"
  | "ladder"
  | "chart"
  | "tape"
  | "search"
  | "quote"
  | "watchlist"
  | "news"
  | "alerts";

export interface Panel {
  id: string;
  type: PanelType;
  title: string;
  marketId?: string;
  config?: Record<string, any>;
}

interface TerminalState {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  panels: Panel[];
  addPanel: (panel: Omit<Panel, "id">) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;

  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  selectedCategory: "All",
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),

  panels: [],
  addPanel: (panel) =>
    set((state) => ({
      panels: [...state.panels, { ...panel, id: `panel-${Date.now()}-${Math.random()}` }],
    })),
  removePanel: (id) =>
    set((state) => ({
      panels: state.panels.filter((p) => p.id !== id),
    })),
  updatePanel: (id, updates) =>
    set((state) => ({
      panels: state.panels.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: newTheme };
    }),
}));
