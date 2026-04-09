import {
  ConfirmDeleteModal,
  CoreButton,
  CoreDataTable,
  CoreImage,
  CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { DATE_TIME_DISPLAY2, LocalStorageEnum, BASE_URL } from "@/configs/constants";
import { type ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { Image as ImageIcon, Pencil, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { deleteArticle } from "../apis";


const Articles = () => {
  const gridRef = useRef<any>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [idsSelected, setIdsSelected] = useState<number[]>([]);
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
  const [refetchObject, setRefetchObject] = useState<object>({});

  const handleDelete = async () => {
    if (idsSelected.length === 0) return;
    const success = await deleteArticle(idsSelected[0]);
    if (success) {
      setRefetchObject({});
      setIsOpenConfirmDeleteModal(false);
    }
  };

  const columnDefs: IColumnDef[] = [
    {
      field: "action",
      headerName: t("dataTable.action"),
      noFilter: true,
      minWidth: 0,
      width: 100,
      pinned: "right",
      isNotExport: true,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex h-full justify-center items-center gap-1">
          <CoreTooltip title={t("common.edit")}>
            <CoreButton
              icon={<Pencil size={18} />}
              onClick={() => navigate(`/articles/edit/${params.data.id}`)}
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
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex justify-center items-center h-full">
          {params.value ? (
            <CoreImage
              src={`${BASE_URL || ""}${params.value}`}
              width={40}
              height={40}
              style={{ objectFit: 'cover' }}
              className="rounded shadow-sm border border-gray-200"
              preview={true}
            />
          ) : (
            <ImageIcon className="text-gray-300" size={20} />
          )}
        </div>
      ),
    },
    {
      field: "title",
      headerName: t("dataTable.title"),
      filterType: "input",
      flex: 2,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer text-blue-600 hover:underline font-medium"
            onClick={() => navigate(`/articles/edit/${params.data.id}`)}
          >
            {params.value}
          </span>
        </div>
      )
    },
    {
      field: "categoryName",
      headerName: t("dataTable.category"),
      filterType: "input",
      flex: 1,
    },
    {
      field: "createdDate",
      headerName: t("dataTable.date"),
      filterType: "input",
      width: 150,
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format(DATE_TIME_DISPLAY2) : "",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CoreDataTable
        ref={gridRef}
        columnDefs={columnDefs}
        title={t("menu.articleManagement")}
        columnStateName={LocalStorageEnum.ArticleManagementColumnState}
        fetchUrl="/api/articles"
        isBookingApi
        defaultSortConfig={{ key: "createdDate", order: "desc" }}
        hasExport
        transformData={(data) => data.items}
        refetchObject={refetchObject}
        onAdd={() => navigate("/articles/add")}
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

export default Articles;
