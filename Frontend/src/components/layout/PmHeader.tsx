/**
 * PmHeader — drop-in replacement for <Header> inside PM pages.
 * Automatically wires up the sidebar toggle from PmDashboardLayout context.
 * Usage: same props as Header (title, subtitle)
 */
import { useEffect } from "react";
import { usePmLayout } from "../../contexts/PmLayoutContext";

interface PmHeaderProps {
  title: string;
  subtitle?: string;
}

const PmHeader = ({ title, subtitle }: PmHeaderProps) => {
  const { setTitle } = usePmLayout();

  useEffect(() => {
    setTitle(title, subtitle);
  }, [title, subtitle, setTitle]);

  return null;
};

export default PmHeader;
