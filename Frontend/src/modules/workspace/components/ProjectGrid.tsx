import React from "react";
import ProjectCard from "./ProjectCard";
import type { ProjectCardDto } from "../../../types/project";

interface ProjectGridProps {
  projects: ProjectCardDto[];
  isLoading: boolean;
  onProjectClick: (projectId: number) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  isLoading,
  onProjectClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="spinner-gradient" />
        <p className="text-[13px] text-slate-400 font-medium">Loading projects…</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-semibold text-slate-900">
          No Projects Found
        </h2>
        <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
          You don't have any projects yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onProjectClick(project.id)}
          className="cursor-pointer"
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
};

export default ProjectGrid;