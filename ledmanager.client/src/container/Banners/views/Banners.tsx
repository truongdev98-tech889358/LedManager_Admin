import {
  ConfirmDeleteModal,
  CoreButton,
  CoreDataTable,
  CoreImage,
  CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum, PageEnum, BASE_URL } from "@/configs/constants"; import { type ICellRendererParams } from "ag-grid-community";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Pencil, Trash, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteBanner } from "../apis";

const Banners = () => {
  const gridRef = useRef<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [idsSelected, setIdsSelected] = useState<number[]>([]);
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
  const [refetchObject, setRefetchObject] = useState<object>({});

  const handleDelete = async () => {
    if (idsSelected.length === 0) return;
    const success = await deleteBanner(idsSelected[0]);
    if (success) {
      setRefetchObject({});
      setIsOpenConfirmDeleteModal(false);
    }
  };

  const handleOpenForm = (mode: "add" | "edit" | "view", banner?: any) => {
    if (mode === "add") {
      navigate(`/${PageEnum.Banners}/add`);
    } else {
      navigate(`/${PageEnum.Banners}/${mode}/${banner.id}`);
    }
  };

  const columnDefs: IColumnDef[] = [
    {
      field: "action",
      headerName: t("dataTable.action"),
      noFilter: true,
      minWidth: 0,
      width: 140,
      pinned: "right",
      isNotExport: true,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex h-full justify-center items-center gap-1">
          <CoreTooltip title={t("common.view")}>
            <CoreButton
              icon={<Eye size={18} />}
              onClick={() => handleOpenForm("view", params.data)}
              variant="text"
            ></CoreButton>
          </CoreTooltip>

          <CoreTooltip title={t("common.edit")}>
            <CoreButton
              icon={<Pencil size={18} />}
              onClick={() => handleOpenForm("edit", params.data)}
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
      field: "imageUrl",
      headerName: t("dataTable.image"),
      width: 100,
      noFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex justify-center items-center h-full">
            {params.value ? (
              <CoreImage
                src={`${BASE_URL || ""}${params.value}`}
                width={70}
                height={40}
                style={{ objectFit: 'cover' }}
                className="rounded shadow-sm border border-gray-200"
                preview={true}
              />
            ) : (
              <ImageIcon className="text-gray-300" size={20} />
            )}
          </div>
        );
      },
    },
    {
      field: "title",
      headerName: t("dataTable.title"),
      filterType: "input",
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer text-blue-600 hover:underline font-medium"
            onClick={() => handleOpenForm("edit", params.data)}
          >
            {params.value}
          </span>
        </div>
      )
    },
    {
      field: "bannerType",
      headerName: t("banner.type"),
      filterType: "select",
      width: 150,
      cellRenderer: (params: ICellRendererParams) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          Hero: { label: t("banner.hero"), color: "bg-purple-100 text-purple-800" },
          Announcement: { label: t("banner.announcement"), color: "bg-blue-100 text-blue-800" },
          Promotional: { label: t("banner.promotional"), color: "bg-green-100 text-green-800" },
        };
        const type = typeMap[params.value] || { label: params.value, color: "bg-gray-100 text-gray-800" };
        return (
          <div className="flex items-center h-full">
            <span className={`px-2 py-1 rounded text-xs font-medium ${type.color}`}>
              {type.label}
            </span>
          </div>
        );
      },
    },
    {
      field: "textPosition",
      headerName: t("banner.textPosition"),
      filterType: "select",
      width: 130,
    },
    {
      field: "position",
      headerName: t("banner.displayPosition"),
      filterType: "input",
      width: 130,
    },
    {
      field: "sortOrder",
      headerName: t("banner.sortOrder"),
      filterType: "input",
      width: 100,
    },
    {
      field: "isActive",
      headerName: t("common.status"),
      filterType: "select",
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex items-center h-full">
            <span className={`px-2 py-1 rounded text-xs font-medium ${params.value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
              {params.value ? t("banner.active") : t("banner.inactive")}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CoreDataTable
        ref={gridRef}
        columnDefs={columnDefs}
        title={t("banner.listTitle")}
        columnStateName={LocalStorageEnum.BannerManagementColumnState}
        fetchUrl="/api/banners"
        isBookingApi
        defaultSortConfig={{ key: "sortOrder", order: "asc" }}
        hasExport
        transformData={(data) => data.items}
        refetchObject={refetchObject}
        onAdd={() => handleOpenForm("add")}
      />

      {isOpenConfirmDeleteModal && (
        <ConfirmDeleteModal
          open={isOpenConfirmDeleteModal}
          onClose={() => setIsOpenConfirmDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}

    </div>
  );
};

export default Banners;
