import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export const getProductFeatures = (params: any) => {
  return api.get("/api/product-features", { params }).then(res => res.data);
};

export const getProductFeatureById = async (id: number) => {
  try {
    const response = await api.get(`/api/product-features/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createProductFeature = async (data: FormData) => {
  try {
    await api.post("/api/product-features", data, {
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

export const updateProductFeature = async (id: number, data: FormData) => {
  try {
    await api.put(`/api/product-features/${id}`, data, {
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

export const deleteProductFeature = async (id: number) => {
  try {
    await api.delete(`/api/product-features/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};
