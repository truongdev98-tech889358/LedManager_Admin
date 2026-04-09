import {
  ConfirmDeleteModal,
  CoreButton,
  CoreDataTable,
  CoreModal,
  CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum } from "@/configs/constants";
import { COLORS } from "@/utils/colors";
import { CircleCheck, CircleX, Edit, Eye, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../hooks/useUser";
import AccountFormModal from "./AccountFormModal";

const User = () => {
  const gridRef = useRef<any>(null);
  const { t } = useTranslation();
  const {
    hookForm,
    handleSubmitUserInfo,
    handleEditUserInfo,
    handleDeleteUserInfo,
    setTypeForm,
    typeForm,
    refetchObject,
  } = useUser();

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);



  const onAdd = () => {
    setTypeForm("add");
    setEditingUser(undefined);
    hookForm.reset({
      userName: "",
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      note: "",
      isActive: true,
      permissions: [],
      password: "",
    } as any);
    setOpenModal(true);
  };

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onDelete = (id: string) => {
    setDeleteId(id);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await handleDeleteUserInfo(deleteId);
      gridRef.current?.refreshServerSide?.();
    }
    setOpenDeleteModal(false);
    setDeleteId(null);
  };

  const onEdit = (data: any) => {
    setTypeForm("edit");
    setEditingUser(data);
    hookForm.reset({
      ...data,
      lastName: data.lastName || "",
      firstName: data.firstName || "",
      password: "",
    });
    setOpenModal(true);
  };

  const columnDefs: IColumnDef[] = [
    {
      field: "action",
      headerName: t("dataTable.action"),
      pinned: "left",
      cellRenderer: (params: any) => (
        <div className="h-full flex items-center gap-1 justify-center">
          {/* <CoreButton icon={<Lock size={16} />} variant="text" color="danger" /> */}
          <CoreTooltip title={t("common.view", "Xem")}>
            <CoreButton
              icon={<Eye size={18} />}
              variant="text"
              color="green"
              onClick={() => {
                setTypeForm("view");
                setEditingUser(params.data);
                hookForm.reset({
                  ...params.data,
                  lastName: params.data.lastName || "",
                  firstName: params.data.firstName || "",
                  password: "",
                });
                setOpenModal(true);
              }}
            />
          </CoreTooltip>

          <CoreTooltip title={t("common.edit", "Sửa")}>
            <CoreButton
              icon={<Edit size={18} />}
              variant="text"
              color="blue"
              onClick={() => onEdit(params.data)}
            />
          </CoreTooltip>

          <CoreTooltip title={t("common.delete")}>
            <CoreButton
              icon={<Trash size={18} />}
              onClick={() => onDelete(params.data.id)}
              variant="text"
              color="danger"
            />
          </CoreTooltip>
        </div>
      ),
      width: 100,
      filterType: undefined,
    },
    { field: "id", headerName: t("dataTable.id"), width: 60, filterType: "input" },
    {
      field: "userName",
      headerName: t("dataTable.account"),
      filterType: "input",
      cellRenderer: (params: any) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium"
          onClick={() => onEdit(params.data)}
        >
          {params.value}
        </div>
      ),
    },
    { field: "firstName", headerName: t("dataTable.firstName"), filterType: "input" },
    { field: "lastName", headerName: t("dataTable.lastName"), filterType: "input" },
    { field: "fullName", headerName: t("dataTable.fullName"), filterType: "input", flex: 1 },
    { field: "email", headerName: t("informationAccountForm.label.email"), filterType: "input" },
    { field: "phoneNumber", headerName: t("dataTable.phoneNumber"), filterType: "input", width: 150 },

    {
      field: "isActive",
      headerName: t("dataTable.status"),
      filterType: "select",
      filterOptions: [
        { label: t("dataTable.bookingStatus.all"), value: "" },
        { label: t("informationAccountForm.label.isActive"), value: "true" },
        { label: t("dataTable.deleted"), value: "false" }
      ],
      cellRenderer: (params: any) => (
        <div className="flex h-full items-center justify-center">
          {params.value ? (
            <CircleCheck size={18} color={COLORS.green} />
          ) : (
            <CircleX size={18} color={COLORS.red} />
          )}
        </div>
      ),
      width: 100,
    },
    {
      field: "roles",
      headerName: t("dataTable.roles"),
      filterType: "input",
      cellRenderer: (params: any) => (
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {Array.isArray(params.value) ? params.value.join(", ") : params.value}
        </div>
      )
    },
    { field: "note", headerName: t("informationAccountForm.label.note"), filterType: "input" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CoreDataTable
        ref={gridRef}
        fetchUrl="/api/user"
        columnDefs={columnDefs}
        title={t("menu.account", "Tài khoản")}
        columnStateName={LocalStorageEnum.UserColumnState}
        filterDateRange={false}
        onAdd={onAdd}
        refetchObject={refetchObject}
        transformData={(data) =>
          (data?.items || []).map((item: any) => {
            return {
              ...item,
              fullName: item.fullName || ((item.lastName ? item.lastName + " " : "") + (item.firstName || "")).trim(),
              visible: item.visible ?? "1",
            };
          })
        }
      />

      {openModal && (
        <CoreModal open={openModal} onCancel={() => setOpenModal(false)} footer={null} width={800}>
          <AccountFormModal
            typeForm={typeForm}
            hookForm={hookForm}
            onSubmit={async (data: any) => {
              const payload = {
                ...data,
                roles: Array.isArray(data.roles)
                  ? data.roles
                  : typeof data.roles === "string"
                    ? data.roles
                      .split(",")
                      .map((p: string) => p.trim())
                      .filter((p: string) => p)
                    : [],
              };

              if (typeForm === "edit" && editingUser) {
                await handleEditUserInfo(editingUser.id, payload);
              } else {
                await handleSubmitUserInfo(payload);
              }
              setOpenModal(false);
              gridRef.current?.refreshServerSide?.();
            }}
          />
        </CoreModal>
      )}

      {openDeleteModal && (
        <ConfirmDeleteModal
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default User;
