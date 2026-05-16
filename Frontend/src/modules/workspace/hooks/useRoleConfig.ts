import { useMemo } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { getRoleConfig, type UserRole, type RoleConfig } from "../config/roleConfig";

export const useRoleConfig = (): RoleConfig => {
  const { user } = useAuthStore();
//   console.log(user);
  
  return useMemo(() => {
    // Maps the exact role strings the backend sends (RoleName enum .ToString())
    // Backend RoleName enum: Admin, Pm, Tl, SeniorDeveloper, JuniorDeveloper
    const roleMap: Record<string, UserRole> = {
      Pm: "PM",
      pm: "PM",
      Tl: "TL",
      tl: "TL",
      SeniorDeveloper: "SeniorDeveloper",
      seniordeveloper: "SeniorDeveloper",
      JuniorDeveloper: "JuniorDeveloper", 
      juniordeveloper: "JuniorDeveloper",
    };

    const userRole = user?.role;
    const configRole = userRole ? roleMap[userRole] ?? roleMap[userRole.toLowerCase()] : undefined;

    if (userRole && !configRole) {
      console.warn(`[useRoleConfig] Unmapped role from backend: "${userRole}"`);
    }

    return getRoleConfig(configRole);
  }, [user?.role]);
};