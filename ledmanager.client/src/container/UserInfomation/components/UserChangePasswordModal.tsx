import { CoreInput, CoreButton } from "@/components";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { IPasswordChangeValue } from "../configs/types";
import { LockOutlined } from "@ant-design/icons";
import style from "../styles/UserChangePasswordModal.module.scss";

interface IProps {
  hookForm: UseFormReturn<IPasswordChangeValue, any, IPasswordChangeValue>;
  onSubmit: (data: IPasswordChangeValue) => void;
  onCancel?: () => void;
}

const UserChangePasswordModal = (props: IProps) => {
  const { hookForm, onSubmit, onCancel } = props;
  const { t } = useTranslation();
  const { handleSubmit, control, watch } = hookForm;
  const newPassword = watch("newPassword");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className={style.changePasswordModalTitle}>
          {t("changePassword.title", "Đổi mật khẩu")}
        </div>
        <div className={style.changePasswordModalInput}>
          <Controller
            name="currentPassword"
            control={control}
            rules={{
              required: t("changePassword.oldPassword", "Nhập mật khẩu cũ *"),
            }}
            render={({ field, fieldState }) => (
              <CoreInput
                {...field}
                type="password"
                size="large"
                prefix={<LockOutlined />}
                placeholder={t("changePassword.placeHolder.oldPassword", "Nhập mật khẩu cũ *")}
                status={fieldState.error ? "error" : ""}
              />
            )}
          />
        </div>
        <div className={style.changePasswordModalInput}>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: t("changePassword.newPassword", "Nhập mật khẩu mới *"),
            }}
            render={({ field, fieldState }) => (
              <CoreInput
                {...field}
                type="password"
                size="large"
                prefix={<LockOutlined />}
                placeholder={t("changePassword.placeHolder.newPassword", "Nhập mật khẩu mới *")}
                status={fieldState.error ? "error" : ""}
              />
            )}
          />
        </div>
        <div className={style.changePasswordModalInput}>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: t("changePassword.confirmPassword", "Xác nhận mật khẩu *"),
              validate: (value) =>
                value === newPassword ||
                t("changePassword.confirmPasswordNotMatch", "Mật khẩu xác nhận không khớp"),
            }}
            render={({ field, fieldState }) => (
              <CoreInput
                {...field}
                type="password"
                size="large"
                prefix={<LockOutlined />}
                placeholder={t("changePassword.placeHolder.confirmPassword", "Xác nhận mật khẩu *")}
                status={fieldState.error ? "error" : ""}
              />
            )}
          />
          {hookForm.formState.errors.confirmPassword && (
            <div style={{ color: "#e74c3c", fontSize: 14, marginTop: 4 }}>
              {hookForm.formState.errors.confirmPassword.message}
            </div>
          )}
        </div>
        <div className={style.changePasswordModalFooter}>
          <CoreButton
            className={style.changePasswordModalBtnReset}
            htmlType="button"
            onClick={onCancel}
            disabled={true}
          >
            <LockOutlined style={{ marginRight: 8 }} />
            {t("changePassword.resetButton", "Đặt lại mật khẩu")}
          </CoreButton>
          <CoreButton
            className={style.changePasswordModalBtnSubmit}
            htmlType="submit"
            icon={<LockOutlined />}
          >
            {t("changePassword.submitButton", "Đổi mật khẩu")}
          </CoreButton>
        </div>
      </div>
    </form>
  );
};

export default UserChangePasswordModal;
