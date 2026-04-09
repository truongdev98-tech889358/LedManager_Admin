import { DATE_FORMAT } from "@/configs/constants";
import type { IOption } from "@/configs/types";
import api from "@/services";
import apiUser from "@/services/apiUser";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
  type IHeaderParams,
  type Theme,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Pagination, Spin } from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { ArrowDown, ArrowUp, FileDown, Grid2x2Plus, Plus, RefreshCcw } from "lucide-react";
import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import CoreButton from "../CoreButton/CoreButton";
import CoreDateRangePicker from "../CoreDateRangePicker/CoreDateRangePicker";
import CoreInput from "../CoreInput/CoreInput";
import CoreSelect from "../CoreSelect/CoreSelect";
import CoreText from "../CoreText/CoreText";
import CoreTitle from "../CoreTitle/CoreTitle";
import CoreTooltip from "../CoreTooltip/CoreTooltip";
import style from "./CoreDataTable.module.scss";
import CustomizeModal from "./CustomizeModal";

const myTheme = themeQuartz.withParams({
  wrapperBorder: true,
  headerRowBorder: true,
  rowBorder: { style: "solid", width: 1 },
  columnBorder: { style: "solid" },
});

ModuleRegistry.registerModules([AllCommunityModule]);

export interface IColumnDef extends ColDef {
  filterType?: "input" | "select";
  filterOptions?: IOption<any>[];
  noFilter?: boolean;
  exportFormatter?: (value: any, data: any) => string;
  isNotExport?: boolean;
  isString?: boolean;
  noTooltip?: boolean;
}

export interface IColumnState {
  colId: string;
  headerName: string;
  hide: boolean;
  width: number;
}

interface IProps {
  columnDefs: IColumnDef[];
  fetchUrl: string;
  title: string;
  columnStateName: string;
  height?: number | string;
  filterDateRange?: boolean;
  hasExport?: boolean;
  onAdd?: () => void;
  transformData?: (data: any) => any[];
  refetchObject?: object;
  isBookingApi?: boolean;
  defaultSortConfig?: {
    key: string;
    order: "asc" | "desc" | null;
  };
}

