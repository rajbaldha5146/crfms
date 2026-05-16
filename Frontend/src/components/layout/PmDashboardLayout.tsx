import {
    Outlet,
  } from "react-router-dom";
import PmSidebar from "./PmSidebar";
  
  
  const PmDashboardLayout = () => {
  
    return (
      <div className="
        h-screen
        flex
        bg-slate-50
        overflow-hidden
      ">
  
        <PmSidebar />
  
        <main className="
          flex-1
          overflow-y-auto
        ">
          <Outlet />
        </main>
      </div>
    );
  };
  
  export default PmDashboardLayout;