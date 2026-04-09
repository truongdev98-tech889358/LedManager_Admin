import { Move } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { ReactSortable } from "react-sortablejs";
import CoreButton from "../CoreButton/CoreButton";
import CoreCard from "../CoreCard/CoreCard";
import CoreCheckbox from "../CoreCheckbox/CoreCheckbox";
import CoreModal from "../CoreModal/CoreModal";
import type { IColumnState } from "./CoreDataTable";

interface IProps {
  open: boolean;
  onClose: () => void;
  columnState: IColumnState[];
  setColumnState: Dispatch<SetStateAction<IColumnState[]>>;
  handleResetColumnState: () => void;
  columnStateName: string;
}

const CustomizeModal = (props: IProps) => {
  const { open, onClose, columnState, setColumnState, handleResetColumnState, columnStateName } =
    props;
  const { t } = useTranslation();

  const handleHideChange = (colId: string, hide: boolean) => {
    const newState = columnState.map((col) => (col.colId === colId ? { ...col, hide } : col));
    console.log({ newState });

    setColumnState(newState);
    localStorage.setItem(columnStateName, JSON.stringify(newState));
  };

  const handleDragColumn = (sorted: IColumnState[]) => {
    const columnOrderMap = {};
    sorted.forEach((col, index) => {
      columnOrderMap[col.colId] = index;
    });
    const newColumnState = [...columnState].sort(
      (a, b) => columnOrderMap[a.colId] - columnOrderMap[b.colId],
    );

    setColumnState(newColumnState);
    localStorage.setItem(columnStateName, JSON.stringify(newColumnState));
  };

  return (
    <CoreModal
      open={open}
      onCancel={onClose}
      title={t("dataTable.customizeModal.title")}
      footer={
        <div className="flex justify-end gap-2">
          <CoreButton variant="solid" color="danger" onClick={handleResetColumnState}>
            {t("common.reset")}
          </CoreButton>

          <CoreButton onClick={onClose}>{t("common.close")}</CoreButton>
        </div>
      }
    >
      <div className="mt-4">
        <div className="max-h-[500px] overflow-auto">
          <ReactSortable
            list={columnState.map((col, index) => ({ ...col, id: index }))}
            setList={(e) => {
              handleDragColumn(e);
            }}
            className="flex flex-col gap-2"
          >
            {columnState
              .map((col, index) => ({ ...col, id: index }))
              .map((col) => (
                <CoreCard
                  key={col.id}
                  styles={{
                    body: {
                      padding: "4px 8px",
                    },
                  }}
                >
                  <div className="flex justify-between items-center">
                    <CoreCheckbox
                      checked={!col.hide}
                      onChange={(e) => {
                        handleHideChange(col.colId, !e.target.checked);
                      }}
                    >
                      {col.headerName}
                    </CoreCheckbox>

                    <Move size={18} className="cursor-grab" />
                  </div>
                </CoreCard>
              ))}
          </ReactSortable>
        </div>
      </div>
    </CoreModal>
  );
};

export default CustomizeModal;
