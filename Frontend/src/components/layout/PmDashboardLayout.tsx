import { useState, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import PmSidebar from "./PmSidebar";
import Header from "./Header";
import { PmLayoutContext } from "../../contexts/PmLayoutContext";

const PmDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageTitle, setPageTitleState] = useState({ title: "", subtitle: "" });

  const toggle = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const setTitle = useCallback((title: string, subtitle?: string) => {
    setPageTitleState((prev) => {
      const newSubtitle = subtitle ?? "";
      if (prev.title === title && prev.subtitle === newSubtitle) {
        return prev; // Prevent unnecessary state updates
      }
      return { title, subtitle: newSubtitle };
    });
  }, []);

  const contextValue = useMemo(
    () => ({ isPmLayout: true, toggle, setTitle }),
    [toggle, setTitle]
  );

  return (
    <PmLayoutContext.Provider value={contextValue}>
      {/* ── Fixed full-width header — never affected by sidebar ── */}
      <Header
        title={pageTitle.title}
        subtitle={pageTitle.subtitle}
        onMenuClick={toggle}
        isLayoutHeader={true}
      />

      {/* ── Body row: sidebar + scrollable content (below header) ── */}
      <div className="flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

        {/* Sidebar with smooth slide transition */}
        <div
          className="shrink-0 overflow-hidden bg-white border-r border-slate-200 transition-all duration-300 ease-in-out"
          style={{ width: sidebarOpen ? "240px" : "0px" }}
        >
          <div className="w-60 h-full">
            <PmSidebar />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </PmLayoutContext.Provider>
  );
};

export default PmDashboardLayout;