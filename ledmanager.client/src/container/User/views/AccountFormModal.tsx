import { CoreButton, CoreCheckbox, CoreInput, CoreSwitch, CoreText } from "@/components";
import { validateRequired } from "@/utils/validates";
import { Col, Row } from "antd";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getRoleOptions } from "../configs/constants";
import type { IAccountFormValues } from "../configs/types";
import style from "../styles/InformationAccountForm.module.scss";

interface IProps {
  hookForm: UseFormReturn<IAccountFormValues, any, IAccountFormValues>;
  onSubmit: (data: IAccountFormValues) => void;
  onCancel?: () => void;
  typeForm?: "add" | "edit" | "view";
}

const AccountFormModal = (props: IProps) => {
  const { hookForm } = props;
  const { t } = useTranslation();
  const { handleSubmit, control } = hookForm;

  const [loading, setLoading] = useState(false);
  const handleFormSubmit = (data: IAccountFormValues) => {
    if (props.typeForm === "view") return;
    setLoading(true);
    props.onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className={style["account-form__container"]}>
        <div className={style["account-form__title"]}>
          <CoreText className={style["account-form__title-text"]}>
            {t("informationAccountForm.title", "Tài khoản")}
          </CoreText>
        </div>
        <div className={style["account-form__content"]}>
          <Row gutter={[16, 12]}>
            <Col span={12}>
              <CoreText strong>
                {t("informationAccountForm.label.lastName", "Họ")}{" "}
                <span style={{ color: "red" }}>*</span>
              </CoreText>
              <Controller
                rules={{
                  validate: {
                    required: (value) =>
                      validateRequired(t("informationAccountForm.label.lastName", "Họ"), value),
                  },
                }}
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      size="large"
                      placeholder={t("informationAccountForm.placeHolder.lastName", "Nhập họ")}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <CoreText strong>
                {t("informationAccountForm.label.firstName", "Tên")}{" "}
                <span style={{ color: "red" }}>*</span>
              </CoreText>
              <Controller
                rules={{
                  validate: {
                    required: (value) =>
                      validateRequired(t("informationAccountForm.label.firstName", "Tên"), value),
                  },
                }}
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      size="large"
                      placeholder={t("informationAccountForm.placeHolder.firstName", "Nhập tên")}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <CoreText strong>
                {t("informationAccountForm.label.username", "Tên đăng nhập")}{" "}
                <span style={{ color: "red" }}>*</span>
              </CoreText>
              <Controller
                rules={{
                  validate: {
                    required: (value) =>
                      validateRequired(
                        t("informationAccountForm.label.username", "Tên đăng nhập"),
                        value,
                      ),
                  },
                }}
                control={control}
                name="userName"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      size="large"
                      placeholder={t(
                        "informationAccountForm.placeHolder.username",
                        "Nhập tên đăng nhập",
                      )}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "edit" || props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <CoreText strong>
                {t("informationAccountForm.label.password", "Mật khẩu")}{" "}
                {props.typeForm === "add" && <span style={{ color: "red" }}>*</span>}
              </CoreText>
              <Controller
                rules={
                  props.typeForm === "add"
                    ? {
                      validate: {
                        required: (value) =>
                          validateRequired(
                            t("informationAccountForm.label.password", "Mật khẩu"),
                            value,
                          ),
                      },
                    }
                    : {}
                }
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      type="password"
                      size="large"
                      placeholder={t(
                        "informationAccountForm.placeHolder.password",
                        "Nhập mật khẩu",
                      )}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <CoreText strong>
                {t("informationAccountForm.label.phone", "Điện thoại")}{" "}
                <span style={{ color: "red" }}>*</span>
              </CoreText>
              <Controller
                rules={{
                  validate: {
                    required: (value) =>
                      validateRequired(
                        t("informationAccountForm.label.phone", "Điện thoại"),
                        value,
                      ),
                  },
                }}
                control={control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      size="large"
                      placeholder={t(
                        "informationAccountForm.placeHolder.phone",
                        "Nhập số điện thoại",
                      )}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <CoreText strong>
                {t("informationAccountForm.label.email", "Email")}{" "}
                <span style={{ color: "red" }}>*</span>
              </CoreText>
              <Controller
                rules={{
                  validate: {
                    required: (value) =>
                      validateRequired(t("informationAccountForm.label.email", "Email"), value),
                  },
                }}
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      size="large"
                      placeholder={t("informationAccountForm.placeHolder.email", "Nhập email")}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>

            <Col span={12}>
              <CoreText strong>{t("informationAccountForm.label.note", "Ghi chú")}</CoreText>
              <Controller
                control={control}
                name="note"
                render={({ field, fieldState }) => (
                  <>
                    <CoreInput
                      {...field}
                      size="large"
                      placeholder={t("informationAccountForm.placeHolder.note", "Nhập ghi chú")}
                      status={fieldState.error ? "error" : ""}
                      disabled={props.typeForm === "view"}
                    />
                    {fieldState.error && (
                      <CoreText type="danger">{fieldState.error.message}</CoreText>
                    )}
                  </>
                )}
              />
            </Col>
            <Col span={12}>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-center gap-2 h-full">
                    <CoreSwitch
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={props.typeForm === "view"}
                    />
                    <CoreText strong>{t("informationAccountForm.label.isActive", "Kích hoạt")}</CoreText>
                  </div>
                )}
              />
            </Col>
          </Row>

          <div className={style["account-form__permissions"]}>
            <CoreText strong style={{ color: "#e67e22", marginTop: 12, display: "block" }}>
              {t("informationAccountForm.label.roles", "Vai trò")}
            </CoreText>
            <Row gutter={[16, 4]}>
              {getRoleOptions(t).map((f) => (
                <Col span={12} key={f.value}>
                  <Controller
                    control={control}
                    name="roles"
                    render={({ field }) => (
                      <CoreCheckbox
                        checked={field.value?.includes(f.value)}
                        disabled={props.typeForm === "view"}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const newRoles = checked
                            ? [...(field.value || []), f.value]
                            : (field.value || []).filter((v: any) => v !== f.value);
                          field.onChange(newRoles);
                        }}
                      >
                        {f.label}
                      </CoreCheckbox>
                    )}
                  />
                </Col>
              ))}
            </Row>
          </div>

          {props.typeForm !== "view" && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <CoreButton
                htmlType="submit"
                icon={props.typeForm === "edit" ? <Edit size={18} /> : <Plus size={18} />}
                type="primary"
                loading={loading}
              >
                {props.typeForm === "edit"
                  ? t("informationAccountForm.button.update", "Cập nhật")
                  : t("informationAccountForm.button.create", "Tạo")}
              </CoreButton>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default AccountFormModal;
