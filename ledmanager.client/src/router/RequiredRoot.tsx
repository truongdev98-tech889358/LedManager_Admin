import { PageEnum } from "@/configs/constants";
import type { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface IProps {
  children: React.ReactNode;
}

const RequiredRoot = (props: IProps) => {
  const { children } = props;
  const userInfo = useSelector((state: RootState) => state.common.userInfo);

  if (!userInfo) {
    return children;
  }

  if (!userInfo?.isRootCustomer) {
    return <Navigate to={`/${PageEnum.NotFound}`} replace />;
  }

  return children;
};

export default RequiredRoot;
