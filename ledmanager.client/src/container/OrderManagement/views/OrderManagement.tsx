import {
  ConfirmDeleteModal,
  CoreButton,
  CoreDataTable,
  CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { DATE_TIME_DISPLAY2, LocalStorageEnum, PageEnum } from "@/configs/constants";
import { formatNumber } from "@/utils/helper";
import { type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { FolderOpen, Trash } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HistoryTypeEnum, ORDER_STATUS_OPTIONS } from "../configs/constants";
import useOrderManagement from "../hooks/useOrderManagement";
import HistoryModal from "./HistoryModal";

const OrderManagement = () => {
  const gridRef = useRef<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    setIdsSelected,
    isOpenConfirmDeleteModal,
    setIsOpenConfirmDeleteModal,
    handleDelete,
    refetchObject,
    idsSelected,
    isOpenHistoryModal,
    setIsOpenHistoryModal,
  } = useOrderManagement();

  const columnDefs: IColumnDef[] = [
    {
      field: "action",
      headerName: t("dataTable.action"),
      noFilter: true,
      minWidth: 0,
      width: 80,
      pinned: "right",
      isNotExport: true,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex h-full justify-center items-center">
          <CoreTooltip title={t("common.details")}>
            <CoreButton
              icon={<FolderOpen size={18} />}
              onClick={() => navigate(`/${PageEnum.OrderDetails}/${params.data.id}`)}
              color="blue"
              variant="text"
            ></CoreButton>
          </CoreTooltip>

          <CoreTooltip title={t("common.delete")}>
            <CoreButton
              icon={<Trash size={18} />}
              onClick={() => {
                setIdsSelected([params.data.id]);
                setIsOpenConfirmDeleteModal(true);
              }}
              color="danger"
              variant="text"
            ></CoreButton>
          </CoreTooltip>
        </div>
      ),
    },
    {
      field: "createdDate",
      headerName: t("dataTable.date"),
      filterType: "input",
      cellStyle: {
        textAlign: "center",
      },
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format(DATE_TIME_DISPLAY2) : "",
      exportFormatter: (value) => (value ? dayjs(value).format(DATE_TIME_DISPLAY2) : ""),
      isString: true,
    },
    {
      field: "orderCode",
      headerName: t("dataTable.orderCode"),
      filterType: "input",
      flex: 1,
      cellStyle: {
        textAlign: "center",
      },
      cellRenderer: (params: ICellRendererParams) => (
        <a
          className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
          onClick={() => navigate(`/${PageEnum.OrderDetails}/${params.data.id}`)}
        >
          {params.value}
        </a>
      ),
    },
    {
      field: "status",
      headerName: t("dataTable.status"),
      filterType: "select",
      filterOptions: ORDER_STATUS_OPTIONS(),
      cellRenderer: (params: ICellRendererParams) =>
        ORDER_STATUS_OPTIONS().slice(1).find((opt) => opt.value === params.value + "")?.label,
      exportFormatter: (value) => ORDER_STATUS_OPTIONS().slice(1).find((opt) => opt.value === value + "")?.data || "",
    },
    { field: "customerName", headerName: t("dataTable.customerName"), filterType: "input" },
    { field: "customerPhone", headerName: t("dataTable.phoneNumber"), filterType: "input", isString: true },
    { field: "customerEmail", headerName: t("dataTable.email"), filterType: "input" },
    { field: "customerAddress", headerName: t("dataTable.address"), filterType: "input" },
    {
      field: "totalAmount",
      headerName: t("dataTable.totalPrice"),
      filterType: "input",
      cellStyle: {
        textAlign: "end",
      },
      valueFormatter: (params) => {
        return `${formatNumber(params.value, true)} VND`;
      },
      exportFormatter: (value) => {
        return `${formatNumber(value, true)} VND`;
      },
    },
    { field: "note", headerName: t("dataTable.note"), filterType: "input" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CoreDataTable
        ref={gridRef}
        columnDefs={columnDefs}
        title={t("menu.orderManagement")}
        columnStateName={LocalStorageEnum.OrderManagementColumnState}
        fetchUrl="/api/orders"
        isBookingApi
        defaultSortConfig={{ key: "createdDate", order: "desc" }}
        hasExport
        transformData={(data) =>
          data.items.map((row: any) => ({
            ...row,
            status: row.status,
          }))
        }
        refetchObject={refetchObject}
      />

      {isOpenConfirmDeleteModal && (
        <ConfirmDeleteModal
          open={isOpenConfirmDeleteModal}
          onClose={() => {
            setIsOpenConfirmDeleteModal(false);
          }}
          onConfirm={handleDelete}
        />
      )}

      {isOpenHistoryModal && (
        <HistoryModal
          open={isOpenHistoryModal}
          onClose={() => setIsOpenHistoryModal(false)}
          id={idsSelected.at(0)}
          type={HistoryTypeEnum.Order}
        />
      )}
    </div>
  );
};

export default OrderManagement;
