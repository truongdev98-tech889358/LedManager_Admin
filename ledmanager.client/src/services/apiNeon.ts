import api from "./index";

export interface NeonFont {
  id: number;
  name: string;
  value: string;
  displayOrder: number;
  isActive: boolean;
}

export interface NeonColor {
  id: number;
  name: string;
  hexCode: string;
  glowCode: string;
  displayOrder: number;
  isActive: boolean;
}

export interface NeonBackground {
  id: number;
  name: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export enum NeonContentType {
  Intro = 0,
  Feature = 1,
  Faq = 2
}

export interface NeonContent {
  id: number;
  type: string; // "Intro", "Feature", "Faq"
  title: string;
  content: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export const neonApi = {
  // Fonts
  getFonts: () => api.get<NeonFont[]>("/api/admin/neon/fonts"),
  createFont: (data: Partial<NeonFont>) => api.post<NeonFont>("/api/admin/neon/fonts", data),
  updateFont: (id: number, data: Partial<NeonFont>) => api.put<NeonFont>(`/api/admin/neon/fonts/${id}`, data),
  deleteFont: (id: number) => api.delete(`/api/admin/neon/fonts/${id}`),

  // Colors
  getColors: () => api.get<NeonColor[]>("/api/admin/neon/colors"),
  createColor: (data: Partial<NeonColor>) => api.post<NeonColor>("/api/admin/neon/colors", data),
  updateColor: (id: number, data: Partial<NeonColor>) => api.put<NeonColor>(`/api/admin/neon/colors/${id}`, data),
  deleteColor: (id: number) => api.delete(`/api/admin/neon/colors/${id}`),

  // Backgrounds
  getBackgrounds: () => api.get<NeonBackground[]>("/api/admin/neon/backgrounds"),
  createBackground: (data: Partial<NeonBackground>) => api.post<NeonBackground>("/api/admin/neon/backgrounds", data),
  updateBackground: (id: number, data: Partial<NeonBackground>) => api.put<NeonBackground>(`/api/admin/neon/backgrounds/${id}`, data),
  deleteBackground: (id: number) => api.delete(`/api/admin/neon/backgrounds/${id}`),

  // Content
  getContents: () => api.get<NeonContent[]>("/api/admin/neon/content"),
  createContent: (data: Partial<NeonContent> & { type: number }) => api.post<NeonContent>("/api/admin/neon/content", data),
  updateContent: (id: number, data: Partial<NeonContent> & { type: number }) => api.put<NeonContent>(`/api/admin/neon/content/${id}`, data),
  deleteContent: (id: number) => api.delete(`/api/admin/neon/content/${id}`),
};
