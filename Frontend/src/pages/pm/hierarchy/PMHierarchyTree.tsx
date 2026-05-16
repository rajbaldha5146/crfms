import { useNavigate } from "react-router-dom";
import type { HierarchyNodeDto } from "../../../types/hierarchy";

interface Props {
  node: HierarchyNodeDto;
}

const PMHierarchyTree = ({ node }: Props) => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center">
      {/* Card */}

      <div
        onClick={() => navigate(`/pm-users/${node.userId}`)}
        className="w-72 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md"
      >
        <div>
          <h3 className="text-sm font-bold text-slate-900">{node.fullName}</h3>

          <p className="text-xs text-slate-500 mt-1">{node.role}</p>

          {node.reportingPersonName && (
            <div className="mt-3 text-[11px] text-slate-500">
              Reports to{" "}
              <span className="font-semibold text-slate-700">
                {node.reportingPersonName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Children */}

      {node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-slate-300" />

          <div className="flex flex-wrap justify-center gap-6">
            {node.children.map((child) => (
              <PMHierarchyTree key={child.userId} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PMHierarchyTree;
