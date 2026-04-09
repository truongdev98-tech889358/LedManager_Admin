import { CoreInput, CoreText, CoreButton, CoreImage, CoreModal } from "@/components";
import { useEffect, useState } from "react";
import { useForm as usePasswordForm } from "react-hook-form";
import UserChangePasswordModal from "../components/UserChangePasswordModal";
import type { IPasswordChangeValue } from "../configs/types";
import { Controller, useForm } from "react-hook-form";
import { images } from "@/assets/images";
import styles from "../styles/UserInformation.module.scss";
import { LockOutlined, SaveOutlined, CameraOutlined, UserOutlined } from "@ant-design/icons";
import { useUserInformation } from "../hooks/useUserInformation";
import { useTranslation } from "react-i18next";
import { validateEmail, validatePhoneNumber, validateRequired } from "@/utils/validates";
import type { IUserInformationValues } from "../configs/types";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const UserInformation = () => {
  // Hàm xử lý chuỗi permissions
  const parsePermissions = (permissions: string | string[] | undefined) => {
    if (Array.isArray(permissions)) return permissions;
    if (typeof permissions === "string") {
      return permissions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 1);
    }
    return [];
  };
  const userInfo = useSelector((state: RootState) => state.common.userInfo);
  const { userInformation, loading,id, getFirstAndLastName,handleSubmitUserInfo,handleChangePassword} = useUserInformation();
  const { t } = useTranslation();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const passwordForm = usePasswordForm<IPasswordChangeValue>({
    defaultValues: {
      identityId: userInfo?.id ?? (id ? Number(id) : 0),
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  useEffect(() => {
    if (showChangePwd) {
      passwordForm.reset(); // Reset the form when modal opens
    }
  }, [showChangePwd]);
  const { control, handleSubmit } = useForm<IUserInformationValues>({
    defaultValues: {
      ...userInformation,
      createUser: 123,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  if (loading) return <div>{t("common.loading")}</div>;
  if (!userInformation) return <div>{t("userInformation.notFound")}</div>;

  const onSubmit = (data: IUserInformationValues) => {
    const { firstName, lastName } = getFirstAndLastName(data.fullName || "");
    const submitData = {
      ...data,
      firstName,
      lastName,
      groupId: userInformation.groupId,
      permissions: parsePermissions(userInformation.permissions),
      createUser: 123,
      ownerCustomerId: 1,
      ownerCustomer: true,
      userName: userInformation.userName,
    };
    delete submitData.fullName;
    console.log("submit", submitData);
    handleSubmitUserInfo(id ?? "", submitData);
  };

  return (
    <>
      <div className={styles["userInfoBg"]}>
        <div className={styles["userInfoCard"]}>
          <div className={styles["userInfoBanner"]} />
          <div className={styles.userInfoHeader}>
            <div className={styles.avatarWrapper}>
              <CoreImage src={images.logo} alt="avatar" className={styles["userInfoAvatar"]} />
              <label htmlFor="avatar-upload" className={styles.cameraBtn}>
                <CameraOutlined style={{ fontSize: 18 }} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={() => {}}
                />
              </label>
            </div>
            <div className={styles.headerInfo}>
              <div className={styles["userInfoName"]}>{userInformation.fullName}</div>
              <div className={styles.userInfoStats}>
                <div className={styles["userInfoLogin"]}>
                  <span className={styles.label}>{t("userInformation.label.userName")}:</span>{" "}
                  <span className={styles.value}>{userInformation.userName}</span>
                </div>
                {userInformation.company && (
                  <div className={styles["userInfoCompany"]}>{userInformation.company}</div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.userInfoFormContent}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <UserOutlined /> {t("userInformation.label.basicInfo")}
              </h3>
              <div className={styles["userInfoFormRow"]}>
                <div className={styles["formFieldBlock"]}>
                  <CoreText className={styles.fieldLabel}>
                    {t("userInformation.label.fullName")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </CoreText>
                  <Controller
                    defaultValue={userInformation.fullName}
                    name="fullName"
                    control={control}
                    rules={{
                      validate: {
                        required: (value) =>
                          validateRequired(t("userInformation.label.fullName"), value),
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <CoreInput {...field} className={styles["userInfoInput"]} />
                        {fieldState.error && (
                          <CoreText type="danger" className={styles["errorMessage"]}>
                            {fieldState.error.message}
                          </CoreText>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className={styles["formFieldBlock"]}>
                  <CoreText className={styles.fieldLabel}>
                    {t("userInformation.label.email")} <span style={{ color: "#ef4444" }}>*</span>
                  </CoreText>
                  <Controller
                    defaultValue={userInformation.email || ""}
                    name="email"
                    control={control}
                    rules={{
                      validate: {
                        required: (value) =>
                          validateRequired(t("userInformation.label.email"), value),
                        email: (value) => validateEmail(t("userInformation.label.email"), value),
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <CoreInput {...field} className={styles["userInfoInput"]} />
                        {fieldState.error && (
                          <CoreText type="danger" className={styles["errorMessage"]}>
                            {fieldState.error.message}
                          </CoreText>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className={styles["formFieldBlock"]}>
                  <CoreText className={styles.fieldLabel}>
                    {t("userInformation.label.phone")} <span style={{ color: "#ef4444" }}>*</span>
                  </CoreText>
                  <Controller
                    defaultValue={userInformation.phoneNumber || ""}
                    name="phoneNumber"
                    control={control}
                    rules={{
                      validate: {
                        required: (value) =>
                          validateRequired(t("userInformation.label.phone"), value),
                        phoneNumber: (value) =>
                          validatePhoneNumber(t("userInformation.label.phone"), value),
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <CoreInput {...field} className={styles["userInfoInput"]} />
                        {fieldState.error && (
                          <CoreText type="danger" className={styles["errorMessage"]}>
                            {fieldState.error.message}
                          </CoreText>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className={styles["userInfoFooter"]}>
              <CoreButton
                type="default"
                className={styles["btnChangePwd"]}
                onClick={() => setShowChangePwd(true)}
              >
                <LockOutlined />
                {t("userInformation.button.changePassword")}
              </CoreButton>
              <CoreButton type="primary" htmlType="submit" className={styles["btnSave"]}>
                <SaveOutlined />
                {t("userInformation.button.edit")}
              </CoreButton>
            </div>
          </form>
        </div>
      </div>
      <CoreModal
        open={showChangePwd}
        onCancel={() => setShowChangePwd(false)}
        footer={null}
        width={600}
      >
        <UserChangePasswordModal
          hookForm={passwordForm}
          onSubmit={(data) => handleChangePassword(data)}
          onCancel={() => setShowChangePwd(false)}
        />
      </CoreModal>
    </>
  );
};

export default UserInformation;
