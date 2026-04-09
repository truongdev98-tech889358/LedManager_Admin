import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export const getCategories = async (params?: any) => {
  try {
    const response = await api.get("/api/categories", { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return { items: [], totalCount: 0 };
  }
};

export const getCategoryById = async (id: number) => {
  try {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createCategory = async (data: any) => {
  try {
    await api.post("/api/categories", data);
    toast.success(t("toast.success.add"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.add"));
    return false;
  }
};

export const updateCategory = async (id: number, data: any) => {
  try {
    await api.put(`/api/categories/${id}`, data);
    toast.success(t("toast.success.update"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.update"));
    return false;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    await api.delete(`/api/categories/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};
