import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export interface ISystemConfig {
  id: number;
  configKey: string;
  configValue: string;
  description?: string;
}

export const getSystemConfigs = async (params?: any) => {
  try {
    const response = await api.get("/api/systemconfigs", { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return { items: [], totalCount: 0 };
  }
};

export const getSystemConfigByKey = async (key: string) => {
  try {
    const response = await api.get("/api/systemconfigs", { params: { keyword: key } });
    const config = response.data?.items?.find((x: ISystemConfig) => x.configKey === key);
    return config || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createSystemConfig = async (data: Partial<ISystemConfig>) => {
  try {
    await api.post("/api/systemconfigs", data);
    toast.success(t("toast.success.add"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.add"));
    return false;
  }
};

export const updateSystemConfig = async (id: number, data: Partial<ISystemConfig>) => {
  try {
    await api.put(`/api/systemconfigs/${id}`, data);
    toast.success(t("toast.success.update"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.update"));
    return false;
  }
};

export const deleteSystemConfig = async (id: number) => {
  try {
    await api.delete(`/api/systemconfigs/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};
