import { CoreButton, CoreInput, CoreTable } from "@/components";
import { DATE_TIME_DISPLAY2 } from "@/configs/constants";
import { toClientTime } from "@/utils/helper";
import { Spin } from "antd";
import type { TableProps } from "antd/lib";
import { t } from "i18next";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { addHistory, getHistories } from "../apis";
import { HistoryTypeEnum } from "../configs/constants";
import type { IHistoryResponse, IHistoryRequest } from "../configs/types";

interface IProps {
  id: number | undefined;
  type: HistoryTypeEnum;
  isShowAdd?: boolean;
  isRefetchHistory?: boolean
}

const CoreHistory = (props: IProps) => {
  const { id, type, isShowAdd = true, isRefetchHistory } = props;

  const [histories, setHistories] = useState<IHistoryResponse | undefined | null>(undefined);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistories();
  }, [isRefetchHistory]);

  const columns: TableProps["columns"] = [
    {
      key: "description",
      title: t("dataTable.description"),
      dataIndex: "description",
      width: "50%",
      render: (value) => <span className="whitespace-pre-wrap">{value}</span>,
    },
    {
      key: "performedAt",
      title: t("dataTable.performedAt"),
      dataIndex: "createdAt",
      width: "25%",
      render: (value) => (value ? toClientTime(value).format(DATE_TIME_DISPLAY2) : ""),
    },
    {
      key: "performedBy",
      title: t("dataTable.performedBy"),
      dataIndex: "performedBy",
      width: "25%",
    },
  ];

  const fetchHistories = async () => {
    if (!id) return;
    setHistories(undefined);
    const data = await getHistories({
      id,
      type,
    });
    setHistories(data);
  };

  const handleAddNote = async () => {
    setLoading(true);
    const payload: IHistoryRequest = {
      entityId: id ?? 0,
      entityType: type,
      description: note,
      metadata: "",
      level: 1,
      actionType: "NOTE",
    };
    const data = await addHistory(payload);
    if (data) {
      setNote("");
      fetchHistories();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[60vh] overflow-y-auto">
        {histories ? (
          <CoreTable
            dataSource={histories?.histories ?? []}
            columns={columns}
            pagination={false}
          />
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <Spin size="large" />
          </div>
        )}
      </div>

      {isShowAdd && (
        <div className="flex items-center gap-4">
          <CoreInput
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("historyModal.notePlaceholder")}
            onPressEnter={handleAddNote}
          />

          <CoreButton
            type="primary"
            icon={<Plus size={18} />}
            disabled={!note.trim().length}
            loading={loading}
            onClick={handleAddNote}
          >
            {t("historyModal.addNote")}
          </CoreButton>
        </div>
      )}
    </div>
  );
};

export default CoreHistory;
