import axios from "axios";
import type { IUserInformationRespones } from "../configs/types";
import apiUser from "@/services/apiUser";

export const getUserInformation = async () => {
    const res = await axios.get("/data/user-information.json");
  return res.data as IUserInformationRespones;
};
export const getUserById = async (id: string) => {
    const res = await apiUser.get(`/api/user/${id}`);
    return res.data as IUserInformationRespones;
};
//export update
export const updateUserInformation = async (id: string, data: Partial<IUserInformationRespones>) => {
    const res = await apiUser.put(`/api/user/${id}`, data);
    return res.data as IUserInformationRespones;
};
//change password
export const changePassword = async (data: { identityId: number; currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const res = await apiUser.post(`/api/user/change-password`, data);
    return res.data;
};
