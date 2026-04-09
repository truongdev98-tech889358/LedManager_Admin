import {
    ConfirmDeleteModal,
    CoreButton,
    CoreDataTable,
    CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum } from "@/configs/constants";
import { type ICellRendererParams } from "ag-grid-community";
import { Pencil, Trash, Eye } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteArticleCategory } from "../../Articles/apis";
import ArticleCategoryFormModal from "./ArticleCategoryFormModal";

const ArticleCategories = () => {
    const gridRef = useRef<any>(null);
    const { t } = useTranslation();
    const [idsSelected, setIdsSelected] = useState<number[]>([]);
    const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
    const [refetchObject, setRefetchObject] = useState<object>({});

    const [isOpenFormModal, setIsOpenFormModal] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
    const [selectedCategory, setSelectedCategory] = useState<any | undefined>();

    const handleDelete = async () => {
        if (idsSelected.length === 0) return;
        const success = await deleteArticleCategory(idsSelected[0]);
        if (success) {
            setRefetchObject({});
            setIsOpenConfirmDeleteModal(false);
        }
    };

    const handleOpenForm = (mode: "add" | "edit" | "view", category?: any) => {
        setFormMode(mode);
        setSelectedCategory(category);
        setIsOpenFormModal(true);
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
            field: "name",
            headerName: t("category.name"),
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
            field: "slug",
            headerName: t("category.slug"),
            filterType: "input",
            flex: 1,
        },
        {
            field: "description",
            headerName: t("common.description"),
            filterType: "input",
            flex: 2,
        },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <CoreDataTable
                ref={gridRef}
                columnDefs={columnDefs}
                title={t("article.categoryListTitle")}
                columnStateName={LocalStorageEnum.CategoryManagementColumnState} // Reuse or make new
                fetchUrl="/api/articlecategories"
                isBookingApi
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

            {isOpenFormModal && (
                <ArticleCategoryFormModal
                    open={isOpenFormModal}
                    mode={formMode}
                    category={selectedCategory}
                    onClose={() => setIsOpenFormModal(false)}
                    onSuccess={() => setRefetchObject({})}
                />
            )}
        </div>
    );
};

export default ArticleCategories;
