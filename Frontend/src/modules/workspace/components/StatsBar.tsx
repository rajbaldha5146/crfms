import React from "react";
import { Users, Clock, CheckCircle2 } from "lucide-react";

interface StatsBarProps {
  members: number;
  openFeedbacks: number;
  resolvedFeedbacks: number;
}

const StatsBar: React.FC<StatsBarProps> = ({
  members,
  openFeedbacks,
  resolvedFeedbacks,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-slate-100">
        {/* Members */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Users size={20} className="text-slate-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Members
            </p>
            <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
              {members}
            </p>
          </div>
        </div>

        {/* Open */}
        <div className="flex items-center gap-4 md:pl-6">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Open Feedbacks
            </p>
            <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
              {openFeedbacks}
            </p>
          </div>
        </div>

        {/* Resolved */}
        <div className="flex items-center gap-4 md:pl-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Resolved Feedbacks
            </p>
            <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
              {resolvedFeedbacks}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;