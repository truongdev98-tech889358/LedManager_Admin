import {
    ConfirmDeleteModal,
    CoreButton,
    CoreDataTable,
    CoreImage,
    CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum, PageEnum, BASE_URL } from "@/configs/constants";
import { type ICellRendererParams } from "ag-grid-community";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Pencil, Trash, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteProductFeature } from "../apis";

const ProductFeatures = () => {
    const gridRef = useRef<any>(null);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [idsSelected, setIdsSelected] = useState<number[]>([]);
    const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
    const [refetchObject, setRefetchObject] = useState<object>({});

    const handleDelete = async () => {
        if (idsSelected.length === 0) return;
        const success = await deleteProductFeature(idsSelected[0]);
        if (success) {
            setRefetchObject({});
            setIsOpenConfirmDeleteModal(false);
        }
    };

    const handleOpenForm = (mode: "add" | "edit" | "view", feature?: any) => {
        if (mode === "add") {
            navigate(`/${PageEnum.ProductFeatures}/add`);
        } else {
            navigate(`/${PageEnum.ProductFeatures}/${mode}/${feature.id}`);
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
            field: "iconUrl",
            headerName: t("dataTable.icon"),
            width: 100,
            noFilter: true,
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <div className="flex justify-center items-center h-full">
                        {params.value ? (
                            <CoreImage
                                src={`${BASE_URL || ""}${params.value}`}
                                width={50}
                                height={50}
                                style={{ objectFit: 'contain' }}
                                className="rounded"
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
            field: "blockType",
            headerName: "Block Type",
            filterType: "select",
            width: 150,
            cellRenderer: (params: ICellRendererParams) => {
                const typeMap: Record<string, { label: string; color: string }> = {
                    ProductFeature: { label: "Product Feature", color: "bg-purple-100 text-purple-800" },
                    HowItWorksStep: { label: "How It Works Step", color: "bg-blue-100 text-blue-800" },
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
            field: "position",
            headerName: "Position",
            filterType: "select",
            width: 180,
        },
        {
            field: "displayOrder",
            headerName: t("common.sortBy"),
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
                            {params.value ? t("common.active") : t("common.inactive")}
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
                title="Content Blocks"
                columnStateName={LocalStorageEnum.ProductFeaturesColumnState}
                fetchUrl="/api/product-features"
                isBookingApi
                defaultSortConfig={{ key: "displayOrder", order: "asc" }}
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

export default ProductFeatures;
