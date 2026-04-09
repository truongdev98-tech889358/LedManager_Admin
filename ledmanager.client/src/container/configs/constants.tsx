import { CoreText } from "@/components";
import type { IOption } from "@/configs/types";
import { t } from "i18next";
import {
  CircleCheck,
  CircleEllipsis,
  Hourglass,
  Loader,
  Ticket,
  TriangleAlert,
  Undo2,
  XCircle,
} from "lucide-react";

export enum BookingStatusEnum {
  Pending,
  Failed,
  Success,
  Ticketed,
  Cancelled,
  WaitingList,
  Refunded,
  PendingIssueTicket,
}

export const TRIP_TYPE_OPTIONS = () => {
  return [
    { label: t("common.all"), value: "" },
    { label: t("dataTable.inland"), value: "0" },
    { label: t("dataTable.international"), value: "1" },
  ] as IOption[];
};

export const BOOKING_STATUS_OPTIONS: IOption[] = [
  {
    label: (
      <div className="flex items-center gap-1">
        <CircleEllipsis className="shrink-0 text-yellow-600" size={14} />
        <CoreText>{t("dataTable.bookingStatus.pending")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.Pending + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <TriangleAlert className="shrink-0 text-red-500" size={14} />
        <CoreText>{t("dataTable.bookingStatus.failed")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.Failed + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <CircleCheck className="shrink-0 text-green-600" size={14} />
        <CoreText>{t("dataTable.bookingStatus.success")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.Success + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <Ticket className="shrink-0 text-blue-500" size={14} />
        <CoreText>{t("dataTable.bookingStatus.ticketed")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.Ticketed + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <XCircle className="shrink-0 text-red-800" size={14} />
        <CoreText>{t("dataTable.bookingStatus.cancelled")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.Cancelled + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <Hourglass className="shrink-0 text-orange-500" size={14} />
        <CoreText>{t("dataTable.bookingStatus.waitingList")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.WaitingList + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <Undo2 className="shrink-0 text-amber-700" size={14} />
        <CoreText>{t("dataTable.bookingStatus.refunded")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.Refunded + "",
  },
  {
    label: (
      <div className="flex items-center gap-1">
        <Loader className="shrink-0 text-purple-500" size={14} />
        <CoreText>{t("dataTable.bookingStatus.pendingIssueTicket")}</CoreText>
      </div>
    ),
    value: BookingStatusEnum.PendingIssueTicket + "",
  },
];

export const BOOKING_STATUS_OPTIONS_2 = [
  { label: "All", value: "" },
  { label: "Success", value: "Success" },
  { label: "Failed", value: "Failed" },
];
