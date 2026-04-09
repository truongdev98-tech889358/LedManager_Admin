import api from "./index";

export const uploadFile = async (file: File, folder: string = "uploads"): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(`/api/Files/upload?folder=${folder}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  } catch (error) {
    console.error("Upload failed", error);
    return null;
  }
};
