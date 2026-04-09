import {
  CoreButton,
  CoreDataTable,
  CoreTooltip,
  ConfirmDeleteModal,
} from "@/components";
import type { IColumnDef } from "@/components/CoreDataTable/CoreDataTable";
import { LocalStorageEnum } from "@/configs/constants";
import { type ICellRendererParams } from "ag-grid-community";
import { Pencil, Trash, Eye } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteMenu, MenuType } from "../apis";
import MenuFormModal from "./MenuFormModal";

import { Tabs } from "antd";

const MenuManagement = () => {
  const gridRef = useRef<any>(null);
  const { t } = useTranslation();
  const [idsSelected, setIdsSelected] = useState<number[]>([]);
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false);
  const [refetchObject, setRefetchObject] = useState<object>({});

  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
  const [selectedMenu, setSelectedMenu] = useState<any | undefined>();
  const [activeTab, setActiveTab] = useState<string>(MenuType.HeaderHorizontal.toString());

  const handleDelete = async () => {
    if (idsSelected.length === 0) return;
    const success = await deleteMenu(idsSelected[0]);
    if (success) {
      setRefetchObject({});
      setIdsSelected([]);
      setIsOpenConfirmDeleteModal(false);
    }
  };

  const handleOpenForm = (mode: "add" | "edit" | "view", menu?: any) => {
    setFormMode(mode);
    setSelectedMenu(menu);
    setIsOpenFormModal(true);
  };

  const buildTreeFromFlat = (items: any[]) => {
    const rootItems: any[] = [];
    const lookup: any = {};

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

  const flattenMenus = (menus: any[], level = 0, result: any[] = []) => {
    menus.forEach((menu) => {
      result.push({ ...menu, level });
      if (menu.children && menu.children.length > 0) {
        flattenMenus(menu.children, level + 1, result);
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
      headerName: t("menu.name"),
      filterType: "input",
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <div className="flex items-center h-full" style={{ paddingLeft: params.data.level * 20 }}>
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
      field: "type",
      headerName: t("menu.type"),
      filterType: "select",
      width: 150,
      filterOptions: [
        { label: t("menu.headerVertical"), value: MenuType.HeaderVertical.toString() },
        { label: t("menu.headerHorizontal"), value: MenuType.HeaderHorizontal.toString() },
        { label: t("menu.footer"), value: MenuType.Footer.toString() },
        { label: t("menu.footerBottom"), value: MenuType.FooterBottom.toString() },
      ],
      cellRenderer: (params: ICellRendererParams) => {
        const types = {
          [MenuType.HeaderVertical]: t("menu.headerVertical"),
          [MenuType.HeaderHorizontal]: t("menu.headerHorizontal"),
          [MenuType.Footer]: t("menu.footer"),
          [MenuType.FooterBottom]: t("menu.footerBottom"),
        };
        return types[params.value as MenuType] || params.value;
      },
    },
    {
      field: "link",
      headerName: t("menu.link"),
      filterType: "input",
      flex: 1,
    },
    {
      field: "sortOrder",
      headerName: t("menu.sortOrder"),
      width: 100,
    },
  ];

  const tabItems = [
    { label: t("menu.headerHorizontal"), key: MenuType.HeaderHorizontal.toString() },
    { label: t("menu.headerVertical"), key: MenuType.HeaderVertical.toString() },
    { label: t("menu.footer"), key: MenuType.Footer.toString() },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
        className="bg-white px-4 pt-2 rounded-lg shadow-sm"
      />
      <CoreDataTable
        ref={gridRef}
        columnDefs={columnDefs}
        title={t("menu.listTitle")}
        columnStateName={LocalStorageEnum.CategoryManagementColumnState + "_menu"}
        fetchUrl={`/api/menus?type=${activeTab}`}
        isBookingApi
        hasExport
        transformData={(data) => {
          const items = data?.items || [];
          const treeItems = buildTreeFromFlat(items);
          return flattenMenus(treeItems);
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
        <MenuFormModal
          open={isOpenFormModal}
          mode={formMode}
          menu={selectedMenu}
          defaultType={Number(activeTab) as MenuType}
          onClose={() => setIsOpenFormModal(false)}
          onSuccess={() => setRefetchObject({})}
        />
      )}
    </div>
  );
};

export default MenuManagement;
