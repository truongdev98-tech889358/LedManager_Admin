import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export const getBanners = async (params?: any) => {
  try {
    const response = await api.get("/api/banners", { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return { items: [], totalCount: 0 };
  }
};

export const getBannerById = async (id: number) => {
  try {
    const response = await api.get(`/api/banners/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createBanner = async (formData: FormData) => {
  try {
    await api.post("/api/banners", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success(t("toast.success.add"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.add"));
    return false;
  }
};

export const updateBanner = async (id: number, formData: FormData) => {
  try {
    await api.put(`/api/banners/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success(t("toast.success.update"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.update"));
    return false;
  }
};

export const deleteBanner = async (id: number) => {
  try {
    await api.delete(`/api/banners/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};
