import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

// Article APIs
export const getArticleById = async (id: number) => {
    try {
        const response = await api.get(`/api/articles/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const createArticle = async (formData: FormData) => {
    try {
        await api.post("/api/articles", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success(t("toast.success.add"));
        return true;
    } catch (error) {
        console.error(error);
        toast.error(t("toast.error.add"));
        return false;
    }
}

export const updateArticle = async (id: number, formData: FormData) => {
    try {
        await api.put(`/api/articles/${id}`, formData, {
             headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success(t("toast.success.update"));
        return true;
    } catch (error) {
        console.error(error);
        toast.error(t("toast.error.update"));
        return false;
    }
}

export const deleteArticle = async (id: number) => {
  try {
    await api.delete(`/api/articles/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};

// Article Category APIs
export const getArticleCategories = async () => {
    // Assuming backend supports simple list or we use paged and get all
     try {
        const response = await api.get(`/api/articlecategories?pageIndex=1&pageSize=100`);
        return response.data;
    } catch (error) {
        console.error(error);
        return { items: [], totalCount: 0 };
    }
}

export const createArticleCategory = async (data: any) => {
    try {
        await api.post("/api/articlecategories", data);
        toast.success(t("toast.success.add"));
        return true;
    } catch (error) {
        console.error(error);
        toast.error(t("toast.error.add"));
        return false;
    }
}

export const updateArticleCategory = async (id: number, data: any) => {
    try {
        await api.put(`/api/articlecategories/${id}`, data);
        toast.success(t("toast.success.update"));
        return true;
    } catch (error) {
        console.error(error);
        toast.error(t("toast.error.update"));
        return false;
    }
}

export const deleteArticleCategory = async (id: number) => {
    try {
        await api.delete(`/api/articlecategories/${id}`);
        toast.success(t("toast.success.delete"));
        return true;
    } catch (error) {
        console.error(error);
        toast.error(t("toast.error.delete"));
        return false;
    }
}

