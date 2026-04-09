import type { IOption } from "@/configs/types";
import { t } from "i18next";

export const getBookingFeatures = () =>
  [
    {
      label: t("informationAccountForm.checkBoxList.search", "Cho phép tìm kiếm"),
      value: "search",
    },
    {
      label: t("informationAccountForm.checkBoxList.booking", "Cho phép đặt chỗ"),
      value: "booking",
    },
    { label: t("informationAccountForm.checkBoxList.ticket", "Cho phép xuất vé"), value: "ticket" },
    {
      label: t("informationAccountForm.checkBoxList.voidTicket", "Cho phép void vé"),
      value: "voidTicket",
    },
  ] as IOption[];

export const getRoleOptions = (t: any) => [
  {
    label: t("informationAccountForm.checkBoxList.admin", "Quản trị viên"),
    value: "Admin",
  },
  {
    label: t("informationAccountForm.checkBoxList.content", "Quản lý nội dung"),
    value: "Content",
  },
  {
    label: t("informationAccountForm.checkBoxList.product", "Quản lý sản phẩm"),
    value: "Product",
  },
  {
    label: t("informationAccountForm.checkBoxList.user", "Người dùng"),
    value: "User",
  },
];
export const BOOKING_ACCOUNT_OPTIONS = [
  {
    label: t("informationAccountForm.checkBoxList.bookingAccount1", "Tài khoản đặt chỗ 1"),
    value: "bookingAccount1",
  },
  {
    label: t("informationAccountForm.checkBoxList.bookingAccount2", "Tài khoản đặt chỗ 2"),
    value: "bookingAccount2",
  },
  // Add more booking accounts as needed
];
export const BRANCH_OPTIONS = [
  { label: t("informationAccountForm.checkBoxList.branch1", "Chi nhánh 1"), value: "branch1" },
  { label: t("informationAccountForm.checkBoxList.branch2", "Chi nhánh 2"), value: "branch2" },
  // Add more branches as needed
];
export const STAFF_LEVEL_OPTIONS = [
  {
    label: t("informationAccountForm.checkBoxList.staffLevel1", "Cấp bậc nhân viên 1"),
    value: "staffLevel1",
  },
  {
    label: t("informationAccountForm.checkBoxList.staffLevel2", "Cấp bậc nhân viên 2"),
    value: "staffLevel2",
  },
  // Add more staff levels as needed
];
export const GROUP_OPTIONS = [
  { label: t("informationAccountForm.checkBoxList.group1", "Nhóm 1"), value: "group1" },
  { label: t("informationAccountForm.checkBoxList.group2", "Nhóm 2"), value: "group2" },
  // Add more groups as needed
];
