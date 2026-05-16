import React from "react";
import HierarchyUserCard from "./HierarchyUserCard";
import type { ProjectHierarchyNodeDto } from "../../../types/projectHierarchy";

interface HierarchyTreeProps {
  nodes: ProjectHierarchyNodeDto[];
  isLoading: boolean;
  onUserClick: (userId: number) => void;
  level?: number;
}

const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  nodes,
  isLoading,
  onUserClick,
  level = 0,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="spinner-gradient" />
        <p className="text-[13px] text-slate-400 font-medium">Loading hierarchy…</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-semibold text-slate-900">
          No Team Members Found
        </h2>
        <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
          No hierarchy data available for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-6">
        {nodes.map((node) => (
          <div key={node.userId} className="flex flex-col items-center">
            {/* Vertical connector from parent */}
            {level > 0 && <div className="w-px h-5 bg-gradient-to-b from-slate-400 to-slate-300 mb-1" />}

            {/* Connection dot */}
            {level > 0 && <div className="w-2 h-2 rounded-full bg-slate-400 mb-4 shadow-md" />}

            {/* User card */}
            <HierarchyUserCard
              node={node}
              onUserClick={onUserClick}
            />

            {/* Children recursively */}
            {node.children && node.children.length > 0 && (
              <div className="mt-8">
                {/* Horizontal line from parent */}
                <div className="h-px bg-slate-300 w-full max-w-4xl mx-auto relative mb-6">
                  <div className="absolute top-1/2 left-0 w-2 h-2 bg-slate-400 rounded-full -translate-x-1 -translate-y-1/2" />
                  <div className="absolute top-1/2 right-0 w-2 h-2 bg-slate-400 rounded-full translate-x-1 -translate-y-1/2" />
                </div>

                <HierarchyTree
                  nodes={node.children}
                  isLoading={false}
                  onUserClick={onUserClick}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HierarchyTree;