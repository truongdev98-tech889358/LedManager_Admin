import {
  ConfirmDeleteModal,
  CoreButton,
  CoreDataTable,
  CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum, PageEnum, BASE_URL } from "@/configs/constants";
import { formatNumber } from "@/utils/helper";
import { type ICellRendererParams } from "ag-grid-community";
import { Image as ImageIcon, Pencil, Trash, Eye } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../apis";
import type { IProduct } from "../configs/types";

const Products = () => {
  const gridRef = useRef<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [idsSelected, setIdsSelected] = useState<number[]>([]);
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
  const [refetchObject, setRefetchObject] = useState<object>({});

  const handleDelete = async () => {
    if (idsSelected.length === 0) return;
    const success = await deleteProduct(idsSelected[0]);
    if (success) {
      setRefetchObject({});
      setIsOpenConfirmDeleteModal(false);
    }
  };

  const handleOpenForm = (mode: "add" | "edit" | "view", product?: IProduct) => {
    if (mode === "add") {
      navigate(`/${PageEnum.Products}/add`);
    } else if (mode === "edit" && product) {
      navigate(`/${PageEnum.Products}/edit/${product.id}`);
    } else if (mode === "view" && product) {
      navigate(`/${PageEnum.Products}/view/${product.id}`);
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
      field: "primaryImage",
      headerName: t("dataTable.image"),
      width: 100,
      noFilter: true,
      cellRenderer: (params: ICellRendererParams) => {
        const primaryImage = params.data.images?.find((img: any) => img.isPrimary) || params.data.images?.[0];
        return (
          <div className="flex justify-center items-center h-full">
            {primaryImage?.url ? (
              <img
                src={`${BASE_URL || ""}${primaryImage.url}`}
                alt="Product"
                className="w-10 h-10 object-cover rounded shadow-sm border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
                  (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=No+Img";
                }}
              />
            ) : (
              <ImageIcon className="text-gray-300" size={20} />
            )}
          </div>
        );
      },
    },
    {
      field: "name",
      headerName: t("dataTable.productName"),
      filterType: "input",
      flex: 2,
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
      field: "categoryName",
      headerName: t("dataTable.category"),
      filterType: "input",
      flex: 1,
    },
    {
      field: "price",
      headerName: t("dataTable.unitPrice"),
      filterType: "input",
      width: 150,
      cellStyle: { textAlign: "right" },
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-col items-end leading-tight">
          <span className="font-semibold text-blue-600">{formatNumber(params.value, true)} VND</span>
          {params.data.isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatNumber(params.data.originalPrice, true)} VND
            </span>
          )}
        </div>
      ),
    },
    {
      field: "variants",
      headerName: t("dataTable.variants"),
      width: 200,
      filterType: "input",
      flex: 1,
      valueGetter: (params: any) => {
        // Return a string representation for filtering/sorting, not the object itself
        const variants = params.data?.variants || [];
        if (variants.length === 0) return "";
        return variants.map((v: any) => `${v.type}: ${v.label}`).join(", ");
      },
      cellRenderer: (params: ICellRendererParams) => {
        const variants = params.data.variants || [];

        if (variants.length === 0) return <span className="text-gray-400">Không có</span>;

        // Group by type
        const grouped = variants.reduce((acc: any, v: any) => {
          if (!acc[v.type]) acc[v.type] = [];
          acc[v.type].push(v.label);
          return acc;
        }, {});

        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(grouped).map(([type, labels]: [string, any]) => (
              <span key={type} className="text-xs bg-gray-100 px-1 rounded border border-gray-200">
                <span className="font-semibold">{type}:</span> {labels.join(", ")}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      field: "stockQuantity",
      headerName: t("dataTable.stockQuantity"),
      filterType: "input",
      width: 130,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params: ICellRendererParams) => (
        <span className={`${params.value <= 10 ? "text-red-500 font-bold" : ""}`}>
          {params.value}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CoreDataTable
        ref={gridRef}
        columnDefs={columnDefs}
        title={t("menu.productManagement")}
        columnStateName={LocalStorageEnum.ProductManagementColumnState}
        fetchUrl="/api/products"
        isBookingApi
        defaultSortConfig={{ key: "id", order: "desc" }}
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

export default Products;
