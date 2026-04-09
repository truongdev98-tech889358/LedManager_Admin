import type { RootState } from "@/redux/store";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";

interface IProps {
  name: string;
  permission: number;
  children: ReactNode;
}

const CheckPermission = (props: IProps) => {
  const userInfo = useSelector((state: RootState) => state.common.userInfo);
  const { name, permission, children } = props;

  const hasPermission = userInfo?.groupPermissionResponse
    ?.find((p) => p.name === name)
    ?.permissionValue?.includes(permission + "");

  return hasPermission ? children : null;
};

export default CheckPermission;
