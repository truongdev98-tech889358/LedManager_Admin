import { useEffect, useState } from "react";
import { createUser, getAllUsers, updateUser, deleteUser as deleteUserApi } from "../apis";
import { useForm } from "react-hook-form";
import type { IAccountFormValues, IAccountResponse } from "../configs/types";
import { toast } from "react-toastify";
import { t } from "i18next";

// Tách tên
function splitName(fullName: string) {
  const parts = fullName.trim().split(" ");
  const firstName = parts.pop() || "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

// ép kiểu roles thành array
function normalizeRoles(roles: any): string[] {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles;
  if (typeof roles === "string") {
    return roles
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return [];
}

export function useUser() {
  const [userInformation, setUserInformation] = useState<IAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeForm, setTypeForm] = useState<"add" | "edit" | "view">("add");
  const [editingUser, setEditingUser] = useState<IAccountResponse | null>(null);
  const [refetchObject, setRefetchObject] = useState<any[]>([]);

  const hookForm = useForm<IAccountFormValues>({
    defaultValues: {
      userName: "",
      firstName: "",
      lastName: "",
      groupId: undefined,
      isActive: false,
      phoneNumber: "",
      roles: [],
      note: "",
      createUser: 123,
      ownerCustomerId: 1,
    },
  });

  // fetch all users
  const fetchUserInformation = async () => {
    setLoading(true);
    const data = await getAllUsers();
    const mappedData = (data?.items || data || []).map((user: any) => {
      return {
        ...user,
        roles: normalizeRoles(user.roles),
      };
    });
    setUserInformation(mappedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserInformation();
  }, []);

  // add
  const handleSubmitUserInfo = async (data: IAccountFormValues) => {
    const submitData: any = { ...data };
    submitData.roles = normalizeRoles(data.roles);

    if ((data as any).fullName) {
      const { lastName, firstName } = splitName((data as any).fullName);
      submitData.firstName = firstName;
      submitData.lastName = lastName;
      submitData.groupId = Number((data as any).groupId);
      delete submitData.fullName;
      delete submitData.groupName;
    }

    const res = await createUser(submitData);
    if (res !== null) {
      toast.success(t("toast.success.add"));
      hookForm.reset();
      fetchUserInformation();
      setRefetchObject([]);
    } else {
      toast.error(t("toast.error.add"));
    }
  };

  // edit
  const handleEditUserInfo = async (id: string, data: IAccountFormValues) => {
    const submitData: any = { ...data };
    submitData.roles = normalizeRoles(data.roles);
    submitData.createUser = 123;

    if ((data as any).fullName) {
      const { lastName, firstName } = splitName((data as any).fullName);
      submitData.firstName = firstName;
      submitData.lastName = lastName;
      submitData.groupId = Number((data as any).groupId);
      delete submitData.fullname;
      delete submitData.groupName;
    }

    const res = await updateUser(id, submitData);
    if (res !== null) {
      toast.success(t("toast.success.edit"));
      fetchUserInformation();
      setRefetchObject([]);
    } else {
      toast.error(t("toast.error.edit"));
    }
  };

  // delete
  const handleDeleteUserInfo = async (id: string) => {
    const res = await deleteUserApi(id);
    if (res !== null) {
      toast.success(t("toast.success.delete"));
      fetchUserInformation();
    } else {
      toast.error(t("toast.error.delete"));
    }
  };

  return {
    refetchObject,
    userInformation,
    loading,
    hookForm,
    typeForm,
    setTypeForm,
    editingUser,
    setEditingUser,
    handleSubmitUserInfo,
    handleEditUserInfo,
    handleDeleteUserInfo,
  };
}
