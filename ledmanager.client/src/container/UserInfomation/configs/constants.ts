import { t } from "i18next";

export const  getPermissionList = () => {
  return [
  { label: t("informationAccountForm.checkBoxList.search", "Cho phép tìm kiếm"), value: "search" },
  { label: t("informationAccountForm.checkBoxList.booking", "Cho phép đặt chỗ"), value: "booking" },
  { label: t("informationAccountForm.checkBoxList.ticket", "Cho phép xuất vé"), value: "ticket" },
  { label: t("informationAccountForm.checkBoxList.voidTicket", "Cho phép void vé"), value: "voidTicket" },
  { label: t("informationAccountForm.checkBoxList.showDataAllBranch", "Xem dữ liệu tất cả các chi nhánh"), value: "viewAllBranches" },
  { label: t("informationAccountForm.checkBoxList.showDataAllAccount", "Xem dữ liệu tất cả các tài khoản"), value: "viewAllAccounts" },
  { label: t("informationAccountForm.checkBoxList.approvalReceipt", "Duyệt chứng từ thu tiền"), value: "approveReceipts" },
];
}