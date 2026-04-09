import { CoreModal } from "@/components";
import { t } from "i18next";
import { HistoryTypeEnum } from "../configs/constants";
import CoreHistory from "./CoreHistory";

interface IProps {
  open: boolean;
  onClose: () => void;
  id: number | undefined;
  type: HistoryTypeEnum;
}

const HistoryModal = (props: IProps) => {
  const { open, onClose, id, type } = props;

  return (
    <CoreModal title={t("common.history")} open={open} onCancel={onClose} footer={null} width={800}>
      <CoreHistory id={id} type={type} />
    </CoreModal>
  );
};

export default HistoryModal;
