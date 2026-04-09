import { useState } from "react";
import { deleteOrder } from "../apis";
import { toast } from "react-toastify";
import { t } from "i18next";

const useOrderManagement = () => {
  const [idsSelected, setIdsSelected] = useState<number[]>([]);
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
  const [refetchObject, setRefetchObject] = useState<object>({});
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);

  const handleDelete = async () => {
    const res = await deleteOrder(idsSelected?.[0]);
    if (res) {
      toast.success(t("toast.success.delete"));
      setRefetchObject({});
      setIsOpenConfirmDeleteModal(false);
    }
  };

  return {
    idsSelected,
    setIdsSelected,
    isOpenConfirmDeleteModal,
    setIsOpenConfirmDeleteModal,
    handleDelete,
    refetchObject,
    isOpenHistoryModal,
    setIsOpenHistoryModal,
  };
};

export default useOrderManagement;
