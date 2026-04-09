import { DATE_DISPLAY_FORMAT } from "@/configs/constants";
import dayjs from "dayjs";
import { t } from "i18next";

const regexPhoneNumber = /^(0|\+84)[1-9][0-9]{8}$/;
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexCharacter = /^[a-zA-Z\s]+$/;
const regexPassportDate = /^[A-Z0-9]{6,9}$/;

export const validateRequired = (name: string, value: any) => {
  return value ? true : t("validate.required", { name, defaultValue: `${name} không được để trống` });
};

export const validatePhoneNumber = (name: string, value: any) => {
  return regexPhoneNumber.test(value) ? true : t("validate.phone", { name, defaultValue: `${name} không hợp lệ` });
};

export const validateCharacter = (name: string, value: any) => {
  return regexCharacter.test(value) ? true : t("validate.character", { name, defaultValue: `${name} không hợp lệ` });
};

export const validateEmail = (name: string, value: any) => {
  return regexEmail.test(value) ? true : t("validate.email", { name, defaultValue: `${name} không hợp lệ` });
};

export const validateDatePassport = (name: string, value: any) => {
  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setMonth(today.getMonth() + 6);
  const date = new Date(value);
  return date > expiryDate
    ? true
    : t("validate.passportDate", { name, date: dayjs(expiryDate).format(DATE_DISPLAY_FORMAT), defaultValue: `${name} phải tối thiểu sau ngày ${dayjs(expiryDate).format(DATE_DISPLAY_FORMAT)}` });
};

export const validateDateofBirth = (options: { type?: string }, value: any) => {
  const date = new Date(value);
  const today = new Date();
  if (date >= today) {
    return t("validate.dob.invalid", { defaultValue: `Ngày sinh không hợp lệ` });
  }
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  const type = options?.type || "";
  if (type.includes(t("common.ageGroup.newBorn"))) {
    if (age >= 1) {
      return t("validate.dob.infant", { defaultValue: `Sơ sinh phải trong khoảng từ 0 đến 1 tuổi` });
    }
    return true;
  }
  if (type.includes(t("common.ageGroup.child"))) {
    if (age < 1 || age > 12) {
      return t("validate.dob.child", { defaultValue: `Trẻ em phải trong khoảng từ 1 đến 12 tuổi` });
    }
    return true;
  }
  if (type.includes(t("common.ageGroup.adult"))) {
    if (age <= 12) {
      return t("validate.dob.adult", { defaultValue: `Người lớn phải lớn hơn 12 tuổi` });
    }
    return true;
  }
  return true;
};

export const validatePassportNumber = (name: string, value: any) => {
  return regexPassportDate.test(value) ? true : t("validate.passportNumber", { name, defaultValue: `${name} không hợp lệ` });
};
//validate money
export const validateMoney = (name: string, value: any) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  return !isNaN(value) && Number(value) >= 0 ? true : t("validate.money", { name, defaultValue: `${name} không hợp lệ` });
};