import {
  ConfirmDeleteModal,
  CoreButton,
  CoreDataTable,
  CoreImage,
  CoreTooltip,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum, BASE_URL } from "@/configs/constants";
import { type ICellRendererParams } from "ag-grid-community";
import { Image as ImageIcon, Pencil, Trash, Eye } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteCategory } from "../apis";
import CategoryFormModal from "./CategoryFormModal";

const Categories = () => {
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
    const success = await deleteCategory(idsSelected[0]);
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

  const buildTreeFromFlat = (items: any[]) => {
    const rootItems: any[] = [];
    const lookup: any = {};

    // Copy items to lookup to avoid mutating original data structure if already tree-like
    // But we need to handle potential partial trees.
    // Simplest heuristic: if we see children populated, assume it's a tree.
    const hasChildren = items.some(i => i.children && i.children.length > 0);
    if (hasChildren) return items; // Already a tree

    items.forEach(item => {
      lookup[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parentId && lookup[item.parentId]) {
        lookup[item.parentId].children.push(lookup[item.id]);
      } else {
        rootItems.push(lookup[item.id]);
      }
    });

    return rootItems;
  };

  const flattenCategories = (categories: any[], level = 0, result: any[] = []) => {
    categories.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, level + 1, result);
      }
    });
    return result;
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
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex items-center h-full">
            <span
              className={`cursor-pointer text-blue-600 hover:underline ${params.data.level === 0 ? "font-semibold" : "font-medium"}`}
              onClick={() => handleOpenForm("edit", params.data)}
            >
              {params.value}
            </span>
          </div>
        );
      },
    },
    {
      field: "slug",
      headerName: t("category.slug"),
      filterType: "input",
      flex: 1,
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
        title={t("menu.categoryManagement")}
        columnStateName={LocalStorageEnum.CategoryManagementColumnState}
        fetchUrl="/api/categories"
        isBookingApi
        // Remove default sort to keep tree structure order
        // defaultSortConfig={{ key: "id", order: "desc" }} 
        hasExport
        transformData={(data) => {
          console.log("API Response Data:", data);
          // Check if items exist and is an array before flattening
          const items = data?.items || [];

          // Try to build tree if flat
          const treeItems = buildTreeFromFlat(items);
          const flattened = flattenCategories(treeItems);

          console.log("Flattened Data:", flattened);
          return flattened;
        }}
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
        <CategoryFormModal
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

export default Categories;
