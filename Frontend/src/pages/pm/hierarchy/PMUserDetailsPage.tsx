import {
    ArrowLeft,
    Briefcase,
    Building2,
    Mail,
    Phone,
    ShieldCheck,
    User2,
    Users,
  } from "lucide-react";
  
  import { useEffect, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  
  import Header from "../../../components/layout/Header";
  import { getPmUserDetails } from "../../../api/pmHierarchyApi";
  import { useUIStore } from "../../../store/useUIStore";
  
  import type { PmUserDetailsDto } from "../../../types/pmUser";
  
  const PMUserDetailsPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const setGlobalLoading = useUIStore((state) => state.loading);
  
    const [user, setUser] = useState<PmUserDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const load = async () => {
        try {
          setGlobalLoading(true);
          setLoading(true);
          const response = await getPmUserDetails(Number(userId));
          setUser(response);
        } catch (error) {
          console.error("Failed to load user details", error);
        } finally {
          setLoading(false);
          setGlobalLoading(false);
        }
      };
  
      load();
    }, [userId, setGlobalLoading]);
  
    return (
      <div className="min-h-screen bg-slate-50">
        <Header
          title={user?.fullName ?? "Employee Details"}
          subtitle="Employee profile and reporting details"
        />
  
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            </div>
  
            {/* Loading State */}
            {loading && !user && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                    <Users size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-slate-900">
                    Loading Employee Details...
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-2">
                    Please wait while we fetch the information.
                  </p>
                </div>
              </div>
            )}
  
            {/* Content */}
            {user && (
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                {/* Profile Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[36px] font-black">
                      {user.fullName[0]}
                    </div>
  
                    {/* Name & Role */}
                    <h2 className="mt-5 text-[22px] font-bold text-slate-900">
                      {user.fullName}
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-500">{user.role}</p>
  
                    {/* Status Badge */}
                    <div className="mt-5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      {user.status}
                    </div>
  
                    {/* Divider */}
                    <div className="w-full h-px bg-slate-200 my-6" />
  
                    {/* Quick Stats */}
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-500">Department</span>
                        <span className="font-semibold text-slate-900">
                          {user.department}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-500">Experience</span>
                        <span className="font-semibold text-slate-900">
                          {user.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Details Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="mb-6">
                    <h3 className="text-[18px] font-semibold text-slate-900">
                      Employee Information
                    </h3>
                    <p className="text-[13px] text-slate-500 mt-1">
                      Complete profile and contact details
                    </p>
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard
                      icon={<Mail size={16} />}
                      label="Email Address"
                      value={user.email}
                    />
  
                    <DetailCard
                      icon={<Phone size={16} />}
                      label="Mobile Number"
                      value={user.mobileNumber}
                    />
  
                    <DetailCard
                      icon={<Building2 size={16} />}
                      label="Department"
                      value={user.department}
                    />
  
                    <DetailCard
                      icon={<Briefcase size={16} />}
                      label="Experience"
                      value={user.experience}
                    />
  
                    <DetailCard
                      icon={<ShieldCheck size={16} />}
                      label="Reporting Person"
                      value={user.reportingPersonName || "N/A"}
                    />
  
                    <DetailCard
                      icon={<User2 size={16} />}
                      label="Role"
                      value={user.role}
                    />
                  </div>
                </div>
              </div>
            )}
  
            {/* Error State (optional) */}
            {!loading && !user && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                    <Users size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-slate-900">
                    Employee Not Found
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-2">
                    The requested employee details could not be loaded.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };
  
  // Detail Card Component
  const DetailCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-slate-500 mb-2">
          {icon}
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            {label}
          </span>
        </div>
        <div className="text-[13px] font-semibold text-slate-900 break-words">
          {value}
        </div>
      </div>
    );
  };
  
  export default PMUserDetailsPage;