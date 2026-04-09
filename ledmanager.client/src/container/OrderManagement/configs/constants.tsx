import { CoreText } from "@/components";
import type { IOption } from "@/configs/types";
import { t } from "i18next";
import { CalendarFold, CheckCircle, FileCheck, ShoppingCart, XCircle } from "lucide-react";

export const OrderStatusEnum = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: 4,
  // Compatibility aliases
  New: 0,
  Paid: 2,
  Completed: 3,
  Closed: 4,
} as const;

export type OrderStatusEnum = number;

export const ORDER_STATUS_OPTIONS = () => {
  return [
    { label: t("dataTable.orderStatus.all"), value: "" },
    {
      label: (
        <div className="flex items-center gap-2 h-full w-full">
          <ShoppingCart size={18} className="text-purple-500 shrink-0" />
          <CoreText className="overflow-hidden text-ellipsis">{t("dataTable.orderStatus.pending")}</CoreText>
        </div>
      ),
      value: OrderStatusEnum.Pending + "",
      data: t("dataTable.orderStatus.pending"),
      color: "purple",
    },
    {
      label: (
        <div className="flex items-center gap-2 h-full">
          <CalendarFold size={18} className="text-orange-500 shrink-0" />
          <CoreText className="overflow-hidden text-ellipsis">{t("dataTable.orderStatus.processing")}</CoreText>
        </div>
      ),
      value: OrderStatusEnum.Processing + "",
      data: t("dataTable.orderStatus.processing"),
      color: "orange",
    },
    {
      label: (
        <div className="flex items-center gap-2 h-full w-full">
          <FileCheck size={18} className="text-blue-500 shrink-0" />
          <CoreText className="overflow-hidden text-ellipsis">{t("dataTable.orderStatus.shipped")}</CoreText>
        </div>
      ),
      value: OrderStatusEnum.Shipped + "",
      data: t("dataTable.orderStatus.shipped"),
      color: "blue",
    },
    {
      label: (
        <div className="flex items-center gap-2 h-full">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <CoreText className="overflow-hidden text-ellipsis">{t("dataTable.orderStatus.delivered")}</CoreText>
        </div>
      ),
      value: OrderStatusEnum.Delivered + "",
      data: t("dataTable.orderStatus.delivered"),
      color: "green",
    },
    {
      label: (
        <div className="flex items-center gap-2 h-full">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <CoreText className="overflow-hidden text-ellipsis">{t("dataTable.orderStatus.cancelled")}</CoreText>
        </div>
      ),
      value: OrderStatusEnum.Cancelled + "",
      data: t("dataTable.orderStatus.cancelled"),
      color: "red",
    },
  ] as IOption[];
};

export enum HistoryTypeEnum {
  Booking,
  Order,
  Ticket,
}
