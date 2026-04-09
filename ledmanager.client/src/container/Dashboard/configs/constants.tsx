import type { IOption } from "@/configs/types";
import { t } from "i18next";

export const VIEW_TYPE_OPTIONS: IOption[] = [
  { label: t("dashboard.oneWeek"), value: "7" },
  { label: t("dashboard.oneMonth"), value: "30" },
];
