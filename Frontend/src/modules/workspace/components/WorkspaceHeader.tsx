/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../../../components/common/Button";

interface WorkspaceHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onAction,
  actionLabel = "Create",
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeader;