import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IUserInformationRespones } from "../configs/types";
import { changePassword, getUserById, updateUserInformation } from "../apis";
import { toast } from "react-toastify";
import { t } from "i18next";

export function useUserInformation() {
  const [userInformation, setUserInformation] = useState<
    (IUserInformationRespones & { fullName?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  const getFullName = (user: any) => {
    if (!user) return "";
    if (user.fullName) return user.fullName;
    return [user.lastName, user.firstName].filter(Boolean).join(" ");
  };

  const getFirstAndLastName = (fullName: string = "") => {
    const arr = fullName.trim().split(" ");
    if (arr.length === 1) return { lastName: arr[0], firstName: "" };
    return { lastName: arr[0], firstName: arr.slice(1).join(" ") };
  };

  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    const fetchUserInformation = async () => {
      console.log("Fetching user information for ID:", id);
      if (!id) {
        console.log("No ID provided");
        setLoading(false);
        return;
      }
      try {
        const res = await getUserById(id);
        setUserInformation({
          ...res,
          fullName: getFullName(res),
        });
      } catch (err: any) {
        console.error("Failed to fetch user information:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInformation();
  }, [id]);
  const handleSubmitUserInfo = async (id: string, formValues: any) => {
    const res = await updateUserInformation(id, formValues);
    if (res) {
      setUserInformation({
        ...userInformation,
        ...formValues,
      });
      toast.success(t("toast.success.edit"));
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error(t("toast.error.edit"));
    }
  };
  const handleChangePassword = async ( formValues: any) => {
    try {
      const res = await changePassword({ ...formValues });
      if (res) {
        toast.success(t("toast.changePassword.success"));
      }
      else {
        toast.error(t("toast.changePassword.error"));
      }
    } catch (error) {
      toast.error(t("toast.changePassword.error"));
      console.error("Failed to change password:", error);
    }
  };

  return {
    id,
    userInformation,
    loading,
    getFirstAndLastName,
    handleSubmitUserInfo,
    handleChangePassword
  };
}
