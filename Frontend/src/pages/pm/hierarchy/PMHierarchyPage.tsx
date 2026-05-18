import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { ArrowRightLeft, Sparkles, Users } from "lucide-react";

import {
  changeReportingPerson,
  getPmHierarchy,
} from "../../../api/pmHierarchyApi";
import PmHeader from "../../../components/layout/PmHeader";

import type { HierarchyNodeDto } from "../../../types/hierarchy";

import { useUIStore } from "../../../store/useUIStore";
import PMHierarchyTree from "./PMHierarchyTree";

const PMHierarchyPage = () => {
  const [hierarchy, setHierarchy] = useState<HierarchyNodeDto | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedReportingPersonId, setSelectedReportingPersonId] =
    useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useUIStore();

  // Load Hierarchy
  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const response = await getPmHierarchy();
      setHierarchy(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, []);

  // Flatten Users
  const flattenUsers = (node: HierarchyNodeDto): HierarchyNodeDto[] => {
    return [node, ...node.children.flatMap(flattenUsers)];
  };

  const allUsers = useMemo(() => {
    if (!hierarchy) {
      return [];
    }
    return flattenUsers(hierarchy);
  }, [hierarchy]);

  // Select Options
  const userOptions = allUsers.map((user) => ({
    value: user.userId,
    label: `${user.fullName} (${user.role})`,
  }));

  // Update Reporting
  const handleUpdate = async () => {
    if (!selectedEmployeeId || !selectedReportingPersonId) {
      return;
    }

    if (selectedEmployeeId === selectedReportingPersonId) {
      showToast("Employee cannot report to themselves", "error");
      return;
    }

    try {
      setLoading(true);
      await changeReportingPerson(
        Number(selectedEmployeeId),
        Number(selectedReportingPersonId)
      );
      showToast("Reporting structure updated successfully", "success");
      setSelectedEmployeeId("");
      setSelectedReportingPersonId("");
      await loadHierarchy();
    } finally {
      setLoading(false);
    }
  };

  const reportingPersonOptions = userOptions.filter(
    (x) => x.value !== Number(selectedEmployeeId)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PmHeader
        title="Team Hierarchy"
        subtitle="Manage reporting structure, reorganize teams, and visualize your complete engineering hierarchy"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Total Employees
                  </p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                    {allUsers.length}
                  </p>
                </div>
              </div>
            </div>

            {/* <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Active PM
                  </p>
                  <p className="text-[15px] font-bold text-slate-900 leading-none mt-1">
                    {hierarchy?.fullName || "Loading..."}
                  </p>
                </div>
              </div>
            </div> */}
          </div>

          {/* Change Reporting Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-slate-500" />
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    Change Reporting Person
                  </h2>
                </div>
                <p className="text-[13px] text-slate-500 mt-1">
                  Instantly reorganize your hierarchy structure
                </p>
              </div>

              {/* Preview */}
              {selectedEmployeeId && selectedReportingPersonId && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-700">
                    <span>
                      {
                        allUsers.find(
                          (x) => x.userId === Number(selectedEmployeeId)
                        )?.fullName
                      }
                    </span>
                    <ArrowRightLeft size={14} />
                    <span>
                      {
                        allUsers.find(
                          (x) => x.userId === Number(selectedReportingPersonId)
                        )?.fullName
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_220px] gap-4">
              {/* Employee */}
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Employee
                </label>
                <Select
                  options={userOptions}
                  placeholder="Search employee..."
                  value={
                    userOptions.find(
                      (x) => x.value === Number(selectedEmployeeId)
                    ) || null
                  }
                  onChange={(selected) => {
                    const newId = selected?.value.toString() || "";
                    setSelectedEmployeeId(newId);
                    if (newId === selectedReportingPersonId) {
                      setSelectedReportingPersonId("");
                    }
                  }}
                  className="text-[13px]"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Reporting Person */}
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  New Reporting Person
                </label>
                <Select
                  options={reportingPersonOptions}
                  placeholder="Search reporting person..."
                  value={
                    reportingPersonOptions.find(
                      (x) => x.value === Number(selectedReportingPersonId)
                    ) || null
                  }
                  onChange={(selected) =>
                    setSelectedReportingPersonId(
                      selected?.value.toString() || ""
                    )
                  }
                  className="text-[13px]"
                  classNamePrefix="react-select"
                  isDisabled={!selectedEmployeeId}
                />
              </div>

              {/* Button */}
              <div className="flex items-end">
                <button
                  onClick={handleUpdate}
                  disabled={
                    !selectedEmployeeId || !selectedReportingPersonId || loading
                  }
                  className="
                    h-[38px]
                    w-full
                    rounded-xl
                    bg-slate-900
                    text-[13px]
                    font-bold
                    text-white
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>

          {/* Tree */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-slate-900">
                Organization Tree
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Real-time reporting hierarchy visualization
              </p>
            </div>

            <div className="overflow-x-auto">
              {hierarchy ? (
                <div className="min-w-max py-4">
                  <PMHierarchyTree node={hierarchy} />
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                    <Users size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-slate-900">
                    Loading Hierarchy...
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMHierarchyPage;
