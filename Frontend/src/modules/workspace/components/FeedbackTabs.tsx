import React from "react";

interface FeedbackTabsProps {
  activeTab: "open" | "resolved";
  openCount: number;
  resolvedCount: number;
  onTabChange: (tab: "open" | "resolved") => void;
}

const FeedbackTabs: React.FC<FeedbackTabsProps> = ({
  activeTab,
  openCount,
  resolvedCount,
  onTabChange,
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        Filter:
      </p>
      <div className="flex gap-2">
        {/* Open Tab */}
        <button
          onClick={() => onTabChange("open")}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === "open"
              ? "bg-slate-900 text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          Open ({openCount})
        </button>

        {/* Resolved Tab */}
        <button
          onClick={() => onTabChange("resolved")}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === "resolved"
              ? "bg-slate-900 text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>
    </div>
  );
};

export default FeedbackTabs;