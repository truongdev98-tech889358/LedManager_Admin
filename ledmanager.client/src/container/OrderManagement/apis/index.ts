import api from "@/services";
import type { IGetHistoryRequest, IHistoryRequest, IHistoryResponse } from "../configs/types";
import { toast } from "react-toastify";
import { t } from "i18next";

export const deleteOrder = async (id: number) => {
 try {
   await api.delete(`/api/orders/${id}`, {});
   return true;
 } catch (error) {
   console.log({ error });
   return false;
 }
};

export const getHistories = async (params: IGetHistoryRequest) => {
 try {
   const res = await api.get(`/api/v1/history`, { params });
   return res.data as IHistoryResponse;
 } catch (error) {
   console.log({ error });
   return null;
 }
};

export const addHistory = async (payload: IHistoryRequest) => {
 try {
   await api.post(`/api/v1/history`, payload);
   toast.success(t("toast.success.add"));
   return true;
 } catch (error) {
   console.log({ error });
   toast.error(t("toast.error.add"));
   return false;
 }
};
