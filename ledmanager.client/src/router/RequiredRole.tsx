import { PageEnum } from "@/configs/constants";
import type { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface IProps {
  children: React.ReactNode;
  roles: string[];
}

const RequiredRole = (props: IProps) => {
  const { children, roles } = props;
  const userInfo = useSelector((state: RootState) => state.common.userInfo);

  console.log(4343, userInfo)

  if (!userInfo) {
    return <Navigate to={`/${PageEnum.Login}`} replace />;
  }

  const userRole = userInfo?.role;
  const hasRole = roles.includes(userRole) || userRole === "Admin" || (userInfo?.roles && userInfo.roles.some((r: string) => roles.includes(r) || r === "Admin"));

  if (!hasRole) {
    return <Navigate to={`/`} replace />;
  }

  return <>{children}</>;
};

export default RequiredRole;