const CoreDataTable = forwardRef((props: IProps, ref: any) => {
  const {
    columnDefs: columnDefsRaw,
    fetchUrl,
    title,
    columnStateName,
    filterDateRange = false,
    hasExport,
    onAdd,
    transformData,
    refetchObject,
    isBookingApi = false,
    defaultSortConfig = { key: "", order: null },
  } = props;
  const gridRef = useRef<AgGridReact>(null);
  const { t } = useTranslation();

  const [filter, setFilter] = useState<{ [key: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: "asc" | "desc" | null;
  }>(defaultSortConfig);
  const [isOpenCustomizeModal, setIsOpenCustomizeModal] = useState(false);
  const [columnState, setColumnState] = useState<IColumnState[]>([]);
  const [dateRange, setDateRange] = useState<string[]>([
    dayjs().add(-1, "d").format(DATE_FORMAT),
    dayjs().format(DATE_FORMAT),
  ]);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredAndSortedData = useMemo(() => {
    return data;
  }, [data]);

  const defaultColumnDefs: ColDef = useMemo(
    () => ({
      flex: 0,
      sortable: false,
      resizable: true,
      minWidth: 100,
    }),
    [],
  );

  const theme = useMemo<Theme | "legacy">(() => {
    return myTheme;
  }, []);

  const columnDefs = useMemo(() => {
    if (!columnState) return [];

    const columnMap = {};
    columnState.forEach((col, index) => {
      columnMap[col.colId] = {
        index,
        hide: col.hide,
        width: col.width,
      };
    });

    return [...columnDefsRaw]
      .sort((a, b) => columnMap[a.field ?? ""]?.index - columnMap[b.field ?? ""]?.index)
      .map(
        (column: any) =>
          ({
            ...column,
            hide: columnMap[column.field ?? ""]?.hide,
            filterType: undefined,
            filterOptions: undefined,
            width: columnMap[column.field ?? ""]?.width,
            pinned: column.field === "action" ? "right" : undefined,
            headerComponent: (params: IHeaderParams) => {
              let filterElm: ReactNode;
              switch (column.filterType) {
                case "input":
                  filterElm = (
                    <CoreInput
                      id={`filter-${column.field}`}
                      className="flex-1"
                      style={{ width: "100%" }}
                      debounceTime={300}
                      placeholder={t("common.filter")}
                      defaultValue={filter[column.field as string] || ""}
                      onKeyDown={(e) => {
                        if ((e as any).isComposing) {
                          return;
                        }
                        const value = (e.target as HTMLInputElement).value;
                        if (e.key === "Enter") {
                          handleInputChange(column, value);
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          handleInputChange(column, "");
                        }
                      }}
                      onClear={() => {
                        handleInputChange(column, "");
                      }}
                      allowClear
                    />
                  );
                  break;
                case "select":
                  filterElm = (
                    <CoreSelect
                      id={`filter-${column.field}`}
                      className="flex-1"
                      style={{ width: "100%" }}
                      options={column.filterOptions}
                      value={filter[column.field as string] || ""}
                      onChange={(value) => {
                        setFilter((prev) => ({
                          ...prev,
                          [column.field as string]: value || "",
                        }));
                      }}
                    />
                  );
                  break;
                default:
                  filterElm = null;
                  break;
              }

              const handleSortClick = () => {
                setSortConfig((prev) => {
                  if (prev.key !== column.field) {
                    return { key: column.field as string, order: "asc" };
                  }
                  if (prev.order === "asc") {
                    return { key: column.field as string, order: "desc" };
                  }
                  if (prev.order === "desc") {
                    return { key: "", order: null };
                  }
                  return { key: column.field as string, order: "asc" };
                });
              };

              const isSorted = sortConfig.key === column.field;
              const icon =
                isSorted && sortConfig.order === "asc" ? (
                  <ArrowUp size={18} />
                ) : isSorted && sortConfig.order === "desc" ? (
                  <ArrowDown size={18} />
                ) : null;

              return (
                <div className="flex flex-col gap-1 flex-1 w-full">
                  <div
                    className="flex items-center justify-center gap-1 cursor-pointer select-none"
                    onClick={handleSortClick}
                  >
                    <CoreTooltip arrow={false} title={params.displayName}>
                      <CoreText className="overflow-hidden text-ellipsis">
                        {params.displayName}
                      </CoreText>
                    </CoreTooltip>

                    <div className="shrink-0">{icon}</div>
                  </div>

                  {!column.noFilter && filterElm}
                </div>
              );
            },
            cellRenderer: (params: ICellRendererParams) => {
              return (
                <CoreTooltip
                  arrow={false}
                  title={
                    column.noTooltip
                      ? ""
                      : column.exportFormatter
                        ? column.exportFormatter(params.value, params.data)
                        : column.valueFormatter
                          ? column.valueFormatter(params)
                          : params.value
                  }
                >
                  {column.cellRenderer
                    ? column.cellRenderer(params)
                    : column.valueFormatter
                      ? column.valueFormatter(params)
                      : params.value}
                </CoreTooltip>
              );
            },
          }) as IColumnDef,
      );
  }, [columnDefsRaw, sortConfig, columnState, filter, t]);

  useEffect(() => {
    handleInitColumnState();
  }, []);

  useEffect(() => {
    setPageIndex(1);
  }, [filter, sortConfig, dateRange, fetchUrl]);

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 100);
  }, [pageIndex, pageSize, refetchObject, fetchUrl, dateRange, filter, sortConfig]);

  const handleInitColumnState = () => {
    const columnStateStorage = localStorage.getItem(columnStateName);
    if (columnStateStorage) {
      const parsed = JSON.parse(columnStateStorage);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setColumnState(parsed);
      } else {
        const colState = columnDefsRaw.map(
          (col) =>
            ({
              colId: col.field,
              hide: false,
              headerName: col.headerName,
              width: col.width ?? 100,
            }) as IColumnState,
        );
        setColumnState(colState);
      }
    } else {
      const colState = columnDefsRaw.map(
        (col) =>
          ({
            colId: col.field,
            hide: false,
            headerName: col.headerName,
            width: col.width ?? 100,
          }) as IColumnState,
      );
      setColumnState(colState);
      localStorage.setItem(columnStateName, JSON.stringify(colState));
    }
  };

  const fetchData = async () => {
    gridRef.current?.api?.setGridOption("loading", true);

    try {
      const keyword = Object.values(filter).filter(v => v).join(" ");
      const params: any = {
        PageIndex: pageIndex,
        PageSize: pageSize,
        Keyword: keyword,
        SortLabel: sortConfig.key,
        IsAscending: sortConfig.order === "asc",
      };

      if (filterDateRange) {
        params.startDate = dateRange[0];
        params.endDate = dateRange[1];
      }

      const res = isBookingApi
        ? await api.get(fetchUrl, { params })
        : await apiUser.get(fetchUrl, { params });

      const resData = res.data;
      if (resData && typeof resData === "object" && "items" in resData) {
        setData(transformData ? transformData(resData) : resData.items);
        setTotalCount(resData.totalCount ?? 0);
      } else {
        setData(transformData ? transformData(resData) : resData);
        setTotalCount(Array.isArray(resData) ? resData.length : 0);
      }
    } catch (error) {
      console.log({ error });
    } finally {
      gridRef.current?.api?.setGridOption("loading", false);
    }
  };

  const handleFocus = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
    }
  };

  const handleInputChange = (column: IColumnDef, value: string) => {
    setFilter((prev) => ({ ...prev, [column.field as string]: value }));
    setTimeout(() => {
      handleFocus(`filter-${column.field}`);
    }, 100);
  };

  const saveColumnState = (event: any) => {
    if (!event.finished) return;
    if (!gridRef.current) return;
    const state = gridRef.current?.api?.getColumnState();

    const headerNameMap = {};
    columnDefs.forEach((col) => {
      headerNameMap[col.field ?? ""] = col.headerName;
    });
    const colState = state.map(
      (c) =>
        ({
          colId: c.colId,
          hide: !!c.hide,
          headerName: headerNameMap[c.colId],
          width: c.width ?? 100,
        }) as IColumnState,
    );

    localStorage.setItem(columnStateName, JSON.stringify(colState));
    setColumnState(colState);
  };

  const onGridReady = (params: any) => {
    gridRef.current = params;
  };

  const handleResetColumnState = () => {
    const colState = columnDefsRaw.map(
      (col) =>
        ({
          colId: col.field,
          hide: false,
          headerName: col.headerName,
          width: col.width ?? 100,
        }) as IColumnState,
    );
    setColumnState(colState);
    localStorage.setItem(columnStateName, JSON.stringify(colState));
  };

  const handleExport = () => {
    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columnDefs.forEach((col) => {
      if (col.isNotExport) return;
      const th = document.createElement("th");
      th.textContent = col.headerName ?? "";
      th.style.width = (col.width ? col.width + "px" : "auto") as string;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    filteredAndSortedData.forEach((row: any) => {
      const tr = document.createElement("tr");
      columnDefs.forEach((col) => {
        if (col.isNotExport) return;
        const td = document.createElement("td");
        const rawValue = row[col.field ?? ""];
        const value: string = col.exportFormatter
          ? col.exportFormatter(rawValue, row)
          : (rawValue ?? "");
        td.textContent = (col.isString ? "\u200B" : "") + value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const worksheet = XLSX.utils.table_to_sheet(table);

    // 👉 SET COLUMN WIDTH
    worksheet["!cols"] = columnDefs
      .filter((col) => !col.isNotExport)
      .map((col) => ({
        wpx: (col.width ?? 100) * 0.8,
      }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      file,
      `${title} ${dayjs(dateRange[0]).format("YYYYMMDD")} - ${dayjs(dateRange[1]).format("YYYYMMDD")}.xlsx`,
    );
  };

  return (
    <div className={`${style["core-data-table"]} flex-1 flex flex-col min-h-0`}>
      <div className="py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <CoreTitle level={4}>{title}</CoreTitle>

        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
          {/* <CoreCheckbox 
          >
            {t("dataTable.includeDeleted")}
          </CoreCheckbox> */}

          {filterDateRange && (
            <div className="w-full sm:w-[240px]">
              <CoreDateRangePicker
                allowClear={false}
                value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
                onChange={(e) => {
                  if (!e) return;
                  setDateRange([dayjs(e[0]).format(DATE_FORMAT), dayjs(e[1]).format(DATE_FORMAT)]);
                }}
              />
            </div>
          )}

          <div className="flex gap-2">
            <CoreTooltip title={t("common.refresh")}>
              <CoreButton
                color="blue"
                variant="solid"
                icon={<RefreshCcw size={18} />}
                onClick={fetchData}
              ></CoreButton>
            </CoreTooltip>

            <CoreTooltip title={t("common.customize")} placement="topRight">
              <CoreButton
                color="red"
                variant="solid"
                icon={<Grid2x2Plus size={18} />}
                onClick={() => setIsOpenCustomizeModal(true)}
              ></CoreButton>
            </CoreTooltip>
          </div>

          {hasExport && (
            <CoreButton
              color="green"
              variant="solid"
              icon={<FileDown size={18} />}
              onClick={handleExport}
            >
              {t("common.export")}
            </CoreButton>
          )}
          {onAdd && (
            <CoreButton color="green" variant="solid" icon={<Plus size={18} />} onClick={onAdd}>
              {t("common.add")}
            </CoreButton>
          )}
        </div>
      </div>

      <div className="ag-theme-quartz flex-1 min-h-0">
        <AgGridReact
          ref={ref}
          theme={theme}
          getRowId={(row) => row.data.id + ""}
          defaultColDef={defaultColumnDefs}
          rowData={filteredAndSortedData}
          columnDefs={columnDefs}
          headerHeight={70}
          onGridReady={onGridReady}
          onColumnMoved={saveColumnState}
          onColumnResized={saveColumnState}
          components={{
            customLoadingOverlay: () => <Spin size="large" />,
          }}
          loadingOverlayComponent="customLoadingOverlay"
          pagination={false}
        />
      </div>

      <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <CoreText strong className="text-sm">
          {t("common.totalItems", { count: totalCount })}
        </CoreText>
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={totalCount}
          onChange={(page, size) => {
            setPageIndex(page);
            setPageSize(size);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          showSizeChanger
          size="small"
        />
      </div>

      <CustomizeModal
        open={isOpenCustomizeModal}
        onClose={() => setIsOpenCustomizeModal(false)}
        columnState={columnState}
        setColumnState={setColumnState}
        handleResetColumnState={handleResetColumnState}
        columnStateName={columnStateName}
      />
    </div>
  );
});

export default CoreDataTable;
