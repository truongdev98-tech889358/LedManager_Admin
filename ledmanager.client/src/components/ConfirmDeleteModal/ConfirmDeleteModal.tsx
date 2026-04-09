import CoreModal from "../CoreModal/CoreModal";
import { CircleQuestionMark } from "lucide-react";
import CoreText from "../CoreText/CoreText";
import { t } from "i18next";
import CoreButton from "../CoreButton/CoreButton";
import { useState } from "react";

interface IProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ConfirmDeleteModal = (props: IProps) => {
  const { open, onClose, onConfirm } = props;
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <CoreModal
      centered
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <CoreButton onClick={onClose}>{t("common.cancel")}</CoreButton>

          <CoreButton variant="solid" color="danger" onClick={handleDelete} loading={loading}>
            {t("common.delete")}
          </CoreButton>
        </div>
      }
      title={t("confirmModal.title")}
    >
      <div className="p-8 flex items-center justify-center">
        <CircleQuestionMark size={48} color="red" />
      </div>

      <div className="text-center">
        <CoreText>{t("confirmModal.message")}</CoreText>
      </div>
    </CoreModal>
  );
};

export default ConfirmDeleteModal;
