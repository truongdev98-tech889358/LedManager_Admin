import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export enum MenuType {
  HeaderVertical = 0,
  HeaderHorizontal = 1,
  Footer = 2,
  FooterBottom = 3
}

export interface IMenu {
  id: number;
  name: string;
  link?: string;
  icon?: string;
  sortOrder: number;
  type: MenuType;
  parentId?: number;
  children?: IMenu[];
  address?: string;
  phoneNumber?: string;
}

export const getMenus = async (params?: any) => {
  try {
    const response = await api.get("/api/menus", { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return { items: [], totalCount: 0 };
  }
};

export const getMenuById = async (id: number) => {
  try {
    const response = await api.get(`/api/menus/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createMenu = async (data: Partial<IMenu>) => {
  try {
    await api.post("/api/menus", data);
    toast.success(t("toast.success.add"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.add"));
    return false;
  }
};

export const updateMenu = async (id: number, data: Partial<IMenu>) => {
  try {
    await api.put(`/api/menus/${id}`, data);
    toast.success(t("toast.success.update"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.update"));
    return false;
  }
};

export const deleteMenu = async (id: number) => {
  try {
    await api.delete(`/api/menus/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};
