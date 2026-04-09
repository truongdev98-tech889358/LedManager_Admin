import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export const getProductById = async (id: number) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createProduct = async (data: FormData) => {
  try {
    await api.post("/api/products", data, {
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

export const updateProduct = async (id: number, data: FormData) => {
  try {

    // console.log(343433, data);
    for (const pair of data.entries()) {
        console.log('[DEBUG updateProduct]', pair[0], pair[1]);
    }

    await api.put(`/api/products/${id}`, data, {
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

export const deleteProduct = async (id: number) => {
  try {
    await api.delete(`/api/products/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};
