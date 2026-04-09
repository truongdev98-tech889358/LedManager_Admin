import api from "@/services";
import { toast } from "react-toastify";
import { t } from "i18next";

export interface IHomePageContent {
  id: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  featuresTitle?: string;
  featuresDescription?: string;
  featuresJson?: string;
  faqPart1Title?: string;
  faqPart1Description?: string;
  faqPart1Json?: string;
  faqPart2Title?: string;
  faqPart2Description?: string;
  faqPart2Json?: string;
  trustBrandsTitle?: string;
  trustBrandsDescription?: string;
  trustBrandsJson?: string;
  howItWorksTitle?: string;
  howItWorksDescription?: string;
  howItWorksVideoUrl?: string;
  howItWorksStepsJson?: string;
  isActive: boolean;
}

export const getHomePageContents = async (params?: any) => {
  try {
    const response = await api.get("/api/homepagecontent", { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return { items: [], totalCount: 0 };
  }
};

export const getHomePageContentById = async (id: number) => {
  try {
    const response = await api.get(`/api/homepagecontent/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createHomePageContent = async (data: Partial<IHomePageContent>) => {
  try {
    await api.post("/api/homepagecontent", data);
    toast.success(t("toast.success.add"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.add"));
    return false;
  }
};

export const updateHomePageContent = async (id: number, data: Partial<IHomePageContent>) => {
  try {
    await api.put(`/api/homepagecontent/${id}`, data);
    toast.success(t("toast.success.update"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.update"));
    return false;
  }
};

export const deleteHomePageContent = async (id: number) => {
  try {
    await api.delete(`/api/homepagecontent/${id}`);
    toast.success(t("toast.success.delete"));
    return true;
  } catch (error) {
    console.error(error);
    toast.error(t("toast.error.delete"));
    return false;
  }
};

export const getActiveHomePageContent = async () => {
    try {
        const response = await api.get("/api/homepagecontent/active");
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
