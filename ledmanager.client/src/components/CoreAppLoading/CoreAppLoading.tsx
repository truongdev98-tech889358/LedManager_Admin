import type { RootState } from "@/redux/store";
import { Spin } from "antd";
import { useSelector } from "react-redux";

const CoreAppLoading = () => {
  const loading = useSelector((state: RootState) => state.common.loading);
  
  return (
    Object.values(loading).some((v) => v) && (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/50 backdrop-blur-[4px]">
        <Spin size="large" />
      </div>
    )
  );
};

export default CoreAppLoading;
