/**
 * PmLayoutContext
 * Extracted to its own file to avoid circular imports:
 *   PmDashboardLayout -> Header -> PmDashboardLayout (would be circular)
 */
import { createContext, useContext } from "react";

interface PmLayoutContextValue {
  isPmLayout: boolean;
  toggle: () => void;
  setTitle: (title: string, subtitle?: string) => void;
}

export const PmLayoutContext = createContext<PmLayoutContextValue>({
  isPmLayout: false,
  toggle: () => {},
  setTitle: () => {},
});

export const usePmLayout = () => useContext(PmLayoutContext);
